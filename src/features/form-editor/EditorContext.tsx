/* eslint-disable react-refresh/only-export-components */
// Import React tools we need
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
// Import our reducer (the brain that handles state changes)
import { editorReducer, ACTIONS, type EditorAction } from "./editorReducer";
// Import types and configuration
import type {
  EditorState,
  EditorBlock,
  EditorSection,
  BlockType,
} from "./editorConfig";
import {
  getInitialState,
  getDefaultBlockProps,
  createSection,
} from "./editorConfig";
import { v4 as uuidv4 } from "uuid"; // Tool to generate unique IDs
// Import error recovery tools
import {
  emergencySave,
  getEmergencySave,
  clearEmergencySave,
} from "./components";

// Key for saving editor content to browser storage
const AUTO_SAVE_KEY = "editor_autosave";

// Clipboard for copy/paste - stored outside React so it doesn't cause re-renders
// This lets us copy a block and paste it even after the component re-renders
let _clipboardBlock: EditorBlock | null = null;

// Helper type to describe where a block is located
interface BlockLocation {
  section: EditorSection;    // Which section contains the block
  columnIndex: number;        // Which column (0, 1, or 2)
  blockIndex: number;         // Position in the column
  block: EditorBlock;         // The block itself
}

// This defines all the functions and data we can access from the editor
// Think of this as the "toolbox" that components can use
interface EditorContextValue {
  state: EditorState;                                    // Current editor state
  dispatch: React.Dispatch<EditorAction>;                // Send actions to reducer
  addBlock: (type: BlockType, sectionId: string, columnIndex: number, index?: number) => string;
  removeBlock: (blockId: string) => void;                // Delete a block
  updateBlock: (blockId: string, updates: Partial<EditorBlock>) => void;  // Change block (no history)
  updateBlockWithHistory: (blockId: string, updates: Partial<EditorBlock>) => void;  // Change block (with undo)
  updateSection: (sectionId: string, updates: Partial<EditorSection>) => void;
  updateSectionWithHistory: (sectionId: string, updates: Partial<EditorSection>) => void;
  moveBlock: (blockId: string, toSectionId: string, toColumnIndex: number, toIndex?: number) => void;
  reorderBlocks: (sectionId: string, columnIndex: number, oldIndex: number, newIndex: number) => void;
  reorderSections: (oldIndex: number, newIndex: number) => void;
  selectBlock: (blockId: string | null) => void;         // Select a block (shows in inspector)
  selectSection: (sectionId: string | null) => void;     // Select a section
  duplicateBlock: (blockId: string) => void;             // Copy a block
  togglePreview: () => void;                             // Switch edit/preview mode
  setZoom: (zoom: number) => void;                       // Change zoom level
  setDragging: (isDragging: boolean) => void;            // Track drag state
  addSection: (columns: 1 | 2 | 3, index?: number) => string;  // Add new section
  removeSection: (sectionId: string) => void;            // Delete a section
  undo: () => void;                                      // Go back one step
  redo: () => void;                                      // Go forward one step
  findBlock: (blockId: string) => BlockLocation | null;  // Find where a block is
  getSelectedBlock: () => EditorBlock | null;            // Get currently selected block
  getSelectedSection: () => EditorSection | null;        // Get currently selected section
}

// Create the context (empty at first, filled by EditorProvider)
const EditorContext = createContext<EditorContextValue | null>(null);

// Function to load saved content when app starts
function loadInitialSections() {
  // Step 1: Check if we have an emergency save (from a crash)
  const emergency = getEmergencySave();
  if (emergency) {
    clearEmergencySave(); // Clear it so we don't load it again
    console.info("[Editor] Restored from emergency save");
    return emergency.sections;
  }
  // 2. Check for regular auto-save
  try {
    const raw = localStorage.getItem(AUTO_SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.sections?.length > 0) return saved.sections;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const base = getInitialState();
  const savedSections = loadInitialSections();
  const initialSections = savedSections ?? base.sections;
  const initialState = { ...base, sections: initialSections };
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    history: [JSON.parse(JSON.stringify(initialSections))],
    historyIndex: 0,
  });

  const pushHistoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pushHistoryRef = useRef<(debounce?: boolean) => void>(() => {});

  // pushHistory(true) — debounced (used for inspector text/slider changes)
  // pushHistory()    — immediate (used for add/remove/move/duplicate)
  const pushHistory = useCallback((debounce = false) => {
    if (debounce) {
      if (pushHistoryTimerRef.current)
        clearTimeout(pushHistoryTimerRef.current);
      pushHistoryTimerRef.current = setTimeout(() => {
        dispatch({ type: ACTIONS.PUSH_HISTORY });
      }, 400);
    } else {
      if (pushHistoryTimerRef.current) {
        clearTimeout(pushHistoryTimerRef.current);
        pushHistoryTimerRef.current = null;
      }
      dispatch({ type: ACTIONS.PUSH_HISTORY });
    }
  }, []);

  useEffect(() => {
    pushHistoryRef.current = pushHistory;
  }, [pushHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isPreviewMode) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: ACTIONS.UNDO });
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        dispatch({ type: ACTIONS.REDO });
      }
      if (e.key === "Delete" && state.selectedBlockId) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        )
          return;
        e.preventDefault();
        dispatch({
          type: ACTIONS.REMOVE_BLOCK,
          payload: state.selectedBlockId,
        });
        pushHistoryRef.current();
      }
      if (e.key === "Escape") {
        dispatch({ type: ACTIONS.SELECT_BLOCK, payload: null });
      }
      // Copy selected block
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && state.selectedBlockId) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        )
          return;
        // Find and deep-clone the block
        for (const section of state.sections) {
          for (const col of section.blocks) {
            const found = col.find((b) => b.id === state.selectedBlockId);
            if (found) {
              _clipboardBlock = JSON.parse(JSON.stringify(found));
              break;
            }
          }
          if (_clipboardBlock) break;
        }
      }
      // Paste copied block
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && _clipboardBlock) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        )
          return;
        e.preventDefault();
        // Give the pasted block a fresh ID
        const pasted: EditorBlock = {
          ..._clipboardBlock,
          id: uuidv4(),
        } as EditorBlock;
        // Find location of currently selected block to paste after it, else first col of first section
        let targetSectionId: string | null = null;
        let targetColumnIndex = 0;
        let targetIndex: number | undefined;
        if (state.selectedBlockId) {
          outer: for (const section of state.sections) {
            for (let ci = 0; ci < section.blocks.length; ci++) {
              const idx = section.blocks[ci].findIndex(
                (b) => b.id === state.selectedBlockId,
              );
              if (idx !== -1) {
                targetSectionId = section.id;
                targetColumnIndex = ci;
                targetIndex = idx + 1;
                break outer;
              }
            }
          }
        }
        if (!targetSectionId && state.sections.length > 0) {
          targetSectionId = state.sections[0].id;
          targetColumnIndex = 0;
          targetIndex = undefined;
        }
        if (targetSectionId) {
          dispatch({
            type: ACTIONS.ADD_BLOCK,
            payload: {
              sectionId: targetSectionId,
              columnIndex: targetColumnIndex,
              block: pasted,
              index: targetIndex,
            },
          });
          pushHistoryRef.current();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isPreviewMode, state.selectedBlockId, state.sections]);

  // Auto-save sections to localStorage on every change (debounced 1s)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          AUTO_SAVE_KEY,
          JSON.stringify({ sections: state.sections, savedAt: Date.now() }),
        );
        // Also keep emergency save in sync so ErrorBoundary can restore it
        emergencySave(state.sections);
      } catch {
        /* quota exceeded */
      }
    }, 1000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [state.sections]);

  const addBlock = useCallback(
    (
      type: BlockType,
      sectionId: string,
      columnIndex: number,
      index?: number,
    ) => {
      const block = getDefaultBlockProps(type);
      dispatch({
        type: ACTIONS.ADD_BLOCK,
        payload: { sectionId, columnIndex, block, index },
      });
      pushHistoryRef.current();
      return block.id;
    },
    [],
  );

  const removeBlock = useCallback((blockId: string) => {
    dispatch({ type: ACTIONS.REMOVE_BLOCK, payload: blockId });
    pushHistoryRef.current();
  }, []);

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<EditorBlock>) => {
      dispatch({ type: ACTIONS.UPDATE_BLOCK, payload: { blockId, updates } });
    },
    [],
  );

  const updateBlockWithHistory = useCallback(
    (blockId: string, updates: Partial<EditorBlock>) => {
      dispatch({ type: ACTIONS.UPDATE_BLOCK, payload: { blockId, updates } });
      // Debounce history push for inspector edits (sliders, text inputs fire rapidly)
      pushHistoryRef.current(true);
    },
    [],
  );

  const updateSection = useCallback(
    (sectionId: string, updates: Partial<EditorSection>) => {
      dispatch({
        type: ACTIONS.UPDATE_SECTION,
        payload: { sectionId, updates },
      });
    },
    [],
  );

  const updateSectionWithHistory = useCallback(
    (sectionId: string, updates: Partial<EditorSection>) => {
      dispatch({
        type: ACTIONS.UPDATE_SECTION,
        payload: { sectionId, updates },
      });
      pushHistoryRef.current(true);
    },
    [],
  );

  const moveBlock = useCallback(
    (
      blockId: string,
      toSectionId: string,
      toColumnIndex: number,
      toIndex?: number,
    ) => {
      dispatch({
        type: ACTIONS.MOVE_BLOCK,
        payload: { blockId, toSectionId, toColumnIndex, toIndex },
      });
      pushHistoryRef.current();
    },
    [],
  );

  const reorderBlocks = useCallback(
    (
      sectionId: string,
      columnIndex: number,
      oldIndex: number,
      newIndex: number,
    ) => {
      dispatch({
        type: ACTIONS.REORDER_BLOCKS,
        payload: { sectionId, columnIndex, oldIndex, newIndex },
      });
      pushHistoryRef.current();
    },
    [],
  );

  const reorderSections = useCallback((oldIndex: number, newIndex: number) => {
    dispatch({
      type: ACTIONS.REORDER_SECTIONS,
      payload: { oldIndex, newIndex },
    });
    pushHistoryRef.current();
  }, []);

  const selectBlock = useCallback((blockId: string | null) => {
    dispatch({ type: ACTIONS.SELECT_BLOCK, payload: blockId });
  }, []);

  const selectSection = useCallback((sectionId: string | null) => {
    dispatch({ type: ACTIONS.SELECT_SECTION, payload: sectionId });
  }, []);

  const duplicateBlock = useCallback((blockId: string) => {
    dispatch({ type: ACTIONS.DUPLICATE_BLOCK, payload: { blockId } });
    pushHistoryRef.current();
  }, []);

  const togglePreview = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_PREVIEW });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: ACTIONS.SET_ZOOM, payload: zoom });
  }, []);

  const setDragging = useCallback((isDragging: boolean) => {
    dispatch({ type: ACTIONS.SET_DRAGGING, payload: isDragging });
  }, []);

  const addSection = useCallback((columns: 1 | 2 | 3, index?: number) => {
    const section = createSection(columns);
    dispatch({ type: ACTIONS.ADD_SECTION, payload: { section, index } });
    dispatch({ type: ACTIONS.SELECT_SECTION, payload: section.id });
    pushHistoryRef.current();
    return section.id;
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    dispatch({ type: ACTIONS.REMOVE_SECTION, payload: sectionId });
    pushHistoryRef.current();
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: ACTIONS.UNDO });
  }, []);
  const redo = useCallback(() => {
    dispatch({ type: ACTIONS.REDO });
  }, []);

  const findBlock = useCallback(
    (blockId: string): BlockLocation | null => {
      for (const section of state.sections) {
        for (let ci = 0; ci < section.blocks.length; ci++) {
          const idx = section.blocks[ci].findIndex((b) => b.id === blockId);
          if (idx !== -1) {
            return {
              section,
              columnIndex: ci,
              blockIndex: idx,
              block: section.blocks[ci][idx],
            };
          }
        }
      }
      return null;
    },
    [state.sections],
  );

  const getSelectedBlock = useCallback((): EditorBlock | null => {
    if (!state.selectedBlockId) return null;
    return findBlock(state.selectedBlockId)?.block || null;
  }, [state.selectedBlockId, findBlock]);

  const getSelectedSection = useCallback((): EditorSection | null => {
    if (!state.selectedSectionId) return null;
    return state.sections.find((s) => s.id === state.selectedSectionId) || null;
  }, [state.selectedSectionId, state.sections]);

  const value: EditorContextValue = useMemo(
    () => ({
      state,
      dispatch,
      addBlock,
      removeBlock,
      updateBlock,
      updateBlockWithHistory,
      updateSection,
      updateSectionWithHistory,
      moveBlock,
      reorderBlocks,
      reorderSections,
      selectBlock,
      selectSection,
      duplicateBlock,
      togglePreview,
      setZoom,
      setDragging,
      addSection,
      removeSection,
      undo,
      redo,
      findBlock,
      getSelectedBlock,
      getSelectedSection,
    }),
    [
      state,
      dispatch,
      addBlock,
      removeBlock,
      updateBlock,
      updateBlockWithHistory,
      updateSection,
      updateSectionWithHistory,
      moveBlock,
      reorderBlocks,
      reorderSections,
      selectBlock,
      selectSection,
      duplicateBlock,
      togglePreview,
      setZoom,
      setDragging,
      addSection,
      removeSection,
      undo,
      redo,
      findBlock,
      getSelectedBlock,
      getSelectedSection,
    ],
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within EditorProvider");
  return context;
}

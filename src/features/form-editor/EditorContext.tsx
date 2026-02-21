import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo, type ReactNode } from 'react';
import { editorReducer, ACTIONS, type EditorAction } from './editorReducer';
import type { EditorState, EditorBlock, EditorSection, BlockType } from './editorConfig';
import { getInitialState, getDefaultBlockProps, createSection } from './editorConfig';

interface BlockLocation {
  section: EditorSection;
  columnIndex: number;
  blockIndex: number;
  block: EditorBlock;
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  addBlock: (type: BlockType, sectionId: string, columnIndex: number, index?: number) => string;
  removeBlock: (blockId: string) => void;
  updateBlock: (blockId: string, updates: Partial<EditorBlock>) => void;
  updateBlockWithHistory: (blockId: string, updates: Partial<EditorBlock>) => void;
  moveBlock: (blockId: string, toSectionId: string, toColumnIndex: number, toIndex?: number) => void;
  reorderBlocks: (sectionId: string, columnIndex: number, oldIndex: number, newIndex: number) => void;
  reorderSections: (oldIndex: number, newIndex: number) => void;
  selectBlock: (blockId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  duplicateBlock: (blockId: string) => void;
  togglePreview: () => void;
  setZoom: (zoom: number) => void;
  setDragging: (isDragging: boolean) => void;
  addSection: (columns: 1 | 2 | 3, index?: number) => string;
  removeSection: (sectionId: string) => void;
  undo: () => void;
  redo: () => void;
  findBlock: (blockId: string) => BlockLocation | null;
  getSelectedBlock: () => EditorBlock | null;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const initialState = getInitialState();
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    history: [JSON.parse(JSON.stringify(initialState.sections))],
    historyIndex: 0,
  });

  const pushHistoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushHistoryRef = useRef<(debounce?: boolean) => void>(() => {});

  // pushHistory(true) — debounced (used for inspector text/slider changes)
  // pushHistory()    — immediate (used for add/remove/move/duplicate)
  const pushHistory = useCallback((debounce = false) => {
    if (debounce) {
      if (pushHistoryTimerRef.current) clearTimeout(pushHistoryTimerRef.current);
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
  pushHistoryRef.current = pushHistory;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isPreviewMode) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: ACTIONS.UNDO });
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: ACTIONS.REDO });
      }
      if (e.key === 'Delete' && state.selectedBlockId) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        dispatch({ type: ACTIONS.REMOVE_BLOCK, payload: state.selectedBlockId });
        pushHistoryRef.current();
      }
      if (e.key === 'Escape') {
        dispatch({ type: ACTIONS.SELECT_BLOCK, payload: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPreviewMode, state.selectedBlockId]);

  const addBlock = useCallback((type: BlockType, sectionId: string, columnIndex: number, index?: number) => {
    const block = getDefaultBlockProps(type);
    dispatch({ type: ACTIONS.ADD_BLOCK, payload: { sectionId, columnIndex, block, index } });
    pushHistoryRef.current();
    return block.id;
  }, []);

  const removeBlock = useCallback((blockId: string) => {
    dispatch({ type: ACTIONS.REMOVE_BLOCK, payload: blockId });
    pushHistoryRef.current();
  }, []);

  const updateBlock = useCallback((blockId: string, updates: Partial<EditorBlock>) => {
    dispatch({ type: ACTIONS.UPDATE_BLOCK, payload: { blockId, updates } });
  }, []);

  const updateBlockWithHistory = useCallback((blockId: string, updates: Partial<EditorBlock>) => {
    dispatch({ type: ACTIONS.UPDATE_BLOCK, payload: { blockId, updates } });
    // Debounce history push for inspector edits (sliders, text inputs fire rapidly)
    pushHistoryRef.current(true);
  }, []);

  const moveBlock = useCallback((blockId: string, toSectionId: string, toColumnIndex: number, toIndex?: number) => {
    dispatch({ type: ACTIONS.MOVE_BLOCK, payload: { blockId, toSectionId, toColumnIndex, toIndex } });
    pushHistoryRef.current();
  }, []);

  const reorderBlocks = useCallback((sectionId: string, columnIndex: number, oldIndex: number, newIndex: number) => {
    dispatch({ type: ACTIONS.REORDER_BLOCKS, payload: { sectionId, columnIndex, oldIndex, newIndex } });
    pushHistoryRef.current();
  }, []);

  const reorderSections = useCallback((oldIndex: number, newIndex: number) => {
    dispatch({ type: ACTIONS.REORDER_SECTIONS, payload: { oldIndex, newIndex } });
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
    pushHistoryRef.current();
    return section.id;
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    dispatch({ type: ACTIONS.REMOVE_SECTION, payload: sectionId });
    pushHistoryRef.current();
  }, []);

  const undo = useCallback(() => { dispatch({ type: ACTIONS.UNDO }); }, []);
  const redo = useCallback(() => { dispatch({ type: ACTIONS.REDO }); }, []);

  const findBlock = useCallback((blockId: string): BlockLocation | null => {
    for (const section of state.sections) {
      for (let ci = 0; ci < section.blocks.length; ci++) {
        const idx = section.blocks[ci].findIndex(b => b.id === blockId);
        if (idx !== -1) {
          return { section, columnIndex: ci, blockIndex: idx, block: section.blocks[ci][idx] };
        }
      }
    }
    return null;
  }, [state.sections]);

  const getSelectedBlock = useCallback((): EditorBlock | null => {
    if (!state.selectedBlockId) return null;
    return findBlock(state.selectedBlockId)?.block || null;
  }, [state.selectedBlockId, findBlock]);

  const value: EditorContextValue = useMemo(() => ({
    state, dispatch, addBlock, removeBlock, updateBlock, updateBlockWithHistory,
    moveBlock, reorderBlocks, reorderSections, selectBlock, selectSection, duplicateBlock,
    togglePreview, setZoom, setDragging, addSection, removeSection,
    undo, redo, findBlock, getSelectedBlock,
  }), [
    state, dispatch, addBlock, removeBlock, updateBlock, updateBlockWithHistory,
    moveBlock, reorderBlocks, reorderSections, selectBlock, selectSection, duplicateBlock,
    togglePreview, setZoom, setDragging, addSection, removeSection,
    undo, redo, findBlock, getSelectedBlock,
  ]);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
}

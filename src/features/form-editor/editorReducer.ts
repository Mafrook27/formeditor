// Import types and tools we need
import type { EditorState, EditorSection, EditorBlock } from "./editorConfig";
import { v4 as uuidv4 } from "uuid"; // Tool to generate unique IDs

// ─── Action types ────────────────────────────────────────────────────
// These are all the different things we can do to change the editor state
// Think of these as commands like "add a block" or "delete a section"
export const ACTIONS = {
  SET_SECTIONS: "SET_SECTIONS",           // Replace all sections (used for import)
  ADD_SECTION: "ADD_SECTION",             // Add a new section (1, 2, or 3 columns)
  REMOVE_SECTION: "REMOVE_SECTION",       // Delete a section
  REORDER_SECTIONS: "REORDER_SECTIONS",   // Move sections up/down
  ADD_BLOCK: "ADD_BLOCK",                 // Add a new block (heading, input, etc.)
  REMOVE_BLOCK: "REMOVE_BLOCK",           // Delete a block
  UPDATE_BLOCK: "UPDATE_BLOCK",           // Change block properties (width, color, text, etc.)
  UPDATE_SECTION: "UPDATE_SECTION",       // Change section properties (columns, padding, etc.)
  MOVE_BLOCK: "MOVE_BLOCK",               // Move block to different section/column
  REORDER_BLOCKS: "REORDER_BLOCKS",       // Reorder blocks within same column
  SELECT_BLOCK: "SELECT_BLOCK",           // Select a block (shows in inspector)
  SELECT_SECTION: "SELECT_SECTION",       // Select a section
  DUPLICATE_BLOCK: "DUPLICATE_BLOCK",     // Copy a block
  TOGGLE_PREVIEW: "TOGGLE_PREVIEW",       // Switch between edit and preview mode
  SET_ZOOM: "SET_ZOOM",                   // Change zoom level (50-150%)
  SET_DRAGGING: "SET_DRAGGING",           // Track if user is dragging something
  UNDO: "UNDO",                           // Go back one step
  REDO: "REDO",                           // Go forward one step
  PUSH_HISTORY: "PUSH_HISTORY",           // Save current state for undo/redo
} as const;

export type EditorAction =
  | { type: typeof ACTIONS.SET_SECTIONS; payload: EditorSection[] }
  | {
      type: typeof ACTIONS.ADD_SECTION;
      payload: { section: EditorSection; index?: number };
    }
  | { type: typeof ACTIONS.REMOVE_SECTION; payload: string }
  | {
      type: typeof ACTIONS.REORDER_SECTIONS;
      payload: { oldIndex: number; newIndex: number };
    }
  | {
      type: typeof ACTIONS.ADD_BLOCK;
      payload: {
        sectionId: string;
        columnIndex: number;
        block: EditorBlock;
        index?: number;
      };
    }
  | { type: typeof ACTIONS.REMOVE_BLOCK; payload: string }
  | {
      type: typeof ACTIONS.UPDATE_BLOCK;
      payload: { blockId: string; updates: Partial<EditorBlock> };
    }
  | {
      type: typeof ACTIONS.UPDATE_SECTION;
      payload: { sectionId: string; updates: Partial<EditorSection> };
    }
  | {
      type: typeof ACTIONS.MOVE_BLOCK;
      payload: {
        blockId: string;
        toSectionId: string;
        toColumnIndex: number;
        toIndex?: number;
      };
    }
  | {
      type: typeof ACTIONS.REORDER_BLOCKS;
      payload: {
        sectionId: string;
        columnIndex: number;
        oldIndex: number;
        newIndex: number;
      };
    }
  | { type: typeof ACTIONS.SELECT_BLOCK; payload: string | null }
  | { type: typeof ACTIONS.SELECT_SECTION; payload: string | null }
  | { type: typeof ACTIONS.DUPLICATE_BLOCK; payload: { blockId: string } }
  | { type: typeof ACTIONS.TOGGLE_PREVIEW }
  | { type: typeof ACTIONS.SET_ZOOM; payload: number }
  | { type: typeof ACTIONS.SET_DRAGGING; payload: boolean }
  | { type: typeof ACTIONS.UNDO }
  | { type: typeof ACTIONS.REDO }
  | { type: typeof ACTIONS.PUSH_HISTORY };

// Maximum number of undo steps we keep (to save memory)
const MAX_HISTORY = 50;

// Main reducer function - this handles ALL state changes in the editor
// Think of it as the "brain" that processes every action and updates the state
// IMPORTANT: We never modify the existing state - we always create new objects
export function editorReducer(
  state: EditorState,      // Current state
  action: EditorAction,    // What we want to do
): EditorState {           // Returns new state
  switch (action.type) {
    // Replace all sections (used when importing HTML)
    case ACTIONS.SET_SECTIONS:
      return { ...state, sections: action.payload };

    // Add a new section (container for blocks)
    case ACTIONS.ADD_SECTION: {
      const { section, index } = action.payload;
      const newSections = [...state.sections]; // Copy existing sections
      if (index !== undefined) {
        // Insert at specific position
        newSections.splice(index, 0, section);
      } else {
        // Add to end
        newSections.push(section);
      }
      return { ...state, sections: newSections };
    }

    case ACTIONS.REMOVE_SECTION: {
      const removedSection = state.sections.find(
        (s) => s.id === action.payload,
      );
      const removedBlockIds = new Set(
        removedSection
          ? removedSection.blocks.flatMap((col) => col.map((b) => b.id))
          : [],
      );
      return {
        ...state,
        sections: state.sections.filter((s) => s.id !== action.payload),
        selectedSectionId:
          state.selectedSectionId === action.payload
            ? null
            : state.selectedSectionId,
        selectedBlockId: removedBlockIds.has(state.selectedBlockId ?? "")
          ? null
          : state.selectedBlockId,
      };
    }

    case ACTIONS.REORDER_SECTIONS: {
      const { oldIndex, newIndex } = action.payload;
      const sections = [...state.sections];
      if (
        oldIndex < 0 ||
        oldIndex >= sections.length ||
        newIndex < 0 ||
        newIndex >= sections.length
      )
        return state;
      const [moved] = sections.splice(oldIndex, 1);
      sections.splice(newIndex, 0, moved);
      return { ...state, sections };
    }

    case ACTIONS.ADD_BLOCK: {
      const { sectionId, columnIndex, block, index } = action.payload;
      const newSections = state.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const newBlocks = [...section.blocks];
        if (columnIndex < 0 || columnIndex >= newBlocks.length) return section;
        const col = [...newBlocks[columnIndex]];
        if (index !== undefined) col.splice(index, 0, block);
        else col.push(block);
        newBlocks[columnIndex] = col;
        return { ...section, blocks: newBlocks };
      });
      return { ...state, sections: newSections, selectedBlockId: block.id };
    }

    case ACTIONS.REMOVE_BLOCK: {
      const blockId = action.payload;
      const newSections = state.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map((col) =>
          col.filter((b) => b.id !== blockId),
        ),
      }));
      return {
        ...state,
        sections: newSections,
        selectedBlockId:
          state.selectedBlockId === blockId ? null : state.selectedBlockId,
      };
    }

    case ACTIONS.UPDATE_BLOCK: {
      const { blockId, updates } = action.payload;
      // Create new objects at every level to trigger React re-renders
      // This is critical for the inspector → canvas update flow
      const newSections = state.sections.map((section) => ({
        ...section, // New section object
        blocks: section.blocks.map((col) => // New blocks array
          col.map((b) => // New column array with updated block
            b.id === blockId ? ({ ...b, ...updates } as EditorBlock) : b,
          ),
        ),
      }));
      return { ...state, sections: newSections };
    }

    case ACTIONS.UPDATE_SECTION: {
      const { sectionId, updates } = action.payload;
      const newSections = state.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      );
      return { ...state, sections: newSections };
    }

    case ACTIONS.MOVE_BLOCK: {
      const { blockId, toSectionId, toColumnIndex, toIndex } = action.payload;
      
      // Step 1: Find and remove the block from its current location
      // We need to preserve the block object to insert it at the new location
      let movedBlock: EditorBlock | null = null;
      let newSections = state.sections.map((section) => ({
        ...section,
        blocks: section.blocks.map((col) => {
          const idx = col.findIndex((b) => b.id === blockId);
          if (idx !== -1) {
            movedBlock = col[idx];
            // Remove block by creating new array without it (maintains immutability)
            return [...col.slice(0, idx), ...col.slice(idx + 1)];
          }
          return col;
        }),
      }));
      
      // Step 2: Insert the block at its new location
      if (movedBlock) {
        newSections = newSections.map((section) => {
          if (section.id !== toSectionId) return section;
          const newBlocks = [...section.blocks];
          if (toColumnIndex < 0 || toColumnIndex >= newBlocks.length)
            return section;
          const col = [...newBlocks[toColumnIndex]];
          // Insert at specified index, or append to end if no index provided
          col.splice(
            toIndex !== undefined ? toIndex : col.length,
            0,
            movedBlock!,
          );
          newBlocks[toColumnIndex] = col;
          return { ...section, blocks: newBlocks };
        });
      }
      return { ...state, sections: newSections };
    }

    case ACTIONS.REORDER_BLOCKS: {
      const { sectionId, columnIndex, oldIndex, newIndex } = action.payload;
      const newSections = state.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const newBlocks = [...section.blocks];
        if (columnIndex < 0 || columnIndex >= newBlocks.length) return section;
        const col = [...newBlocks[columnIndex]];
        if (
          oldIndex < 0 ||
          oldIndex >= col.length ||
          newIndex < 0 ||
          newIndex >= col.length
        )
          return section;
        const [moved] = col.splice(oldIndex, 1);
        col.splice(newIndex, 0, moved);
        newBlocks[columnIndex] = col;
        return { ...section, blocks: newBlocks };
      });
      return { ...state, sections: newSections };
    }

    case ACTIONS.SELECT_BLOCK:
      return {
        ...state,
        selectedBlockId: action.payload,
        selectedSectionId: null,
      };

    case ACTIONS.SELECT_SECTION:
      return {
        ...state,
        selectedSectionId: action.payload,
        selectedBlockId: null,
      };

    case ACTIONS.DUPLICATE_BLOCK: {
      const { blockId } = action.payload;
      let resultSections = state.sections;
      let newBlockId: string | null = null;
      
      // Find the block to duplicate and create a copy with a new ID
      for (const section of state.sections) {
        for (let ci = 0; ci < section.blocks.length; ci++) {
          const col = section.blocks[ci];
          const idx = col.findIndex((b) => b.id === blockId);
          if (idx !== -1) {
            // Deep copy the block and assign a new unique ID
            const dup: EditorBlock = {
              ...col[idx],
              id: uuidv4(),
            } as EditorBlock;
            newBlockId = dup.id;
            
            // Insert the duplicate immediately after the original block
            resultSections = state.sections.map((s) => {
              if (s.id !== section.id) return s;
              const nb = [...s.blocks];
              const nc = [...nb[ci]];
              nc.splice(idx + 1, 0, dup); // Insert after original
              nb[ci] = nc;
              return { ...s, blocks: nb };
            });
            break;
          }
        }
        if (newBlockId) break;
      }
      
      // Select the newly duplicated block
      return {
        ...state,
        sections: resultSections,
        selectedBlockId: newBlockId,
      };
    }

    case ACTIONS.TOGGLE_PREVIEW:
      return {
        ...state,
        isPreviewMode: !state.isPreviewMode,
        selectedBlockId: null,
        selectedSectionId: null,
      };

    case ACTIONS.SET_ZOOM:
      return { ...state, zoom: action.payload };

    case ACTIONS.SET_DRAGGING:
      return { ...state, isDragging: action.payload };

    case ACTIONS.PUSH_HISTORY: {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state.sections)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case ACTIONS.UNDO: {
      if (state.historyIndex <= 0) return state;
      const prevIndex = state.historyIndex - 1;
      return {
        ...state,
        sections: JSON.parse(JSON.stringify(state.history[prevIndex])),
        historyIndex: prevIndex,
        selectedBlockId: null,
      };
    }

    case ACTIONS.REDO: {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      return {
        ...state,
        sections: JSON.parse(JSON.stringify(state.history[nextIndex])),
        historyIndex: nextIndex,
        selectedBlockId: null,
      };
    }

    default:
      return state;
  }
}

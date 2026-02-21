import type { EditorState, EditorSection, EditorBlock } from './editorConfig';
import { v4 as uuidv4 } from 'uuid';

// ─── Action types ────────────────────────────────────────────────────
export const ACTIONS = {
  SET_SECTIONS: 'SET_SECTIONS',
  ADD_SECTION: 'ADD_SECTION',
  REMOVE_SECTION: 'REMOVE_SECTION',
  REORDER_SECTIONS: 'REORDER_SECTIONS',
  ADD_BLOCK: 'ADD_BLOCK',
  REMOVE_BLOCK: 'REMOVE_BLOCK',
  UPDATE_BLOCK: 'UPDATE_BLOCK',
  MOVE_BLOCK: 'MOVE_BLOCK',
  REORDER_BLOCKS: 'REORDER_BLOCKS',
  SELECT_BLOCK: 'SELECT_BLOCK',
  SELECT_SECTION: 'SELECT_SECTION',
  DUPLICATE_BLOCK: 'DUPLICATE_BLOCK',
  TOGGLE_PREVIEW: 'TOGGLE_PREVIEW',
  SET_ZOOM: 'SET_ZOOM',
  SET_DRAGGING: 'SET_DRAGGING',
  UNDO: 'UNDO',
  REDO: 'REDO',
  PUSH_HISTORY: 'PUSH_HISTORY',
} as const;

export type EditorAction =
  | { type: typeof ACTIONS.SET_SECTIONS; payload: EditorSection[] }
  | { type: typeof ACTIONS.ADD_SECTION; payload: { section: EditorSection; index?: number } }
  | { type: typeof ACTIONS.REMOVE_SECTION; payload: string }
  | { type: typeof ACTIONS.REORDER_SECTIONS; payload: { oldIndex: number; newIndex: number } }
  | { type: typeof ACTIONS.ADD_BLOCK; payload: { sectionId: string; columnIndex: number; block: EditorBlock; index?: number } }
  | { type: typeof ACTIONS.REMOVE_BLOCK; payload: string }
  | { type: typeof ACTIONS.UPDATE_BLOCK; payload: { blockId: string; updates: Partial<EditorBlock> } }
  | { type: typeof ACTIONS.MOVE_BLOCK; payload: { blockId: string; toSectionId: string; toColumnIndex: number; toIndex?: number } }
  | { type: typeof ACTIONS.REORDER_BLOCKS; payload: { sectionId: string; columnIndex: number; oldIndex: number; newIndex: number } }
  | { type: typeof ACTIONS.SELECT_BLOCK; payload: string | null }
  | { type: typeof ACTIONS.SELECT_SECTION; payload: string | null }
  | { type: typeof ACTIONS.DUPLICATE_BLOCK; payload: { blockId: string } }
  | { type: typeof ACTIONS.TOGGLE_PREVIEW }
  | { type: typeof ACTIONS.SET_ZOOM; payload: number }
  | { type: typeof ACTIONS.SET_DRAGGING; payload: boolean }
  | { type: typeof ACTIONS.UNDO }
  | { type: typeof ACTIONS.REDO }
  | { type: typeof ACTIONS.PUSH_HISTORY };

const MAX_HISTORY = 50;

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case ACTIONS.SET_SECTIONS:
      return { ...state, sections: action.payload };

    case ACTIONS.ADD_SECTION: {
      const { section, index } = action.payload;
      const newSections = [...state.sections];
      if (index !== undefined) {
        newSections.splice(index, 0, section);
      } else {
        newSections.push(section);
      }
      return { ...state, sections: newSections };
    }

    case ACTIONS.REMOVE_SECTION: {
      const removedSection = state.sections.find(s => s.id === action.payload);
      const removedBlockIds = new Set(
        removedSection ? removedSection.blocks.flatMap(col => col.map(b => b.id)) : []
      );
      return {
        ...state,
        sections: state.sections.filter(s => s.id !== action.payload),
        selectedSectionId: state.selectedSectionId === action.payload ? null : state.selectedSectionId,
        selectedBlockId: removedBlockIds.has(state.selectedBlockId ?? '') ? null : state.selectedBlockId,
      };
    }

    case ACTIONS.REORDER_SECTIONS: {
      const { oldIndex, newIndex } = action.payload;
      const sections = [...state.sections];
      if (oldIndex < 0 || oldIndex >= sections.length || newIndex < 0 || newIndex >= sections.length) return state;
      const [moved] = sections.splice(oldIndex, 1);
      sections.splice(newIndex, 0, moved);
      return { ...state, sections };
    }

    case ACTIONS.ADD_BLOCK: {
      const { sectionId, columnIndex, block, index } = action.payload;
      const newSections = state.sections.map(section => {
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
      const newSections = state.sections.map(section => ({
        ...section,
        blocks: section.blocks.map(col => col.filter(b => b.id !== blockId)),
      }));
      return { ...state, sections: newSections, selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId };
    }

    case ACTIONS.UPDATE_BLOCK: {
      const { blockId, updates } = action.payload;
      const newSections = state.sections.map(section => ({
        ...section,
        blocks: section.blocks.map(col =>
          col.map(b => (b.id === blockId ? { ...b, ...updates } as EditorBlock : b))
        ),
      }));
      return { ...state, sections: newSections };
    }

    case ACTIONS.MOVE_BLOCK: {
      const { blockId, toSectionId, toColumnIndex, toIndex } = action.payload;
      let movedBlock: EditorBlock | null = null;
      let newSections = state.sections.map(section => ({
        ...section,
        blocks: section.blocks.map(col => {
          const idx = col.findIndex(b => b.id === blockId);
          if (idx !== -1) {
            movedBlock = col[idx];
            return [...col.slice(0, idx), ...col.slice(idx + 1)];
          }
          return col;
        }),
      }));
      if (movedBlock) {
        newSections = newSections.map(section => {
          if (section.id !== toSectionId) return section;
          const newBlocks = [...section.blocks];
          if (toColumnIndex < 0 || toColumnIndex >= newBlocks.length) return section;
          const col = [...newBlocks[toColumnIndex]];
          col.splice(toIndex !== undefined ? toIndex : col.length, 0, movedBlock!);
          newBlocks[toColumnIndex] = col;
          return { ...section, blocks: newBlocks };
        });
      }
      return { ...state, sections: newSections };
    }

    case ACTIONS.REORDER_BLOCKS: {
      const { sectionId, columnIndex, oldIndex, newIndex } = action.payload;
      const newSections = state.sections.map(section => {
        if (section.id !== sectionId) return section;
        const newBlocks = [...section.blocks];
        if (columnIndex < 0 || columnIndex >= newBlocks.length) return section;
        const col = [...newBlocks[columnIndex]];
        if (oldIndex < 0 || oldIndex >= col.length || newIndex < 0 || newIndex >= col.length) return section;
        const [moved] = col.splice(oldIndex, 1);
        col.splice(newIndex, 0, moved);
        newBlocks[columnIndex] = col;
        return { ...section, blocks: newBlocks };
      });
      return { ...state, sections: newSections };
    }

    case ACTIONS.SELECT_BLOCK:
      return { ...state, selectedBlockId: action.payload, selectedSectionId: null };

    case ACTIONS.SELECT_SECTION:
      return { ...state, selectedSectionId: action.payload, selectedBlockId: null };

    case ACTIONS.DUPLICATE_BLOCK: {
      const { blockId } = action.payload;
      let resultSections = state.sections;
      let newBlockId: string | null = null;
      for (const section of state.sections) {
        for (let ci = 0; ci < section.blocks.length; ci++) {
          const col = section.blocks[ci];
          const idx = col.findIndex(b => b.id === blockId);
          if (idx !== -1) {
            const dup: EditorBlock = { ...col[idx], id: uuidv4() } as EditorBlock;
            newBlockId = dup.id;
            resultSections = state.sections.map(s => {
              if (s.id !== section.id) return s;
              const nb = [...s.blocks];
              const nc = [...nb[ci]];
              nc.splice(idx + 1, 0, dup);
              nb[ci] = nc;
              return { ...s, blocks: nb };
            });
            break;
          }
        }
        if (newBlockId) break;
      }
      return { ...state, sections: resultSections, selectedBlockId: newBlockId };
    }

    case ACTIONS.TOGGLE_PREVIEW:
      return { ...state, isPreviewMode: !state.isPreviewMode, selectedBlockId: null, selectedSectionId: null };

    case ACTIONS.SET_ZOOM:
      return { ...state, zoom: action.payload };

    case ACTIONS.SET_DRAGGING:
      return { ...state, isDragging: action.payload };

    case ACTIONS.PUSH_HISTORY: {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state.sections)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return { ...state, history: newHistory, historyIndex: newHistory.length - 1 };
    }

    case ACTIONS.UNDO: {
      if (state.historyIndex <= 0) return state;
      const prevIndex = state.historyIndex - 1;
      return { ...state, sections: JSON.parse(JSON.stringify(state.history[prevIndex])), historyIndex: prevIndex, selectedBlockId: null };
    }

    case ACTIONS.REDO: {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      return { ...state, sections: JSON.parse(JSON.stringify(state.history[nextIndex])), historyIndex: nextIndex, selectedBlockId: null };
    }

    default:
      return state;
  }
}

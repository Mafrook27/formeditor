---
inclusion: always
---

# Form Editor Project Architecture

## Overview
This is a drag-and-drop form builder with real-time preview capabilities. Users can create agreement forms by dragging blocks (headings, inputs, dividers, etc.) onto a canvas and customizing them via an inspector panel.

## Core Architecture Principles

### 1. State Management Pattern
**Centralized state with Context + Reducer**

```
EditorProvider (Context)
  ├── state (via useReducer)
  ├── dispatch function
  └── Helper functions (addBlock, updateBlock, etc.)
```

**Key principle:** All state updates go through the reducer to maintain immutability and enable undo/redo.

### 2. Component Hierarchy

```
EditorLayout
  ├── TopToolbar (zoom, preview toggle, export)
  ├── BlockLibrary (drag source for new blocks)
  ├── Canvas
  │   └── SectionContainer (1-3 columns)
  │       └── SectionColumn (droppable area)
  │           └── BlockWrapper (drag handle, selection)
  │               └── BlockRenderer (switches to specific block)
  │                   └── [Specific Block Component]
  └── InspectorPanel (property editor)
```

### 3. Data Flow

**Adding a block:**
```
BlockLibrary (drag) → Canvas (drop) → addBlock() → dispatch(ADD_BLOCK) 
→ reducer creates new state → components re-render
```

**Updating a block:**
```
InspectorPanel (change input) → updateBlockWithHistory() → dispatch(UPDATE_BLOCK)
→ reducer creates new state → components re-render → canvas updates
```

**Preview mode:**
```
TopToolbar (click preview) → togglePreview() → dispatch(TOGGLE_PREVIEW)
→ state.isPreviewMode = true → components hide edit UI
```

## Critical Files & Their Roles

### State Management
- **`EditorContext.tsx`** - Context provider, helper functions, keyboard shortcuts
- **`editorReducer.ts`** - Pure reducer functions, all state mutations
- **`editorConfig.ts`** - Type definitions, initial state, default block props

### Layout & Rendering
- **`EditorLayout.tsx`** - Main layout, DnD context, canvas wrapper
- **`SectionContainer.tsx`** - Section wrapper with column grid
- **`BlockWrapper.tsx`** - Block selection, drag handle, actions toolbar
- **`BlockRenderer.tsx`** - Switch statement to render correct block type

### UI Panels
- **`TopToolbar.tsx`** - Undo/redo, zoom, preview, export
- **`BlockLibrary.tsx`** - Sidebar with draggable block types
- **`InspectorPanel.tsx`** - Property editor with tabs (General/Layout/Style)

### Block Components
- **`blocks/[BlockType].tsx`** - Individual block implementations
  - Each block receives `block` prop with its data
  - Blocks handle their own rendering logic
  - Edit mode vs preview mode handled internally

### Utilities
- **`parser/`** - HTML import/export, placeholder parsing
- **`export/`** - HTML generation for final output
- **`plugins/`** - Placeholder dropdown, other editor enhancements

## State Structure

```typescript
interface EditorState {
  sections: EditorSection[];        // Array of sections (each has 1-3 columns)
  selectedBlockId: string | null;   // Currently selected block
  selectedSectionId: string | null; // Currently selected section
  isPreviewMode: boolean;           // Preview vs edit mode
  zoom: number;                     // Canvas zoom level (50-150%)
  isDragging: boolean;              // Drag in progress
  history: EditorSection[][];       // Undo/redo history
  historyIndex: number;             // Current position in history
}

interface EditorSection {
  id: string;
  columns: 1 | 2 | 3;
  blocks: EditorBlock[][];  // Array of columns, each containing blocks
}

interface EditorBlock {
  id: string;
  type: BlockType;
  width: number;           // 25-100%
  marginTop/Bottom/Left/Right: number;
  paddingX/Y: number;
  locked: boolean;
  // ... type-specific properties
}
```

## Drag & Drop System

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

**Draggable items:**
1. **Library blocks** - New blocks from sidebar
   - `data: { type: 'library-block', blockType: 'heading' }`
2. **Existing blocks** - Reordering/moving
   - `data: { type: 'block', block, sectionId, columnIndex }`

**Droppable areas:**
1. **Columns** - Empty or with blocks
   - `data: { type: 'column', sectionId, columnIndex }`
2. **Blocks** - Drop near existing block
   - `data: { type: 'block', block, sectionId, columnIndex }`

**Drop logic in `EditorLayout.handleDragEnd()`:**
- Library block → Create new block at drop location
- Existing block → Same column = reorder, different column = move

## Undo/Redo System

**Implementation:**
- History stored as array of section snapshots
- `historyIndex` tracks current position
- `PUSH_HISTORY` action adds snapshot after mutations
- `UNDO/REDO` actions restore snapshots

**Triggers:**
- Add/remove/move/duplicate block
- Add/remove section
- NOT triggered by: selection, zoom, preview toggle, typing in inspector

## Performance Optimizations

### 1. React.memo
- Used on: `SectionContainer`, `SectionColumn`, `BlockWrapper`, block components
- **Always use default comparison** (no custom function)

### 2. useCallback
- Used for: event handlers passed to children
- Prevents unnecessary re-renders of memoized children

### 3. Immutable Updates
- Reducer creates new objects at every level
- Enables efficient shallow comparison
- Required for memo to work correctly

## Common Patterns

### Adding a New Block Type

1. **Define type in `editorConfig.ts`:**
```typescript
export const BLOCK_TYPES = {
  // ...
  NEW_BLOCK: 'new-block',
} as const;

export interface NewBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.NEW_BLOCK;
  customProp: string;
}
```

2. **Create component in `blocks/NewBlock.tsx`:**
```typescript
export const NewBlock = memo(function NewBlock({ block }: { block: NewBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  
  // Render logic
});
```

3. **Add to `BlockRenderer.tsx`:**
```typescript
case BLOCK_TYPES.NEW_BLOCK:
  return <NewBlock block={block} />;
```

4. **Add to `BlockLibrary.tsx`:**
```typescript
{ type: BLOCK_TYPES.NEW_BLOCK, label: 'New Block', icon: Icon }
```

5. **Add inspector fields in `InspectorPanel.tsx`** (if needed)

### Updating Block Properties

**Always use `updateBlockWithHistory` for user actions:**
```typescript
const onUpdate = (updates: Partial<EditorBlock>) => {
  updateBlockWithHistory(block.id, updates);
};
```

**Use `updateBlock` (no history) for:**
- Programmatic updates
- Rapid changes (like dragging a slider)
- Internal state that shouldn't be undoable

## Testing Checklist

After making changes, verify:

1. **Basic functionality:**
   - [ ] Can add blocks from library
   - [ ] Can select blocks
   - [ ] Can drag to reorder
   - [ ] Can delete blocks
   - [ ] Can undo/redo

2. **Inspector updates:**
   - [ ] Width slider updates canvas immediately
   - [ ] Margin/padding inputs update canvas
   - [ ] Color pickers update canvas
   - [ ] Text inputs update canvas

3. **Preview mode:**
   - [ ] Toggle preview hides edit UI
   - [ ] All blocks render correctly
   - [ ] Can toggle back to edit mode

4. **Export:**
   - [ ] HTML export generates valid markup
   - [ ] Styles are inline or in style tag
   - [ ] Form fields have correct attributes

## Troubleshooting Guide

### Issue: Canvas doesn't update when inspector changes
**Cause:** Broken re-render chain (likely memo issue)
**Fix:** Check for custom memo comparisons in component chain

### Issue: Drag and drop not working
**Cause:** DnD context not wrapping components, or disabled prop
**Fix:** Verify DndContext wraps canvas, check `disabled` props

### Issue: Undo/redo not working
**Cause:** History not being pushed, or reducer not restoring correctly
**Fix:** Ensure `pushHistory()` called after mutations

### Issue: Performance degradation
**Cause:** Too many re-renders, missing memo/useCallback
**Fix:** Use React DevTools Profiler to identify hot spots

### Issue: State not persisting
**Cause:** This app doesn't persist state (by design)
**Fix:** Implement localStorage or backend save if needed

## Future Enhancements

Potential areas for improvement:
- [ ] Backend integration for saving forms
- [ ] Form submission handling
- [ ] Conditional logic (show/hide fields)
- [ ] Field validation rules
- [ ] Templates/presets
- [ ] Collaboration features
- [ ] Version history
- [ ] Form analytics

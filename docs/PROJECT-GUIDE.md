# Form Editor Project Guide

## Quick Start

This is a drag-and-drop form builder built with React, TypeScript, and @dnd-kit. Users can create agreement forms by dragging blocks onto a canvas and customizing them in real-time.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/features/form-editor/
├── EditorContext.tsx          # State management (Context + Reducer)
├── editorReducer.ts           # State mutations (MUST be immutable)
├── editorConfig.ts            # Types, initial state, defaults
├── EditorLayout.tsx           # Main layout with DnD
├── sections/
│   └── SectionContainer.tsx   # Section rendering (1-3 columns)
├── blocks/
│   ├── BlockWrapper.tsx       # Block selection & drag handle
│   ├── BlockRenderer.tsx      # Routes to specific block
│   └── [BlockType].tsx        # Individual block components
├── toolbar/
│   ├── TopToolbar.tsx         # Undo/redo, zoom, preview, export
│   └── BlockLibrary.tsx       # Draggable block library
├── inspector/
│   └── InspectorPanel.tsx     # Property editor
├── parser/                    # HTML import/export
├── export/                    # HTML generation
└── plugins/                   # Editor enhancements
```

## 🎯 Key Concepts

### State Management
- **Context + Reducer pattern** for centralized state
- **Immutable updates** - always create new objects
- **Undo/redo** via history snapshots
- All updates go through reducer actions

### Component Re-rendering
- Uses `React.memo` for performance
- **ALWAYS use default comparison** (no custom function)
- Immutable updates + shallow comparison = efficient re-renders
- See `react-performance-rules.md` for details

### Drag & Drop
- Library: `@dnd-kit/core` + `@dnd-kit/sortable`
- Drag from library to add new blocks
- Drag existing blocks to reorder/move
- Drop zones: columns and between blocks

## 🔧 Common Tasks

### Adding a New Block Type

1. **Define type in `editorConfig.ts`:**
```typescript
export const BLOCK_TYPES = {
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
  
  return <div>{/* Your block UI */}</div>;
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

5. **Add inspector fields** (optional)

### Updating Block Properties

```typescript
// In your component
const { updateBlockWithHistory } = useEditor();

// For user actions (adds to history)
updateBlockWithHistory(block.id, { width: 50 });

// For programmatic updates (no history)
updateBlock(block.id, { width: 50 });
```

### Adding a New Reducer Action

1. **Add action type:**
```typescript
export const ACTIONS = {
  NEW_ACTION: 'NEW_ACTION',
} as const;
```

2. **Add to action union:**
```typescript
export type EditorAction =
  | { type: typeof ACTIONS.NEW_ACTION; payload: YourPayload }
  | ...
```

3. **Implement in reducer:**
```typescript
case ACTIONS.NEW_ACTION: {
  // MUST create new objects (immutable)
  const newSections = state.sections.map(section => ({
    ...section,
    // your changes
  }));
  return { ...state, sections: newSections };
}
```

4. **Add helper in EditorContext:**
```typescript
const yourAction = useCallback((params) => {
  dispatch({ type: ACTIONS.NEW_ACTION, payload: params });
  pushHistoryRef.current(); // If user action
}, []);
```

## ⚠️ Critical Rules

### DO ✅
- Use immutable update patterns
- Use default `memo` comparison
- Test after every change
- Handle preview mode
- Push history for user actions
- Follow existing patterns

### DON'T ❌
- Mutate state directly
- Add custom memo comparisons
- Skip testing
- Forget preview mode
- Skip history for user actions
- Make large, sweeping changes

## 🧪 Testing Checklist

After ANY code change:

1. **Basic operations:**
   - Add, select, move, delete, duplicate blocks

2. **Inspector updates:**
   - Change width, margins, colors → canvas updates immediately

3. **Undo/Redo:**
   - Undo/redo works correctly

4. **Preview mode:**
   - Toggle preview, verify no edit UI

5. **Drag and drop:**
   - Drag from library, reorder, move between columns

## 🐛 Troubleshooting

### Canvas doesn't update when inspector changes
**Cause:** Broken re-render chain (likely custom memo)
**Fix:** Check for custom memo comparisons, ensure immutability

### Drag and drop not working
**Cause:** DnD context issue or disabled prop
**Fix:** Verify DndContext wraps canvas, check disabled props

### Undo/redo not working
**Cause:** History not pushed or reducer not restoring
**Fix:** Ensure pushHistory() called after mutations

### Performance issues
**Cause:** Too many re-renders
**Fix:** Use React DevTools Profiler to identify hot spots

## 📚 Documentation

### Steering Files (Auto-included in AI interactions)
- `.kiro/steering/react-performance-rules.md` - React optimization rules
- `.kiro/steering/project-architecture.md` - Architecture overview
- `.kiro/steering/code-modification-guidelines.md` - Modification guidelines

### Bug Reports
- `docs/BUGFIX-MEMO-RERENDER.md` - Memo re-render issue (2026-02-18)

### Additional Resources
- React memo: https://react.dev/reference/react/memo
- @dnd-kit: https://docs.dndkit.com/
- Immutable updates: https://redux.js.org/usage/structuring-reducers/immutable-update-patterns

## 🎨 Architecture Diagram

```
User Action (Inspector/Canvas)
        ↓
Helper Function (addBlock, updateBlock, etc.)
        ↓
dispatch(ACTION)
        ↓
Reducer (creates new state immutably)
        ↓
Context updates
        ↓
Components re-render (via memo + shallow comparison)
        ↓
Canvas updates
```

## 🔐 State Structure

```typescript
EditorState {
  sections: [
    {
      id: string,
      columns: 1 | 2 | 3,
      blocks: [
        [block1, block2],  // Column 1
        [block3],          // Column 2
        []                 // Column 3
      ]
    }
  ],
  selectedBlockId: string | null,
  selectedSectionId: string | null,
  isPreviewMode: boolean,
  zoom: number,
  isDragging: boolean,
  history: EditorSection[][],
  historyIndex: number
}
```

## 💡 Best Practices

1. **Keep changes small and focused**
   - One feature per commit
   - Test after each change

2. **Follow immutability**
   - Always create new objects
   - Never mutate state directly

3. **Trust React's defaults**
   - Use default memo comparison
   - Don't over-optimize prematurely

4. **Test thoroughly**
   - Manual testing checklist
   - Verify inspector updates work
   - Check preview mode

5. **Document complex logic**
   - Add comments for non-obvious code
   - Update docs when architecture changes

## 🚨 Emergency Contacts

If you break something:

1. Check browser console for errors
2. Review recent changes
3. Try removing custom memo comparisons
4. Verify reducer immutability
5. Revert if necessary
6. Consult steering files for guidance

## 📝 Contributing

Before submitting changes:

- [ ] Code follows existing patterns
- [ ] All tests pass (manual checklist)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Documentation updated
- [ ] Steering files reviewed

## 🎯 Project Goals

- **Maintainability:** Code should be easy to understand and modify
- **Performance:** Efficient re-renders, smooth interactions
- **Reliability:** Predictable behavior, no surprises
- **User Experience:** Real-time updates, intuitive interface

**Remember: Quality over speed. Working code is better than fast code.**

## 📞 Getting Help

1. Check steering files in `.kiro/steering/`
2. Review bug reports in `docs/`
3. Use React DevTools for debugging
4. Ask for help with specific examples

---

**Last Updated:** 2026-02-18
**Version:** 1.0.0

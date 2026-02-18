---
inclusion: always
---

# Code Modification Guidelines

## Before Making ANY Changes

### 1. Understand the Impact
Ask yourself:
- Does this change affect state management?
- Does this change affect component re-rendering?
- Does this change affect the drag-and-drop system?
- Does this change affect undo/redo functionality?

### 2. Check Critical Files
If modifying these files, extra caution required:
- `EditorContext.tsx` - State provider
- `editorReducer.ts` - State mutations
- `SectionContainer.tsx` - Section rendering
- `BlockWrapper.tsx` - Block rendering
- `InspectorPanel.tsx` - Property updates

### 3. Review Existing Patterns
- Look at similar code in the project
- Follow established patterns
- Don't introduce new patterns without reason

## Modification Rules

### State Management Changes

❌ **NEVER mutate state directly:**
```typescript
// BAD
state.sections[0].blocks[0][0].width = 50;
```

✅ **ALWAYS create new objects:**
```typescript
// GOOD
const newSections = state.sections.map(section => ({
  ...section,
  blocks: section.blocks.map(col =>
    col.map(b => b.id === blockId ? { ...b, width: 50 } : b)
  ),
}));
```

### Component Changes

❌ **NEVER add custom memo comparison without testing:**
```typescript
// BAD - Will likely break re-renders
const Component = memo(Component, (prev, next) => {
  return prev.id === next.id; // Blocks property updates!
});
```

✅ **ALWAYS use default memo:**
```typescript
// GOOD
const Component = memo(Component);
```

### Adding New Features

**Step-by-step process:**

1. **Plan the change:**
   - What state needs to change?
   - What components need to update?
   - What actions need to be dispatched?

2. **Implement in order:**
   - Add types to `editorConfig.ts`
   - Add action to `editorReducer.ts`
   - Add helper function to `EditorContext.tsx`
   - Update UI components

3. **Test thoroughly:**
   - Test the new feature works
   - Test existing features still work
   - Test undo/redo still works
   - Test preview mode still works

### Refactoring Code

**Before refactoring:**
- [ ] Understand what the code currently does
- [ ] Identify all places that depend on it
- [ ] Plan the refactor to maintain compatibility
- [ ] Have a rollback plan

**During refactoring:**
- [ ] Make small, incremental changes
- [ ] Test after each change
- [ ] Keep commits small and focused
- [ ] Document why you're refactoring

**After refactoring:**
- [ ] Run full test suite
- [ ] Check for console warnings/errors
- [ ] Verify performance hasn't degraded
- [ ] Update documentation if needed

## Common Mistakes to Avoid

### 1. Breaking Immutability
```typescript
// BAD - Mutates original array
const newBlocks = section.blocks;
newBlocks[0].push(newBlock);

// GOOD - Creates new array
const newBlocks = section.blocks.map((col, i) => 
  i === 0 ? [...col, newBlock] : col
);
```

### 2. Incorrect Memo Usage
```typescript
// BAD - Custom comparison blocks updates
const Block = memo(Block, (prev, next) => prev.block.id === next.block.id);

// GOOD - Default comparison
const Block = memo(Block);
```

### 3. Missing Dependencies
```typescript
// BAD - Missing dependency
useCallback(() => {
  updateBlock(blockId, { width: 50 });
}, []); // blockId not in deps!

// GOOD - All dependencies included
useCallback(() => {
  updateBlock(blockId, { width: 50 });
}, [blockId, updateBlock]);
```

### 4. Forgetting History
```typescript
// BAD - No history for user action
const handleDelete = () => {
  dispatch({ type: ACTIONS.REMOVE_BLOCK, payload: blockId });
  // Missing: pushHistory()
};

// GOOD - History included
const handleDelete = () => {
  removeBlock(blockId); // This calls pushHistory internally
};
```

### 5. Not Handling Preview Mode
```typescript
// BAD - Shows edit UI in preview
return (
  <div>
    <button onClick={onDelete}>Delete</button>
    {children}
  </div>
);

// GOOD - Hides edit UI in preview
const { state } = useEditor();
if (state.isPreviewMode) {
  return <div>{children}</div>;
}
return (
  <div>
    <button onClick={onDelete}>Delete</button>
    {children}
  </div>
);
```

## Testing Requirements

### Manual Testing Checklist

After ANY code change, test:

1. **Basic operations:**
   - [ ] Add a block
   - [ ] Select a block
   - [ ] Move a block
   - [ ] Delete a block
   - [ ] Duplicate a block

2. **Inspector updates:**
   - [ ] Change width - canvas updates immediately
   - [ ] Change margins - canvas updates immediately
   - [ ] Change colors - canvas updates immediately
   - [ ] Change text - canvas updates immediately

3. **Undo/Redo:**
   - [ ] Undo last action
   - [ ] Redo undone action
   - [ ] Undo multiple times
   - [ ] Make change after undo (clears redo history)

4. **Preview mode:**
   - [ ] Toggle to preview
   - [ ] All blocks render correctly
   - [ ] No edit UI visible
   - [ ] Toggle back to edit mode

5. **Drag and drop:**
   - [ ] Drag from library
   - [ ] Drag to reorder
   - [ ] Drag between columns
   - [ ] Drag between sections

### Automated Testing (Future)

When adding tests, cover:
- Reducer functions (pure, easy to test)
- Helper functions in EditorContext
- Component rendering (snapshot tests)
- User interactions (integration tests)

## Code Review Guidelines

### For Reviewers

Check for:
- [ ] Immutability maintained in state updates
- [ ] No custom memo comparisons added
- [ ] All dependencies in useCallback/useMemo
- [ ] Preview mode handled correctly
- [ ] History pushed for user actions
- [ ] No console warnings/errors
- [ ] Code follows existing patterns
- [ ] Changes are well-documented

### For Authors

Before submitting:
- [ ] Code is self-documenting (clear names)
- [ ] Complex logic has comments
- [ ] No commented-out code
- [ ] No debug console.logs
- [ ] Formatting is consistent
- [ ] No TypeScript errors
- [ ] Manual testing completed

## Emergency Rollback

If a change breaks the editor:

1. **Identify the issue:**
   - Check browser console for errors
   - Check React DevTools for render issues
   - Review recent changes

2. **Quick fixes to try:**
   - Remove custom memo comparisons
   - Check reducer immutability
   - Verify dispatch calls
   - Check for missing dependencies

3. **If still broken:**
   - Revert the last commit
   - Test that revert fixes the issue
   - Analyze what went wrong
   - Plan a better approach

## Getting Help

If stuck:

1. **Check documentation:**
   - This steering file
   - `react-performance-rules.md`
   - `project-architecture.md`
   - Component comments

2. **Debug systematically:**
   - Add console.logs to track data flow
   - Use React DevTools to inspect state
   - Use React DevTools Profiler for performance
   - Check browser console for errors

3. **Ask for help:**
   - Describe what you're trying to do
   - Explain what you've tried
   - Share relevant code snippets
   - Include error messages

## Best Practices Summary

✅ **DO:**
- Follow immutable update patterns
- Use default memo comparison
- Test after every change
- Keep changes small and focused
- Document complex logic
- Handle preview mode
- Push history for user actions

❌ **DON'T:**
- Mutate state directly
- Add custom memo comparisons
- Skip testing
- Make large, sweeping changes
- Leave debug code
- Forget about preview mode
- Skip history for user actions

## Remember

**The goal is maintainable, predictable code that works correctly.**

When in doubt:
- Follow existing patterns
- Keep it simple
- Test thoroughly
- Ask for help

**Quality over speed. A working feature tomorrow is better than a broken feature today.**

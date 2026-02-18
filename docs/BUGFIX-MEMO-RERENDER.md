# Bug Fix: Editor Not Updating on Inspector Changes

## Date: 2026-02-18

## Issue Description

The editor canvas was not reflecting real-time updates when properties were changed in the inspector panel. Changes to width, margins, padding, colors, and other properties would update in preview mode but not in the editor view.

### Symptoms
- Inspector panel updates worked in preview mode
- Editor canvas did not update when inspector values changed
- Changes only appeared after refresh or mode toggle
- Preview and editor were out of sync

## Root Cause

The `SectionColumn` component in `src/features/form-editor/sections/SectionContainer.tsx` had a custom `React.memo` comparison function that was too restrictive:

```typescript
const SectionColumn = memo(function SectionColumn({ section, columnIndex, blocks }: SectionColumnProps) {
  // ... component code
}, (prevProps, nextProps) => {
  // Custom comparison - THIS WAS THE PROBLEM
  return (
    prevProps.section.id === nextProps.section.id &&
    prevProps.columnIndex === nextProps.columnIndex &&
    prevProps.blocks.length === nextProps.blocks.length &&
    prevProps.blocks.every((block, i) => block.id === nextProps.blocks[i]?.id)
  );
});
```

### Why This Broke Re-renders

The custom comparison only checked:
1. Section ID equality
2. Column index equality
3. Blocks array length
4. Block ID equality

**It did NOT check if block properties changed.**

When a block's properties were updated (e.g., `width: 85%` → `width: 50%`), the block object reference changed (due to immutable updates in the reducer), but the comparison function only looked at the block ID. Since the ID remained the same, React thought nothing changed and skipped the re-render.

## The Fix

Removed the custom comparison function entirely:

```typescript
const SectionColumn = memo(function SectionColumn({ section, columnIndex, blocks }: SectionColumnProps) {
  // ... component code
});
// No second argument - uses default shallow comparison
```

### Why This Works

React's default shallow comparison checks if prop references have changed. Our reducer creates new object references at every level when state updates:

```typescript
case ACTIONS.UPDATE_BLOCK: {
  const { blockId, updates } = action.payload;
  const newSections = state.sections.map(section => ({
    ...section,  // New section object
    blocks: section.blocks.map(col =>  // New blocks array
      col.map(b => (b.id === blockId ? { ...b, ...updates } : b))  // New block object
    ),
  }));
  return { ...state, sections: newSections };  // New state
}
```

When `blocks` prop reference changes, default shallow comparison detects it and triggers re-render.

## State Flow Analysis

### Before Fix (Broken)
```
Inspector change → updateBlockWithHistory() → dispatch(UPDATE_BLOCK)
  ↓
Reducer creates new state with new object references
  ↓
EditorLayout re-renders (receives new state)
  ↓
SectionContainer re-renders (receives new section)
  ↓
SectionColumn receives new blocks array
  ↓
Custom memo comparison: "IDs match, skip re-render" ❌
  ↓
Canvas NOT updated (blocks still show old properties)
```

### After Fix (Working)
```
Inspector change → updateBlockWithHistory() → dispatch(UPDATE_BLOCK)
  ↓
Reducer creates new state with new object references
  ↓
EditorLayout re-renders (receives new state)
  ↓
SectionContainer re-renders (receives new section)
  ↓
SectionColumn receives new blocks array
  ↓
Default memo comparison: "blocks reference changed, re-render" ✅
  ↓
BlockWrapper receives new block object
  ↓
BlockRenderer receives new block prop
  ↓
Canvas updated with new properties ✅
```

## Lessons Learned

### 1. Custom Memo Comparisons Are Dangerous
Custom comparison functions can easily break React's reactivity system. They should only be used when:
- You have a proven performance issue
- You've profiled and confirmed the optimization helps
- You understand ALL props and their update patterns
- You've thoroughly tested that updates still work

### 2. Immutability + Default Memo = Perfect Match
Our immutable state pattern creates new references on every update. This works perfectly with React's default shallow comparison. Custom comparisons are unnecessary and harmful.

### 3. Test the Full Update Flow
When optimizing performance, always test the complete user flow:
1. Make a change in the UI
2. Verify it updates immediately
3. Check both edit and preview modes
4. Test undo/redo still works

### 4. Trust React's Defaults
React's default behavior is well-designed. Don't override it without good reason and thorough testing.

## Prevention Measures

To prevent this issue from recurring, we've added:

1. **Steering file: `react-performance-rules.md`**
   - Documents the correct memo usage patterns
   - Explains why custom comparisons are dangerous
   - Provides testing checklist

2. **Steering file: `project-architecture.md`**
   - Documents the state flow and component hierarchy
   - Explains the immutability pattern
   - Lists critical files that need extra scrutiny

3. **Steering file: `code-modification-guidelines.md`**
   - Provides step-by-step modification guidelines
   - Lists common mistakes to avoid
   - Includes testing requirements

These steering files are automatically included in all AI interactions with this codebase, ensuring future changes follow best practices.

## Testing Checklist

After this fix, verify:
- [x] Width slider updates canvas immediately
- [x] Margin inputs update canvas immediately
- [x] Padding inputs update canvas immediately
- [x] Color pickers update canvas immediately
- [x] Text inputs update canvas immediately
- [x] Preview mode still works
- [x] Undo/redo still works
- [x] Drag and drop still works
- [x] No console errors or warnings

## Files Changed

- `src/features/form-editor/sections/SectionContainer.tsx`
  - Removed custom memo comparison from `SectionColumn`
  - Component now uses default shallow comparison

## Related Issues

This same pattern could potentially affect other memoized components. Review these files if similar issues occur:
- `BlockWrapper.tsx` - Currently uses default memo ✅
- `SectionContainer.tsx` - Currently uses default memo ✅
- Individual block components - Most use default memo ✅

## References

- React memo documentation: https://react.dev/reference/react/memo
- React re-rendering behavior: https://react.dev/learn/render-and-commit
- Immutable update patterns: https://redux.js.org/usage/structuring-reducers/immutable-update-patterns

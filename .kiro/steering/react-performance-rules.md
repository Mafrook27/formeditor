---
inclusion: always
---

# React Performance & Re-render Rules

## Critical Rules for This Project

### 1. React.memo Usage
**NEVER use custom comparison functions with React.memo unless absolutely necessary.**

❌ **BAD - Blocks re-renders:**
```tsx
const Component = memo(function Component({ data }) {
  return <div>{data.value}</div>;
}, (prev, next) => {
  // Only comparing IDs blocks property updates!
  return prev.data.id === next.data.id;
});
```

✅ **GOOD - Allows proper re-renders:**
```tsx
const Component = memo(function Component({ data }) {
  return <div>{data.value}</div>;
});
// Uses default shallow comparison - detects reference changes
```

**Why:** Custom comparisons can block legitimate re-renders when object properties change but references don't update. Our immutable state pattern creates new references on every update, so default shallow comparison works perfectly.

### 2. State Immutability Pattern

**ALWAYS create new object references when updating nested state.**

✅ **Our Pattern (MUST MAINTAIN):**
```tsx
case ACTIONS.UPDATE_BLOCK: {
  const newSections = state.sections.map(section => ({
    ...section,  // New section object
    blocks: section.blocks.map(col =>  // New blocks array
      col.map(b => b.id === blockId ? { ...b, ...updates } : b)  // New block object
    ),
  }));
  return { ...state, sections: newSections };  // New state object
}
```

This creates new references at EVERY level:
- State object
- Sections array
- Section objects
- Blocks arrays
- Block objects (when updated)

### 3. Component Re-render Chain

**Understand the re-render flow:**

```
EditorContext state change
  ↓
EditorLayout re-renders
  ↓
SectionContainer receives new section prop
  ↓
SectionColumn receives new blocks array
  ↓
BlockWrapper receives new block object
  ↓
BlockRenderer receives new block prop
  ↓
Individual block components re-render
```

**If ANY component in this chain blocks re-renders with incorrect memo logic, the entire chain breaks.**

### 4. When to Use memo

✅ **Use memo for:**
- Components that render frequently
- Components with expensive render logic
- List items that don't change often

✅ **Use DEFAULT comparison (no second argument)**

❌ **DON'T use custom comparison unless:**
- You have a specific performance issue
- You've profiled and confirmed it helps
- You understand ALL props and their update patterns
- You've tested that updates still work correctly

### 5. Testing Re-renders

**After ANY change to memo, useCallback, or useMemo, test:**

1. Open inspector panel
2. Select a block
3. Change properties (width, margins, colors, etc.)
4. **Verify the editor canvas updates immediately**
5. Check preview mode also updates

**If editor doesn't update but preview does = broken re-render chain**

### 6. Common Pitfalls

❌ **Comparing only IDs:**
```tsx
prev.blocks.every((b, i) => b.id === next.blocks[i]?.id)
// Blocks updates when properties change!
```

❌ **Comparing array length only:**
```tsx
prev.blocks.length === next.blocks.length
// Blocks updates when items change!
```

❌ **Deep equality checks:**
```tsx
JSON.stringify(prev) === JSON.stringify(next)
// Expensive and defeats memo purpose!
```

### 7. Debugging Re-render Issues

**Symptoms:**
- Inspector updates but canvas doesn't
- Preview works but editor doesn't
- Changes appear after refresh but not live

**Solution:**
1. Check for custom memo comparisons in component chain
2. Verify reducer creates new object references
3. Add console.logs to track prop changes
4. Use React DevTools Profiler

**Quick test:**
```tsx
// Temporarily add to suspect component
useEffect(() => {
  console.log('Component rendered with:', props);
});
```

### 8. Code Review Checklist

Before committing changes to editor components:

- [ ] No custom memo comparison functions added
- [ ] All state updates maintain immutability
- [ ] Tested live updates in editor
- [ ] Tested preview mode
- [ ] No performance regressions
- [ ] Console has no warnings

## Project-Specific Context

**This project uses:**
- React Context for global state (EditorContext)
- useReducer for state management (editorReducer)
- Immutable update pattern (new objects on every change)
- memo for performance optimization

**The state flow is:**
```
Inspector → updateBlockWithHistory → dispatch → reducer → new state → re-render
```

**Critical files:**
- `EditorContext.tsx` - State management
- `editorReducer.ts` - State updates (MUST be immutable)
- `SectionContainer.tsx` - Renders sections and columns
- `BlockWrapper.tsx` - Wraps individual blocks
- `InspectorPanel.tsx` - Property editor

**Any changes to these files require extra scrutiny for re-render correctness.**

# Quick Reference Card

## 🚨 Critical Rules

### React.memo
```typescript
// ✅ GOOD - Default comparison
const Component = memo(Component);

// ❌ BAD - Custom comparison blocks updates
const Component = memo(Component, (prev, next) => 
  prev.id === next.id
);
```

### State Updates
```typescript
// ✅ GOOD - Immutable
const newSections = state.sections.map(section => ({
  ...section,
  blocks: section.blocks.map(col =>
    col.map(b => b.id === id ? { ...b, ...updates } : b)
  ),
}));

// ❌ BAD - Mutation
state.sections[0].blocks[0][0].width = 50;
```

### Updating Blocks
```typescript
// ✅ User action (with history)
updateBlockWithHistory(blockId, { width: 50 });

// ✅ Programmatic (no history)
updateBlock(blockId, { width: 50 });
```

## 📋 Testing Checklist

After ANY change:
- [ ] Inspector updates → canvas updates immediately
- [ ] Preview mode works
- [ ] Undo/redo works
- [ ] Drag and drop works
- [ ] No console errors

## 🔧 Common Tasks

### Add New Block Type
1. Define in `editorConfig.ts`
2. Create `blocks/NewBlock.tsx`
3. Add to `BlockRenderer.tsx`
4. Add to `BlockLibrary.tsx`
5. Add inspector fields (optional)

### Add Reducer Action
1. Add to `ACTIONS` constant
2. Add to `EditorAction` type
3. Implement in reducer (immutably!)
4. Add helper in `EditorContext.tsx`

### Debug Re-render Issues
1. Check for custom memo comparisons
2. Verify reducer creates new objects
3. Add console.logs to track props
4. Use React DevTools Profiler

## 📁 Critical Files

- `EditorContext.tsx` - State provider
- `editorReducer.ts` - State mutations
- `SectionContainer.tsx` - Section rendering
- `BlockWrapper.tsx` - Block rendering
- `InspectorPanel.tsx` - Property updates

## 🎯 State Flow

```
Inspector → updateBlockWithHistory → dispatch
  ↓
Reducer (new state) → Context updates
  ↓
Components re-render → Canvas updates
```

## ⚠️ Common Mistakes

1. **Custom memo comparison** → Blocks re-renders
2. **State mutation** → Breaks immutability
3. **Missing dependencies** → Stale closures
4. **Forgetting history** → Undo/redo breaks
5. **Ignoring preview mode** → UI shows in preview

## 🐛 Quick Fixes

### Canvas not updating?
→ Remove custom memo comparisons

### Undo/redo broken?
→ Check pushHistory() calls

### Drag and drop not working?
→ Verify DndContext wraps canvas

### Performance issues?
→ Use React DevTools Profiler

## 📚 Documentation

- `.kiro/steering/react-performance-rules.md`
- `.kiro/steering/project-architecture.md`
- `.kiro/steering/code-modification-guidelines.md`
- `docs/PROJECT-GUIDE.md`
- `docs/BUGFIX-MEMO-RERENDER.md`

## 💡 Remember

**Quality over speed.**
**Follow existing patterns.**
**Test thoroughly.**
**When in doubt, ask for help.**

---

Keep this file open while coding!

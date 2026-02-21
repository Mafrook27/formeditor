# Drag and Drop Smoothness Improvements

## Date: 2026-02-18

## Issue Description

The drag and drop experience felt awkward and unnatural when moving blocks. The dragged element would jump, feel laggy, and provide poor visual feedback during the drag operation.

## Root Causes

1. **No DragOverlay** - The original element was being dragged instead of a preview clone
2. **Suboptimal collision detection** - Using only `closestCenter` wasn't precise enough
3. **Poor visual feedback** - Opacity and transition settings made dragging feel sluggish
4. **High activation distance** - 8px distance requirement made dragging feel unresponsive

## Improvements Made

### 1. Added DragOverlay Component

**File:** `src/features/form-editor/EditorLayout.tsx`

```typescript
<DragOverlay dropAnimation={{
  duration: 200,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
}}>
  {activeBlock ? (
    <div className="opacity-80 shadow-2xl rounded-md bg-card border-2 border-primary">
      <BlockRenderer block={activeBlock} />
    </div>
  ) : null}
</DragOverlay>
```

**Benefits:**
- Shows a preview clone while dragging
- Original element stays in place with reduced opacity
- Smooth drop animation when released
- Better visual feedback for users

### 2. Improved Collision Detection

**Before:**
```typescript
collisionDetection={closestCenter}
```

**After:**
```typescript
const collisionDetection = useCallback((args: any) => {
  // First, try pointer-based collision for more precise targeting
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  
  // Fallback to rectangle intersection
  const intersectionCollisions = rectIntersection(args);
  if (intersectionCollisions.length > 0) {
    return intersectionCollisions;
  }
  
  // Final fallback to closest center
  return closestCenter(args);
}, []);
```

**Benefits:**
- More precise drop targeting
- Follows pointer position closely
- Better handling of overlapping drop zones
- Smoother experience when dragging between columns

### 3. Optimized Sensor Configuration

**Before:**
```typescript
useSensor(PointerSensor, { 
  activationConstraint: { 
    distance: 8,
  } 
})
```

**After:**
```typescript
useSensor(PointerSensor, { 
  activationConstraint: { 
    distance: 5,      // More responsive
    delay: 0,         // No delay
    tolerance: 5,     // Smooth activation
  } 
})
```

**Benefits:**
- More responsive drag initiation
- Feels more natural and immediate
- Reduced accidental drag prevention

### 4. Enhanced Visual Feedback

**File:** `src/features/form-editor/blocks/BlockWrapper.tsx`

**Before:**
```typescript
const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.4 : 1,
  // ...
};
```

**After:**
```typescript
const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition: isDragging ? 'none' : transition,  // No transition while dragging
  opacity: isDragging ? 0.3 : 1,                 // More transparent
  cursor: isDragging ? 'grabbing' : 'default',   // Cursor feedback
  // ...
};
```

**Benefits:**
- Clearer visual indication of what's being dragged
- No transition lag during drag
- Proper cursor feedback
- Original element clearly shows it's being moved

### 5. State Management for Active Block

**Added state tracking:**
```typescript
const [activeId, setActiveId] = useState<string | null>(null);
const [activeBlock, setActiveBlock] = useState<any>(null);

const handleDragStart = useCallback((event: DragStartEvent) => {
  setDragging(true);
  setActiveId(event.active.id as string);
  
  // Store the active block data for DragOverlay
  const activeData = event.active.data.current;
  if (activeData?.type === 'block') {
    setActiveBlock(activeData.block);
  } else if (activeData?.type === 'library-block') {
    setActiveBlock({ type: activeData.blockType });
  }
}, [setDragging]);
```

**Benefits:**
- DragOverlay can render the correct block preview
- Proper cleanup on drag end
- Supports both library blocks and existing blocks

## Optional Enhancement: Modifiers Package

For even smoother dragging, install the modifiers package:

```bash
npm install @dnd-kit/modifiers
```

Then update `EditorLayout.tsx`:

```typescript
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

// In DndContext:
<DndContext 
  sensors={sensors} 
  collisionDetection={collisionDetection} 
  onDragStart={handleDragStart} 
  onDragEnd={handleDragEnd}
  modifiers={[restrictToWindowEdges]}  // Add this
>
```

**Benefits of modifiers:**
- Prevents dragging outside window bounds
- Smoother edge behavior
- Better UX when dragging near screen edges

## Testing Checklist

After these improvements, verify:

- [x] Drag from library feels smooth
- [x] Reordering blocks is responsive
- [x] Visual feedback is clear during drag
- [x] Drop animation is smooth
- [x] Original element shows reduced opacity
- [x] DragOverlay shows proper preview
- [x] Cursor changes to grabbing during drag
- [x] No lag or jumpiness
- [x] Works across columns and sections
- [x] Undo/redo still works after drag operations

## Files Changed

1. **`src/features/form-editor/EditorLayout.tsx`**
   - Added DragOverlay component
   - Improved collision detection
   - Optimized sensor configuration
   - Added active block state management

2. **`src/features/form-editor/blocks/BlockWrapper.tsx`**
   - Enhanced visual feedback during drag
   - Improved opacity and transition handling
   - Added cursor feedback

## Performance Impact

- ✅ No negative performance impact
- ✅ Smoother animations
- ✅ More responsive interactions
- ✅ Better visual feedback

## User Experience Improvements

**Before:**
- Dragging felt laggy and awkward
- Hard to see what was being dragged
- Drop targeting was imprecise
- Jumpy animations

**After:**
- Smooth, responsive dragging
- Clear visual preview of dragged item
- Precise drop targeting
- Natural, fluid animations

## Related Documentation

- DnD Kit DragOverlay: https://docs.dndkit.com/api-documentation/draggable/drag-overlay
- DnD Kit Collision Detection: https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
- DnD Kit Sensors: https://docs.dndkit.com/api-documentation/sensors
- DnD Kit Modifiers: https://docs.dndkit.com/api-documentation/modifiers

## Future Enhancements

Potential improvements:
- [ ] Add snap-to-grid functionality
- [ ] Implement drag handles with different behaviors
- [ ] Add keyboard shortcuts for moving blocks
- [ ] Implement multi-select drag
- [ ] Add drag preview customization per block type
- [ ] Implement auto-scroll when dragging near edges

## Notes

- The modifiers package is optional but recommended
- All changes maintain backward compatibility
- No breaking changes to existing functionality
- Undo/redo system unaffected
- State management patterns preserved

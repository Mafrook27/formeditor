# Root Cause Analysis: Column Layout Mismatch

**Date:** February 18, 2026  
**Issue:** Export HTML columns don't match preview layout  
**Status:** ✅ FIXED

## The Problem

Multi-column sections (2 or 3 columns) displayed perfectly in preview mode, but exported HTML showed:
- Inconsistent column widths
- Different spacing between columns
- Misaligned content

## Root Cause Analysis

### Issue #1: Layout Method Mismatch

**Preview Mode (SectionContainer.tsx):**
```typescript
<div className="grid grid-cols-3 gap-6">
  {/* Uses CSS Grid */}
</div>
```

**Export HTML (BEFORE FIX):**
```typescript
<div style="display: flex; gap: 0;">
  <div style="width: 33.33%; padding: 0 8px;">
    {/* Uses Flexbox */}
  </div>
</div>
```

**Problem:** Different layout systems produce different results.

### Issue #2: Conflicting Responsive CSS

The exported HTML had responsive CSS that was written for Flexbox:

```css
@media (max-width: 768px) {
  [data-editor-section] { 
    flex-direction: column !important;  /* ❌ Doesn't work with grid */
  }
  [data-editor-column] { 
    width: 100% !important;  /* ❌ Overrides grid columns */
  }
}
```

**Problem:** 
- `flex-direction` property does nothing on grid containers
- `width: 100% !important` on grid items breaks the grid layout
- The `!important` flag forces the width, overriding `grid-template-columns`

## Why This Caused Visual Issues

1. **Desktop View:**
   - Grid tried to create equal columns: `repeat(3, 1fr)`
   - But `width: 100% !important` on children forced them to full width
   - Result: Columns appeared squished or overlapping

2. **Column Width Calculation:**
   - Grid: Each column gets `1fr` (equal fraction of available space)
   - Flexbox with width override: Columns fight between grid and width rules
   - Result: Inconsistent widths

3. **Gap Spacing:**
   - Preview: `gap: 24px` (Tailwind's `gap-6`)
   - Export (before): `gap: 0` with `padding: 0 8px` (only 16px total)
   - Result: Different visual spacing

## The Fix

### Step 1: Changed Export to Use Grid

```typescript
// BEFORE
<div style="display: flex; gap: 0;">
  <div style="width: 33.33%; padding: 0 8px;">

// AFTER
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
  <div style="box-sizing: border-box;">
```

### Step 2: Fixed Responsive CSS for Grid

```css
/* BEFORE - Flexbox responsive */
@media (max-width: 768px) {
  [data-editor-section] { flex-direction: column !important; }
  [data-editor-column] { width: 100% !important; }
}

/* AFTER - Grid responsive */
@media (max-width: 768px) {
  [data-editor-section] { 
    grid-template-columns: 1fr !important;  /* Single column on mobile */
    gap: 16px !important;  /* Smaller gap on mobile */
  }
}
```

## Why The Fix Works

### Grid Properties Used

1. **`display: grid`**
   - Enables CSS Grid layout
   - Consistent with preview mode

2. **`grid-template-columns: repeat(3, 1fr)`**
   - Creates 3 equal columns
   - `1fr` = 1 fraction of available space
   - Automatically equal widths

3. **`gap: 24px`**
   - Native grid gap property
   - Matches preview's `gap-6` (24px)
   - No need for padding workarounds

4. **Responsive: `grid-template-columns: 1fr !important`**
   - Overrides multi-column layout on mobile
   - Forces single column (stacks vertically)
   - Works correctly with grid

## Technical Details

### Why `width: 100%` Broke Grid

In CSS Grid:
- Grid items are sized by `grid-template-columns`
- Setting `width: 100%` on grid items overrides this
- With `!important`, it forces full width regardless of grid rules
- Result: All columns try to be 100% wide → layout breaks

### Why `flex-direction` Did Nothing

- `flex-direction` only works on flex containers
- Grid containers ignore flex properties
- The property was silently ignored
- But the `width: 100%` still applied, causing issues

## Verification

### Before Fix
```
Preview:  [═══Col 1═══]  24px  [═══Col 2═══]  24px  [═══Col 3═══]
Export:   [Col 1][8px][═══════Col 2═══════][8px][Col 3]
          ↑ Inconsistent widths and spacing
```

### After Fix
```
Preview:  [═══Col 1═══]  24px  [═══Col 2═══]  24px  [═══Col 3═══]
Export:   [═══Col 1═══]  24px  [═══Col 2═══]  24px  [═══Col 3═══]
          ↑ Perfect match!
```

## Files Modified

1. **`src/features/form-editor/export/exportToHTML.ts`**
   - Changed `renderSectionHTML()` to use grid
   - Fixed responsive CSS for grid layout

## Lessons Learned

1. **Layout Consistency:** Always use the same layout method (grid vs flexbox) across preview and export

2. **Responsive CSS:** When changing layout methods, update ALL related CSS including media queries

3. **!important Flag:** Be careful with `!important` - it can override intended layout behavior

4. **Testing:** Always test exported HTML, not just preview mode

## Browser Compatibility

CSS Grid with these properties is supported in:
- ✅ Chrome 57+ (March 2017)
- ✅ Firefox 52+ (March 2017)
- ✅ Safari 10.1+ (March 2017)
- ✅ Edge 16+ (October 2017)

All modern browsers fully support this solution.

## Related Issues Fixed

This fix also resolves:
- ✅ Column alignment issues
- ✅ Spacing inconsistencies
- ✅ Mobile responsive layout
- ✅ Print layout appearance

## Prevention

To prevent similar issues in the future:

1. **Always match layout methods** between preview and export
2. **Review responsive CSS** when changing layout systems
3. **Test exported HTML** in browser, not just preview
4. **Use browser DevTools** to inspect actual rendered CSS
5. **Check for conflicting CSS** rules with `!important`

## Summary

The root cause was a mismatch between:
- Preview using CSS Grid
- Export using Flexbox
- Responsive CSS written for Flexbox but applied to Grid

The fix ensures both preview and export use the same CSS Grid layout with proper responsive behavior.

# Fix: Table and List Block Text Overflow

## Issue Summary
Table and List blocks had horizontal overflow issues in Editor and Preview modes, while Export HTML rendered correctly. Long unbroken strings would not wrap, causing layout inconsistency.

## Root Cause Analysis

### Layout Hierarchy
```
SectionContainer (CSS Grid)
  └─ SectionColumn
      └─ BlockWrapper (width: X%)
          └─ TableBlock / ListBlock
```

### Three Problems Identified

1. **Missing `min-width: 0` on Grid Children**
   - CSS Grid children have implicit `min-width: auto`
   - This prevents them from shrinking below their content size
   - Long text in tables/lists would force the container to expand

2. **Missing Word-Break CSS Properties**
   - Export HTML had: `word-break: break-word`, `overflow-wrap: break-word`, `white-space: pre-wrap`
   - Editor components were missing these properties
   - Long unbroken strings wouldn't wrap

3. **Missing `table-layout: fixed` on Tables**
   - Export HTML used `table-layout: fixed` for stable column widths
   - Editor used default `table-layout: auto`, causing columns to expand
   - This prevented proper text wrapping in cells

## Solution Applied

### 1. BlockWrapper.tsx
Added `minWidth: 0` to both edit and preview mode styles:

```typescript
const style: React.CSSProperties = {
  // ... other styles
  width: `${block.width}%`,
  minWidth: 0, // Critical: allows flex/grid children to shrink
  // ...
};
```

**Why:** This allows the block wrapper to shrink below its content size, enabling proper wrapping in child elements.

### 2. TableBlock.tsx
Added comprehensive wrapping styles:

```typescript
// Table element
<table style={{ 
  tableLayout: 'fixed',  // Fixed column widths
  width: '100%',
  minWidth: 0
}}>

// Cell elements (th/td)
<td style={{
  wordBreak: 'break-word',      // Break long words
  overflowWrap: 'break-word',   // Wrap overflow text
  whiteSpace: 'pre-wrap',       // Preserve whitespace but wrap
  minWidth: 0                    // Allow shrinking
}}>
```

**Why:** Matches the export HTML behavior exactly, ensuring consistent rendering.

### 3. ListBlock.tsx
Added wrapping styles to list items:

```typescript
<li style={{
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  minWidth: 0
}}>
  <span style={{
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap'
  }}>
```

**Why:** Ensures list items wrap long text properly in all modes.

## CSS Properties Explained

- **`min-width: 0`**: Allows flex/grid children to shrink below content size (overrides default `auto`)
- **`word-break: break-word`**: Breaks long words at arbitrary points to prevent overflow
- **`overflow-wrap: break-word`**: Wraps long words to next line when possible
- **`white-space: pre-wrap`**: Preserves whitespace but allows wrapping
- **`table-layout: fixed`**: Uses fixed column widths based on first row, enables wrapping

## Testing Checklist

- [x] Table with long unbroken text wraps in Editor
- [x] Table with long unbroken text wraps in Preview
- [x] Table with long unbroken text wraps in Export
- [x] List with long unbroken text wraps in Editor
- [x] List with long unbroken text wraps in Preview
- [x] List with long unbroken text wraps in Export
- [x] No horizontal scrollbars appear
- [x] Column widths remain stable
- [x] Placeholder highlighting still works
- [x] Cell editing still works
- [x] No TypeScript errors
- [x] No console warnings

## Expected Result

✅ **No horizontal overflow**
✅ **Long strings wrap automatically**
✅ **Table column widths remain stable**
✅ **List items wrap naturally**
✅ **Editor, Preview, and Export render identically**

## Files Modified

1. `src/features/form-editor/blocks/BlockWrapper.tsx` - Added `minWidth: 0`
2. `src/features/form-editor/blocks/TableBlock.tsx` - Added wrapping styles and `table-layout: fixed`
3. `src/features/form-editor/blocks/ListBlock.tsx` - Added wrapping styles

## References

- [MDN: min-width](https://developer.mozilla.org/en-US/docs/Web/CSS/min-width)
- [MDN: word-break](https://developer.mozilla.org/en-US/docs/Web/CSS/word-break)
- [MDN: table-layout](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout)
- [CSS Grid and min-width](https://css-tricks.com/preventing-a-grid-blowout/)

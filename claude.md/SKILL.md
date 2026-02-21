# SparkLMS HTML Editor — SKILL.md
# Claude Code: Read this FIRST before touching any file.

## What This Product Is

SparkLMS is a **fintech agent platform**. Agents (internal staff, loan officers) use this
editor to:
1. Create and manage **HTML email templates** — sent to customers (loan approvals,
   repayment reminders, KYC requests, OTPs, statements)
2. Create and manage **HTML document templates** — loan agreements, sanction letters,
   NOCs, repayment schedules
3. Import **any external HTML** (Bootstrap emails, Outlook HTML exports, Mailchimp
   exports, Word-saved-as-HTML, third-party templates) and make them editable
4. Export clean HTML that renders correctly across email clients and browsers

**This is an internal tool. The end users are trained fintech agents, not consumers.**
Design for power users who need precision, speed, and reliability.

---

## Core Product Principles (Non-Negotiable)

### 1. Round-Trip Fidelity
Export → Import → Edit → Export again must produce **identical visual output**.
No data loss. No style drift. No layout breaks.
This is the #1 most important technical requirement.

### 2. External HTML Compatibility
ANY valid HTML pasted or uploaded must:
- Parse without crashing
- Render visually identical to the original
- Be editable block by block
- Export cleanly
If we can't parse a section cleanly into blocks, wrap it as a **Raw HTML block**
and still let the agent edit the raw code. Never discard content.

### 3. Canva-Level Feel for Layout
- Click to select any element
- Drag to reorder
- Resize columns by dragging handles
- Inline text editing (double-click)
- Snap-to-grid alignment
- Multi-select with Shift+click

### 4. Spreadsheet-Level Precision for Properties
- Exact px/% values in inspector — not just sliders
- Tab between fields like a spreadsheet
- Arrow keys increment/decrement numbers
- Copy styles between blocks (Format Painter)
- Bulk edit selected blocks

### 5. Zero Silent Failures
Every operation must succeed visibly or fail with a clear actionable error message.
Never silently swallow errors. Never render broken UI.

---

## Known Bugs — Fix All of These

### BUG-001: Placeholder Not Rendering
**Problem**: `inputType` / `type` set in inspector but `placeholder` attribute not
applied to rendered `<input>` element in canvas.
**Root cause**: Block component reads `block.placeholder` but inspector updates
`block.inputType` as a separate key — the spread `{...block}` misses the DOM attribute.
**Fix**: In `TextInputBlock.tsx`, explicitly bind:
```tsx
<input
  type={block.inputType ?? 'text'}
  placeholder={block.placeholder ?? ''}
  ...
/>
```
Apply same pattern to ALL input-type blocks: textarea, date-picker, dropdown.

### BUG-002: Background Color Not Applied / Crashes
**Problem**: Background color picker in Style tab throws error or does nothing.
**Root cause**: `backgroundColor` is `undefined` on blocks created before the
property was added. The color picker receives `undefined` and crashes.
**Fix**:
1. Add `backgroundColor: ''` to `BASE_DEFAULTS` in `editorConfig.ts`
2. In style tab: `value={block.backgroundColor ?? ''}` 
3. Guard in block components: `style={{ backgroundColor: block.backgroundColor || undefined }}`
   (undefined removes the attribute, empty string sets blank background)

### BUG-003: Margin/Padding Not Applied Consistently
**Problem**: Margin and padding values set in Layout tab sometimes have no effect.
**Root cause**: Block components apply margin/padding inconsistently — some use
`style` prop on wrapper div, some on inner element, some don't apply at all.
**Fix**: Every block must have a **single outer wrapper div** that receives ALL
layout styles:
```tsx
const layoutStyle = {
  width: `${block.width}%`,
  marginTop: block.marginTop,
  marginBottom: block.marginBottom,
  marginLeft: block.marginLeft,
  marginRight: block.marginRight,
  paddingTop: block.paddingY,
  paddingBottom: block.paddingY,
  paddingLeft: block.paddingX,
  paddingRight: block.paddingX,
  backgroundColor: block.backgroundColor || undefined,
  border: block.borderWidth ? `${block.borderWidth}px ${block.borderStyle ?? 'solid'} ${block.borderColor ?? '#e5e7eb'}` : undefined,
  borderRadius: block.borderRadius ? `${block.borderRadius}px` : undefined,
};
return <div style={layoutStyle}>{/* actual block content */}</div>;
```

### BUG-004: Table Block Broken / Not Editable
**Problem**: Table renders as static HTML. Cannot edit cell content, add/remove
rows or columns.
**Fix**: Build a full `TableBlock` with:
- Click cell to inline-edit (contentEditable or controlled input)
- Right-click context menu: Insert Row Above/Below, Insert Column Left/Right,
  Delete Row, Delete Column
- Header toggle (first row as `<th>`)
- Striped rows toggle
- Inspector: column widths, cell padding, border style, header background color

### BUG-005: React.memo Custom Comparators Breaking Re-renders
**Problem**: Some components use custom `memo` comparators that block legitimate
re-renders when block properties change.
**Fix**: Remove ALL custom comparators. Use default shallow comparison only.
The immutable update pattern in the reducer guarantees new object references.

### BUG-006: Import Parser Discards Unknown Elements
**Problem**: External HTML elements not recognized by the parser are silently dropped.
**Fix**: Unknown elements → `RawHTMLBlock` with their original outerHTML preserved.
Never discard. Log what was wrapped.

### BUG-007: Inspector Number Inputs Accept Invalid Values
**Problem**: Typing letters in px inputs, or clearing to empty, corrupts state.
**Fix**: Use a `<NumberInput>` reusable component that:
- Only allows numeric input
- Clamps to min/max on blur
- Resets to 0 if cleared and blurred
- Supports arrow keys to increment/decrement by 1 (Shift+arrow = 10)

---

## Architecture Rules

### File Structure (Enforce Strictly)
```
src/
├── app/                     # Router, providers, root layout
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── form-editor/
│       ├── blocks/          # One file per block type
│       ├── canvas/          # SectionContainer, Column, AddSection
│       ├── toolbar/         # TopToolbar, BlockLibrary
│       ├── inspector/       # InspectorPanel + per-block inspectors
│       ├── export/          # htmlExporter.ts
│       ├── import/          # htmlParser.ts  ← rename from parser/
│       ├── templates/       # templatePlugin.ts
│       ├── hooks/           # useEditor, useBlockById, useKeyboard
│       ├── EditorContext.tsx
│       ├── editorReducer.ts
│       └── editorConfig.ts
└── shared/
    ├── ui/                  # shadcn/ui components (auto-generated)
    └── components/          # Custom reusable: NumberInput, ColorPicker,
                             # PropertyRow, SliderInput, ConfirmDialog,
                             # EmptyState, Toast wrapper
```

### Code Splitting (Mandatory)
```tsx
// In router.tsx — lazy load the editor
const FormEditorPage = lazy(() => import('./features/form-editor/pages/FormEditorPage'));
const DashboardPage  = lazy(() => import('./features/dashboard/pages/DashboardPage'));
```

### Reusable Components (Use These Everywhere)
These must exist in `src/shared/components/` and be used consistently:

**`NumberInput`** — for all px/% inspector values
**`ColorPicker`** — for all color properties (wraps `<input type="color">` + hex text input)
**`PropertyRow`** — label + control in inspector (consistent spacing)
**`SliderWithInput`** — Slider + NumberInput side by side
**`ConfirmDialog`** — for delete actions (shadcn AlertDialog)
**`SectionDivider`** — for grouping inspector sections

### Performance Rules
- `React.memo` (default comparator) on: `BlockWrapper`, `BlockRenderer`, `SectionContainer`, `SectionColumn`
- `useCallback` on all dispatch-calling functions in EditorContext
- `useMemo` on: selected block selector, library categories, block count
- Never derive state inside render — use selectors
- Use `useRef` for drag state (don't put in React state)

### State Rules
- ALL state lives in EditorContext via useReducer
- NO local useState for editor data — only for UI-only ephemeral state (hover, focus)
- History snapshots are deep clones of `sections` array only
- Selected block is looked up from sections by ID — not stored separately as object

---

## HTML Import — The Most Critical Feature

### Parser Strategy (Priority Order)
The parser must attempt recognition in this order:

1. **SparkLMS native** — has `data-spark-type` attributes → parse as structured blocks
2. **Table-based email HTML** — has `<table>` root layout → parse as structured sections
3. **Div-based HTML** — modern div layout → parse as structured sections  
4. **Unknown/complex HTML** — wrap entire body as single RawHTMLBlock

### For Each HTML Element, Map To:
```
<h1>-<h6>              → HeadingBlock
<p>                    → ParagraphBlock
<a> standalone         → HyperlinkBlock
<input type="text">    → TextInputBlock
<input type="email">   → TextInputBlock (inputType: 'email')
<input type="tel">     → TextInputBlock (inputType: 'tel')
<input type="number">  → TextInputBlock (inputType: 'number')
<input type="date">    → DatePickerBlock
<textarea>             → TextareaBlock
<select>               → DropdownBlock
<input type="radio">   → RadioGroupBlock (group by name)
<input type="checkbox"> → CheckboxGroupBlock / SingleCheckboxBlock
<hr>                   → DividerBlock
<img>                  → ImageBlock
<table> (data)         → TableBlock
<ul>, <ol>             → ListBlock
<button>               → ButtonBlock
<div class="signature"> → SignatureBlock
anything else          → RawHTMLBlock (preserves outerHTML exactly)
```

### Style Extraction
When parsing any element, extract computed/inline styles:
```ts
function extractStyles(el: Element): Partial<BaseBlock> {
  const s = (el as HTMLElement).style;
  return {
    backgroundColor: s.backgroundColor || '',
    borderColor: s.borderColor || '',
    borderWidth: parseInt(s.borderWidth) || 0,
    borderRadius: parseInt(s.borderRadius) || 0,
    marginTop: parseInt(s.marginTop) || 0,
    marginBottom: parseInt(s.marginBottom) || 0,
    marginLeft: parseInt(s.marginLeft) || 0,
    marginRight: parseInt(s.marginRight) || 0,
    paddingX: parseInt(s.paddingLeft) || 0,
    paddingY: parseInt(s.paddingTop) || 0,
    width: parseInt(s.width) || 100,
  };
}
```

### Native Export Metadata
When exporting, embed metadata in an HTML comment so reimport is perfect:
```html
<!-- spark-metadata: {"version":"1.0","sections":[...full JSON...]} -->
```
On import, check for this comment first. If found, use it directly — skip DOM parsing.
This gives 100% round-trip fidelity for SparkLMS-native files.

---

## Export Requirements

### For Email HTML
- Inline all CSS (no `<style>` tags — Gmail strips them)
- Use `<table>` layout for multi-column sections (Outlook compatibility)
- Max width 600px
- All images must have `alt` text
- Font stack must include web-safe fallbacks
- Add `<!-- spark-metadata: {...} -->` comment at end

### For Document HTML
- Can use `<style>` tags (rendered in browser)
- Max width 860px
- Print-friendly CSS (`@media print`)
- Page break hints between sections
- Add `<!-- spark-metadata: {...} -->` comment at end

---

## Inspector Panel — Exact Behavior Required

### Number Fields
- Click to focus, select all text
- Arrow Up/Down: +1/-1
- Shift + Arrow: +10/-10
- Min 0, Max varies by property
- On blur: validate and clamp, update block

### Color Fields  
- Show color swatch + hex input side by side
- Click swatch → native color picker
- Type hex directly → live preview
- Empty = transparent/none (not black)

### Slider + Input
- Slider and number input always in sync
- Dragging slider updates number input live
- Typing in number input moves slider

### Tab Navigation
- Tab through all inspector fields like a spreadsheet
- Shift+Tab goes backwards
- Enter confirms and moves to next field

---

## Security

- All imported HTML must be sanitized via DOMPurify before parsing
- Strip `<script>` tags on import
- Strip `on*` event attributes on import
- Allow `style` attributes (required for editing)
- Allow `data-*` attributes (required for metadata)
- Sanitize on display in RawHTMLBlock using `dangerouslySetInnerHTML` with DOMPurify

---

## Testing Checklist Claude Code Must Verify

After all changes:
- [ ] Import SparkLMS-exported HTML → reopens identically
- [ ] Import external Bootstrap email → renders, is editable, exports cleanly
- [ ] Import plain HTML string → renders as RawHTMLBlock, editable
- [ ] All 18 block placeholders render correctly
- [ ] Background color works on all block types
- [ ] Margin/padding applies correctly on all block types
- [ ] Table is fully editable (inline cell editing)
- [ ] Undo/Redo works across 10 consecutive operations
- [ ] No console errors or warnings in normal usage
- [ ] Code-split bundles: editor chunk loads separately from login/dashboard

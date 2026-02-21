# SparkLMS Editor — QA Testing Checklist
# Run this after every refactor. All items must pass before shipping.

---

## 1. Import Testing

### 1A — SparkLMS Native Round-Trip
- [ ] Export a form from the editor → save the HTML file
- [ ] Import the same file back → sections, blocks, and all properties must be identical
- [ ] Edit any block after reimport → changes apply correctly
- [ ] Export again → file is valid HTML

### 1B — External HTML: Bootstrap Email
Paste this into the Import field:
```html
<!DOCTYPE html>
<html>
<body>
  <div style="max-width:600px;margin:0 auto;">
    <h1 style="color:#1E40AF;">Welcome to SparkLMS</h1>
    <p style="color:#374151;">Your loan application has been received.</p>
    <a href="#" style="background:#1E40AF;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">View Application</a>
    <hr style="border-top:1px solid #E5E7EB;margin:24px 0;" />
    <p style="font-size:12px;color:#9CA3AF;">SparkLMS Fintech Pvt Ltd</p>
  </div>
</body>
</html>
```
Expected: Heading, Paragraph, Hyperlink, Divider, Paragraph blocks — all editable.

### 1C — External HTML: Table-Based Email
Paste this:
```html
<table width="600" cellpadding="0" cellspacing="0">
  <tr><td><h2>Loan Approved!</h2></td></tr>
  <tr>
    <td width="50%"><p>Borrower: John Doe</p></td>
    <td width="50%"><p>Amount: ₹5,00,000</p></td>
  </tr>
  <tr><td colspan="2"><button>Download Agreement</button></td></tr>
</table>
```
Expected: Sections created from rows, 2-column section for the middle row, Button block.

### 1D — External HTML: Word-Saved HTML
- [ ] Import a Word document saved as HTML
- [ ] Content renders (may contain many unknown elements → RawHTMLBlock is acceptable)
- [ ] No crash. No blank screen.

### 1E — Malformed HTML
Paste: `<h1>Hello<p>World</h2>`
- [ ] No crash
- [ ] Some blocks parsed, rest as RawHTMLBlock
- [ ] Warning messages shown in toast

### 1F — Empty Import
- [ ] Import empty HTML file → empty editor (not crashed)

---

## 2. Block-Level Bug Verification

### 2A — Placeholder (BUG-001)
For each block type, set placeholder text in inspector:
- [ ] TextInput → placeholder appears in canvas input field
- [ ] Textarea → placeholder appears in canvas textarea
- [ ] Dropdown → placeholder appears as first option
- [ ] DatePicker → placeholder visible

Also test: set `inputType = "email"` on TextInput → canvas input `type` attribute is `email`.

### 2B — Background Color (BUG-002)
- [ ] Select any block → go to Style tab → set Background Color to `#FEF3C7`
- [ ] Canvas block immediately shows yellow background
- [ ] Export to HTML → background color is in inline style
- [ ] Import back → background color preserved

### 2C — Margin & Padding (BUG-003)
- [ ] Select a Heading block → set Margin Bottom to 48
- [ ] Canvas shows increased spacing below heading
- [ ] Set Padding X to 24 → text indented inside block
- [ ] Export → margin/padding in inline CSS
- [ ] Import → values restored correctly

### 2D — Table Block (BUG-004)
- [ ] Add Table block to canvas
- [ ] Double-click a cell → can type new content
- [ ] Right-click cell → context menu shows: Insert Row Above, Insert Row Below, Insert Column Left, Insert Column Right, Delete Row, Delete Column
- [ ] Each action works correctly
- [ ] Inspector: toggle header row, toggle striped rows, set border color
- [ ] All changes appear in canvas immediately

---

## 3. Inspector Panel

- [ ] Every block type shows correct General Tab properties
- [ ] Layout Tab: Width slider works (25% to 100%)
- [ ] Layout Tab: All 4 margins independently adjustable (0–200px)
- [ ] Layout Tab: Padding X and Y work independently
- [ ] Style Tab: Background color picker opens and applies
- [ ] Style Tab: Border width slider + color work together
- [ ] Style Tab: Border radius slider rounds corners
- [ ] Number inputs: Arrow Up/Down changes value by 1
- [ ] Number inputs: Shift+Arrow changes value by 10
- [ ] Number inputs: Typing letters is blocked
- [ ] Number inputs: Clearing input and blurring resets to 0

---

## 4. Undo / Redo

- [ ] Add 5 blocks → Undo 5 times → canvas is empty
- [ ] Redo 5 times → all 5 blocks back
- [ ] Change a property → Undo → property reverts
- [ ] Delete a block → Undo → block reappears
- [ ] Ctrl+Z works (Windows/Linux)
- [ ] Cmd+Z works (Mac)
- [ ] Ctrl+Y / Ctrl+Shift+Z works for Redo

---

## 5. Export

### 5A — Email Mode
- [ ] Export produces valid HTML file
- [ ] HTML has `<table>` layout wrapper
- [ ] All CSS is inline (no `<style>` tags with rule blocks)
- [ ] `<!-- spark-metadata: {...} -->` comment at end of file
- [ ] File downloads with `.html` extension

### 5B — Document Mode
- [ ] Export produces valid HTML file
- [ ] HTML has `<style>` tag with print media query
- [ ] `<!-- spark-metadata: {...} -->` comment at end of file

### 5C — All Block Types Export
Verify each block type exports correct HTML:
- [ ] Heading → `<h2>` with correct level
- [ ] Paragraph → `<p>`
- [ ] TextInput → `<input type="..." placeholder="..." />`
- [ ] Textarea → `<textarea rows="...">`
- [ ] Dropdown → `<select>` with all options
- [ ] DatePicker → `<input type="date">`
- [ ] RadioGroup → grouped `<input type="radio">` with same `name`
- [ ] CheckboxGroup → multiple `<input type="checkbox">`
- [ ] Table → proper `<table>` with `<thead>` and `<tbody>`
- [ ] Button → `<button>` with correct variant styles
- [ ] Signature → bordered div with label
- [ ] RawHTML → raw content preserved exactly

---

## 6. Drag & Drop

- [ ] Drag block from library → drops onto column
- [ ] Drag existing block → reorders within column
- [ ] Drag existing block → moves to different column
- [ ] Drag existing block → moves to different section
- [ ] Accidental tiny drags (< 8px) do NOT trigger drag
- [ ] Locked block → drag handle not shown, cannot be dragged
- [ ] DragOverlay shows ghost preview

---

## 7. Performance

- [ ] Open editor with 50 blocks → no lag on scrolling
- [ ] Typing in a text input → canvas updates without lag
- [ ] Moving slider in inspector → canvas updates smoothly
- [ ] Initial page load: editor chunk loads separately from login chunk
  (Check Network tab in DevTools → separate JS bundles)

---

## 8. Error Handling

- [ ] Import invalid file type (e.g., .jpg) → toast error "Invalid file type"
- [ ] Import corrupted HTML → toast warning + partial blocks shown
- [ ] EditorErrorBoundary: crash inside canvas → error UI shown, not blank screen
- [ ] Delete section with blocks → ConfirmDialog shown, not immediate deletion

---

## 9. Security

- [ ] Import HTML with `<script>alert('xss')</script>` → script is stripped
- [ ] Import HTML with `onerror="alert(1)"` on an img → attribute stripped
- [ ] RawHTMLBlock: code is sanitized before dangerouslySetInnerHTML
- [ ] Exported HTML does not contain `<script>` tags from user content

---

## 10. Accessibility

- [ ] All form fields in inspector have `aria-label` or associated `<label>`
- [ ] Color picker accessible via keyboard (Tab → space to open)
- [ ] Dialogs trap focus (Tab cycles inside dialog)
- [ ] Block library items are keyboard-draggable (dnd-kit handles this)

---

## Sign-Off

| Area | Status | Notes |
|------|--------|-------|
| Import — SparkLMS native | | |
| Import — External HTML | | |
| BUG-001 Placeholders | | |
| BUG-002 Background Color | | |
| BUG-003 Margin/Padding | | |
| BUG-004 Table editing | | |
| Inspector precision | | |
| Undo/Redo | | |
| Export — Email | | |
| Export — Document | | |
| Performance | | |
| Security | | |

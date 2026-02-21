# External HTML Import Review (Verify.md)
Date: 2026-02-21

## Scope
- Reviewed `claude.md/verify.md` instructions.
- Reviewed current import pipeline in `src/features/form-editor/parser/HTMLParser.ts` and related components.
- Inspected sample files in `public/external_editor/`.

## Key Mismatch With verify.md
`claude.md/verify.md` references `src/features/form-editor/import/htmlParser.ts` and types like `BASE_DEFAULTS`. Those do not exist in this repo. The actual parser is `src/features/form-editor/parser/HTMLParser.ts`, and block types/props are defined in `src/features/form-editor/editorConfig.ts`. A direct copy of the verify.md parser will not compile without adapting to current types and component expectations.

## Why Imports Sometimes “Recognize” and Sometimes Fail
The current parser is tuned for a limited set of HTML patterns (editor-generated HTML or simple, semantic HTML). External HTML varies widely:
- Email templates are usually **table-based layout**. The parser treats **all tables as data tables**, which collapses layout into a single TableBlock and ignores images/links inside cells.
- Many templates rely on inline or legacy attributes (`bgcolor`, `align`, `cellpadding`, `width`) that are not consistently captured into block props.
- Inline markup within paragraphs (`<a>`, `<span>`, `<b>`) is flattened because `parseParagraphElement` uses `textContent`, not a mark-aware model.
- Multi-column layout is detected only from inline grid/flex or some CSS class heuristics; table-based columns are not promoted to sections.

Result: Some files import “okay” when they are mostly div/paragraph-based, but **table-based templates degrade into raw tables** or lose nested content.

## File-by-File Diagnosis (public/external_editor)
High-level structure and expected parser behavior. These are based on inspection and counts of tags:

- `doc_template/autotitle.loan.html`
  - Structure: heavy **layout tables**, nested divs, form inputs.
  - Current parser issue: tables treated as data; **images and inputs inside `<td>` are dropped**; inline styles lost; content becomes a single TableBlock or flattened text.
  - Missing elements: `<img>`, `<a>`, `<input>` inside table cells; per-row layout.

- `doc_template/CAB.html`
  - Structure: same as above (layout tables, large nested content).
  - Current parser issue: same as above.
  - Missing elements: images, inputs, nested content in `<td>`.

- `doc_template/CSo_loanagreement.html`
  - Structure: layout tables, many rows; form-like fields.
  - Current parser issue: same as above.
  - Missing elements: inputs and images inside `<td>`, formatting in paragraphs.

- `doc_template/collection.html`
  - Structure: single large **layout table** with inline styles; images inside `<td>`.
  - Current parser issue: table parsed as data table; **images in `<td>` dropped**, text flattened.
  - Missing elements: `<img>`, link text/formatting, cell-level styling.

- `doc_template/installmentloan.html`
  - Structure: fewer layout tables; some inputs.
  - Current parser issue: tables parsed as data; input inside table not mapped.
  - Missing elements: input fields and any inline cell content.

- `doc_template/payday.html`
  - Structure: mostly div-based; minimal table usage.
  - Current parser issue: paragraphs flatten inline markup; links/formatting not preserved.
  - Missing elements: inline styles, link formatting.

- `doc_template/SparkLMSCABTILA.html`
  - Structure: multiple tables, no `<th>` headers (likely layout tables).
  - Current parser issue: tables parsed as data; table content flattened.
  - Missing elements: images, links, nested cell content.

- `emailtemplate/aa.html`, `emailtemplate/dd.html`, `emailtemplate/mail.html`, `emailtemplate/withdrwan.html`
  - Structure: classic **email layout table** with centered wrapper table and content in `<td>`.
  - Current parser issue: tables treated as data tables; **images inside `<td>` dropped**; link and inline formatting lost.
  - Missing elements: `<img>`, `<a>`, bold/span styles; row-level content layout.

- `emailtemplate/c.html`
  - Structure: div-based with images and text.
  - Current parser issue: inline styles and formatting flattened; images ok if top-level but not inside complex wrappers.
  - Missing elements: inline styles; link formatting.

## Root Causes in Current Parser
- `parseTableElement` always assumes data table; no **layout vs data** detection.
- `extractCellText` ignores images and hyperlinks.
- `parseParagraphElement` uses `textContent`, so **inline markup (links, spans, bold)** is lost.
- `parseExternalHTML` only detects multi-column layouts from inline grid/flex or class heuristics; **table-based columns not mapped**.
- Raw HTML fallback exists but is rarely used for layout tables, so fidelity suffers.

## Is the App Approach Good or Bad?
Good foundation:
- Clear block model and editor state.
- HTML sanitization.
- Placeholder parsing and editor-generated export/import.

Weak areas for external HTML:
- Missing layout-table heuristics.
- Lossy parsing for inline formatting.
- Over-aggressive “data table” conversion.

Overall: the approach is **solid for editor-owned HTML**, but **too lossy for external HTML** without better heuristics and fallback behavior.

## How Major Form/HTML Builders Typically Handle This
Common patterns:
- **Multi-pass parsing**: detect editor-native vs external.
- **Layout table detection**: treat email tables as layout wrappers and parse cell contents as blocks/columns.
- **Graceful fallback**: when structure is too complex, wrap as Raw HTML rather than losing content.
- **Style preservation**: keep inline styles and critical attributes; avoid flattening inline markup.

No builder perfectly converts all arbitrary HTML to blocks, but they prioritize **fidelity + editability** and use fallbacks when needed.

## Optimization Recommendations (Highest Impact)
1. **Layout table detection**  
   If `role=presentation`, `cellpadding` exists, width >= 400, or no `<th>` headers, treat as layout table.

2. **Parse layout tables into sections**  
   For each `<tr>`, if multiple `<td>` cells, create a section with columns; parse cell children with `parseNode`.

3. **Never drop `<img>` inside `<td>`**  
   Ensure image elements inside container cells are parsed into ImageBlocks.

4. **Improve paragraph parsing**  
   Preserve inline markup using `MarkParser` or store `htmlContent` and render it in preview mode.

5. **Inline style extraction**  
   Capture `bgcolor`, `align`, `width`, `cellpadding`, and inline padding/margin into block props.

6. **Fallback to RawHTMLBlock when structure is too complex**  
   Prefer fidelity over lossy conversion for unsupported layouts.

## Minimal Change Path (Aligned With Current Types)
If you only change `src/features/form-editor/parser/HTMLParser.ts`:
- Add `isLayoutTable()` and route layout tables to a `parseLayoutTable()` that:
  - Iterates rows and cells.
  - Uses `parseNode` on each cell’s children.
  - Builds sections with 1–3 columns.
- Only keep `parseTableElement` for **real data tables**.

## Swarm/Agent Task Breakdown (Recommended)
1. Parser Agent  
   Implement layout table detection and row-to-section conversion.  
   Deliver: updated `HTMLParser.ts` with layout table handling.

2. Block/Style Agent  
   Improve inline style extraction; preserve inline formatting for paragraphs and links.  
   Deliver: enhanced style mapping and paragraph handling.

3. Rendering Agent  
   Ensure blocks render inline styles safely; RawHTMLBlock fallback remains functional.  
   Deliver: minimal render changes if needed.

4. Test Agent  
   Add import fixtures and snapshot tests for `public/external_editor/*`.  
   Deliver: automated import test script + manual checklist.

## Proposed Test Matrix
- Import each file in `public/external_editor/*` and verify:
  - No blank canvas.
  - Images visible (especially those inside tables).
  - Links and placeholders preserved.
  - Data tables become TableBlock; layout tables become sections.
  - Blocks remain editable.

## Bottom Line
Your app architecture is **good**, but the HTML import path is **too narrow** for external HTML. The main fix is **layout table recognition + deeper cell parsing + safer fallback**, with a small upgrade to inline style preservation.

################################################################################################################################
# best solution even user import external html not developed here make this setups proper 
# 🚀 SparkLMS Form Editor — Claude Code Master Improvement Prompt

> **How to use:** Copy this entire prompt and give it to Claude Code along with your project files and any external HTML templates you want to test with.

---

## CONTEXT

You are working on **SparkLMS** — a React 18 + TypeScript + Vite form editor with drag-and-drop capabilities. The editor allows users to build loan agreement forms visually and export/import them as HTML.

**Tech Stack:**
- React 18.3.1 + TypeScript
- Vite, React Router 6
- Tailwind CSS 4, Radix UI, shadcn/ui
- @dnd-kit (drag & drop)
- DOMPurify, html2canvas, jsPDF, signature_pad

---

## 🎯 MISSION

Perform a **complete end-to-end audit, bug fix, and feature improvement** of this project. The goal is a stable, professional, Canva/Google Sheets-level editing experience with robust HTML import/export that works with ANY external HTML file.

---

## 📋 PHASE 1 — FULL PROJECT AUDIT (Do This First)

Before writing any code, analyze the entire codebase and produce a checklist report covering:

### 1.1 Stability Issues (App Crashes)
- Find every location where the app can crash (uncaught errors, missing null checks, undefined access)
- Check all `block.type` switch/case statements — are all 18 block types handled? What happens on unknown type?
- Check drag-and-drop event handlers — can they crash if `over` or `active` is null/undefined?
- Check inspector panel — does it crash if `selectedBlock` is null when a section is deleted?
- Check history/undo-redo — does it crash at index boundaries?
- Check signature_pad initialization — does it crash if the canvas ref is null?
- Check the export and import functions — are all errors caught with try/catch?
- Identify any React `key` prop warnings that could cause rendering issues
- Find any infinite re-render loops (missing deps in useEffect, useCallback, useMemo)

### 1.2 State Management Issues
- Verify immutable updates at ALL nesting levels in the reducer
- Check that `React.memo` is used correctly (default shallow comparison only — no custom comparators)
- Verify the re-render chain: EditorContext → EditorLayout → SectionContainer → SectionColumn → BlockWrapper → BlockRenderer → Block
- Check that `selectedBlockId` is cleared when a block is deleted
- Check that `selectedSectionId` is cleared when a section is deleted
- Verify zoom state applies correctly to the canvas only (not sidebars)
- Check that `isDragging` resets properly if a drag is cancelled (e.g., user presses Escape)

### 1.3 HTML Import/Export — Root Cause Analysis
- Audit the HTML parser (`src/features/form-editor/parser/`) and identify every block type that fails to parse correctly from external HTML
- Specifically check: **tables, buttons, signatures, lists, images, raw HTML blocks, headings with inline styles, inputs with custom attributes**
- Identify why the round-trip (export → re-import) breaks layout/formatting
- Check if `DOMPurify` is stripping attributes needed for re-import (e.g., `data-block-type`, `data-block-id`)
- Check if inline styles are preserved correctly on export
- Check if multi-column layout structure is preserved in exported HTML
- Identify what metadata (if any) is embedded in exported HTML to recognize app-generated content

### 1.4 Editor Experience (Canvas/Spreadsheet Feel)
- Check if block selection is snappy and consistent
- Check if property changes in the inspector reflect instantly on the canvas
- Check if drag-and-drop is smooth — any jank, ghost artifacts, or wrong drop targets
- Check if the zoom control scales only the canvas (not toolbars)
- Check for any layout shifts when selecting/deselecting blocks
- Check block action buttons (Duplicate, Lock, Delete) — do they work reliably?

### 1.5 Missing Professional Features Checklist
Identify which of these are missing or broken:
- [ ] Background color per block
- [ ] Text color, font size, font family per block
- [ ] Border radius, border color, border width per block
- [ ] Block alignment (left, center, right)
- [ ] Rich text editing inside text/paragraph blocks
- [ ] Copy-paste blocks
- [ ] Multi-select blocks
- [ ] Keyboard delete selected block
- [ ] Section drag reordering
- [ ] Responsive preview (mobile/tablet/desktop)
- [ ] Global form styles (font, color theme)
- [ ] Page margins / padding control
- [ ] Required field validation indicators in preview
- [ ] Accessible labels and ARIA attributes in export

---

## 📋 PHASE 2 — FIX ALL BUGS AND CRASHES

Based on the Phase 1 audit, fix every issue found. Follow these rules:

### Rules for All Fixes
1. **Never break existing functionality** — test each fix mentally before applying
2. **Use TypeScript strictly** — no `any` types unless absolutely necessary, add proper interfaces
3. **Immutable state always** — every reducer case must spread at ALL levels
4. **Defensive coding** — add null/undefined guards before every property access on blocks, sections, columns
5. **Error boundaries** — wrap the canvas and inspector in React Error Boundaries so one bad block doesn't crash the whole app
6. **Proper cleanup** — all `useEffect` hooks that create subscriptions, timers, or event listeners must return cleanup functions

### Specific Fixes Required

#### Fix 1: App Crash Prevention
```
- Add a React Error Boundary component wrapping the canvas area
- Add a React Error Boundary wrapping the inspector panel
- Add null checks before every block property access in BlockRenderer
- Add a fallback "Unknown Block" renderer for unrecognized block types
- Wrap signature_pad initialization in try/catch with proper ref checks
- Add boundary checks to undo/redo (historyIndex >= 0 and < history.length)
```

#### Fix 2: Drag & Drop Stability
```
- In handleDragEnd: add early return if active or over is null/undefined
- Ensure isDragging resets to false in ALL code paths (success, error, cancel)
- Add onDragCancel handler that resets isDragging
- Verify column drop zones don't conflict with block drop zones
- Fix any case where dropping a block on itself causes issues
```

#### Fix 3: Inspector Panel
```
- Guard against selectedBlock being null/undefined before rendering any inspector content
- When a block is deleted, immediately clear selectedBlockId in the same dispatch
- When a section is deleted, clear selectedBlockId if it belonged to that section
- Debounce text input changes (300ms) to prevent excessive history snapshots
```

#### Fix 4: HTML Table Recognition
```
- Fix the HTML parser to correctly identify <table> elements and convert to TableBlock
- Preserve table structure: thead, tbody, tr, td, th with their content
- Export tables back to proper <table> HTML with inline styles
- Support tables from external HTML (Gmail, Word export, email templates)
```

#### Fix 5: Button Recognition  
```
- Fix parser to recognize <button>, <input type="submit">, <a class="btn"> as ButtonBlock
- Preserve button styles (background color, text color, border radius, padding)
- Support Bootstrap-style buttons (.btn .btn-primary etc.)
- Support inline-styled anchor tags used as buttons
```

#### Fix 6: Round-Trip Import/Export
```
- Add data-sparklms-block="[blockType]" attribute to every exported element
- Add data-sparklms-props="[JSON]" with serialized block properties (sanitized)
- In the parser: first check for data-sparklms-block attribute (fast path for app-generated HTML)
- If not found: use heuristic detection (slow path for external HTML)
- DOMPurify config: whitelist data-sparklms-* attributes so they survive sanitization
```

---

## 📋 PHASE 3 — HTML IMPORT INTELLIGENCE

Rewrite/refactor the HTML parser to handle external HTML files professionally.

### Parser Architecture

```typescript
// New parser strategy (implement this)
class HTMLBlockParser {
  
  // Strategy 1: App-generated HTML (fast path)
  parseAppGenerated(element: Element): EditorBlock | null {
    const blockType = element.getAttribute('data-sparklms-block');
    const propsJSON = element.getAttribute('data-sparklms-props');
    if (blockType && propsJSON) {
      return { type: blockType, ...JSON.parse(propsJSON) };
    }
    return null;
  }

  // Strategy 2: Semantic HTML detection (external HTML)
  parseBySemantics(element: Element): EditorBlock | null {
    const tag = element.tagName.toLowerCase();
    const type = element.getAttribute('type');
    const role = element.getAttribute('role');
    
    // Heading detection
    if (['h1','h2','h3','h4','h5','h6'].includes(tag)) return this.toHeadingBlock(element);
    
    // Paragraph detection
    if (tag === 'p') return this.toParagraphBlock(element);
    
    // Input detection
    if (tag === 'input') {
      if (type === 'text' || type === 'email' || type === 'tel' || type === 'number') 
        return this.toTextInputBlock(element);
      if (type === 'checkbox') return this.toCheckboxBlock(element);
      if (type === 'radio') return this.toRadioBlock(element);
      if (type === 'submit' || type === 'button') return this.toButtonBlock(element);
      if (type === 'date') return this.toDatePickerBlock(element);
    }
    
    // Table detection
    if (tag === 'table') return this.toTableBlock(element);
    
    // Button detection  
    if (tag === 'button') return this.toButtonBlock(element);
    if (tag === 'a' && this.looksLikeButton(element)) return this.toButtonBlock(element);
    
    // Select/Dropdown detection
    if (tag === 'select') return this.toDropdownBlock(element);
    
    // Textarea detection
    if (tag === 'textarea') return this.toTextareaBlock(element);
    
    // List detection
    if (tag === 'ul' || tag === 'ol') return this.toListBlock(element);
    
    // Divider detection
    if (tag === 'hr') return this.toDividerBlock(element);
    
    // Image detection
    if (tag === 'img') return this.toImageBlock(element);
    
    // Signature detection
    if (element.querySelector('canvas') || element.getAttribute('data-type') === 'signature') 
      return this.toSignatureBlock(element);
    
    // Fallback: raw HTML
    return this.toRawHTMLBlock(element);
  }

  // Strategy 3: Style-based detection (for complex email templates)
  parseByStyles(element: Element): EditorBlock | null {
    const style = window.getComputedStyle(element);
    const inlineStyle = element.getAttribute('style') || '';
    
    // Detect table-like layouts (used in email templates)
    if (inlineStyle.includes('display:table') || inlineStyle.includes('display: table'))
      return this.toTableBlock(element);
    
    // Detect button-like elements
    if (inlineStyle.includes('border-radius') && inlineStyle.includes('background') 
        && element.tagName === 'A')
      return this.toButtonBlock(element);
      
    return null;
  }
}
```

### External HTML Template Support
The parser must handle these real-world HTML sources:
1. **Email templates** (table-based layout, inline styles, font tags)
2. **Word/Google Docs exports** (complex nested divs, span-heavy markup)
3. **Bootstrap forms** (form-group, form-control classes)
4. **Tailwind HTML forms** (utility class-based)
5. **Raw HTML files** (plain semantic HTML5)
6. **PDF-exported HTML** (positional absolute/fixed layouts)

For each source type, the parser should:
- Extract all readable text content
- Identify form elements and convert to editable blocks
- Preserve visual styling (colors, fonts, sizes) as block properties
- Group related elements into sections intelligently
- Fall back to RawHTML block for anything unrecognizable

---

## 📋 PHASE 4 — NEW FEATURES TO ADD

### Feature 1: Background Color & Text Color per Block
```typescript
// Add to EditorBlock base interface:
interface BlockBaseStyles {
  backgroundColor: string;      // default: 'transparent'
  textColor: string;            // default: '#000000'  
  borderColor: string;          // default: 'transparent'
  borderWidth: number;          // default: 0
  borderRadius: number;         // default: 0
  opacity: number;              // default: 100
}

// In the Style tab of InspectorPanel, add:
// - Background color picker
// - Text color picker  
// - Border color picker + width slider + radius slider
// - Opacity slider
// Apply these styles to the block wrapper div in BlockWrapper component
```

### Feature 2: Canvas-Like Editing Experience
```
Improvements to make it feel like Canva:
- Smooth selection outline animation (CSS transition on border)
- Block hover state shows action buttons with smooth fade-in
- Drag handles are clearly visible on hover
- Selection shows resize handles at corners (for width adjustment)
- Click outside any block deselects (already exists — verify it works)
- Selected block gets subtle drop shadow
- Toolbar shows context-sensitive options based on selected block type
- Smooth scroll to selected block if it's off-screen
```

### Feature 3: Spreadsheet-Like Table Editing
```
For TableBlock specifically:
- Click a cell to edit it inline (contentEditable)
- Tab key moves to next cell
- Enter key moves to next row
- Click column header to select entire column
- Right-click cell for context menu (add row, add column, delete row, delete column)
- Resize columns by dragging column borders
- Alternating row colors option
- Header row styling option
```

### Feature 4: Keyboard Shortcuts
```
Add these keyboard shortcuts:
- Delete/Backspace: Delete selected block (when not editing text)
- Ctrl+D: Duplicate selected block
- Ctrl+Z: Undo (already exists — verify)
- Ctrl+Y / Ctrl+Shift+Z: Redo (already exists — verify)
- Ctrl+C / Ctrl+V: Copy/paste selected block
- Escape: Deselect block
- Arrow keys: Nudge block margins by 1px
```

### Feature 5: Improved Export HTML
```
Export improvements:
- Embed data-sparklms-block and data-sparklms-props on every element
- Export includes a hidden <script> comment block with full JSON of sections array
  <!-- SPARKLMS_DATA: { "version": "1.0", "sections": [...] } -->
- On import: first check for this comment block and restore directly
- This enables perfect round-trip fidelity
- Also export as clean HTML (without metadata) as a separate option
- Minify vs pretty-print option
```

---

## 📋 PHASE 5 — CODE QUALITY & ARCHITECTURE

### Code Splitting
```
Implement lazy loading for heavy components:
- Lazy load the SignatureBlock (loads signature_pad library)
- Lazy load the export module (loads html2canvas, jsPDF)
- Lazy load the HTML parser module
- Add Suspense boundaries with loading spinners

Example:
const SignatureBlock = lazy(() => import('./blocks/SignatureBlock'));
const ExportModule = lazy(() => import('./export/exportToHTML'));
```

### Remove Unused Code
```
- Remove any unused imports across all files
- Remove console.log statements (replace with proper error handling)
- Remove commented-out code blocks
- Remove any duplicate utility functions
- Remove unused shadcn/ui components that are imported but not used
```

### TypeScript Strictness
```
- Add strict: true to tsconfig.json if not already present
- Fix all TypeScript errors that appear with strict mode
- Replace all any types with proper interfaces
- Add return type annotations to all functions
- Add proper generic types to useState, useRef, useCallback calls
```

### Component Organization
```
Ensure all components follow this pattern:
1. Imports (React, then libraries, then local)
2. TypeScript interfaces/types
3. Component function (named, not arrow function for better stack traces)
4. Helper functions inside component only if they use hooks
5. Pure helper functions outside the component
6. export default at bottom

Add JSDoc comments to all exported functions explaining:
- What the function does
- Parameters
- Return value
- Any side effects
```

---

## 📋 PHASE 6 — TESTING CHECKLIST

After all fixes, manually verify every item in this checklist:

### Core Editor
- [ ] App loads without errors on fresh visit
- [ ] Login with admin/123 works
- [ ] Navigate to form editor
- [ ] Add 1-column section
- [ ] Add 2-column section  
- [ ] Add 3-column section
- [ ] Delete section (with confirmation)
- [ ] All 18 block types can be dragged from library to canvas
- [ ] Blocks can be reordered within a column
- [ ] Blocks can be moved between columns
- [ ] Click block → inspector opens with correct properties
- [ ] Edit text in inspector → canvas updates immediately
- [ ] Edit layout (width, margins) → canvas updates immediately
- [ ] Edit style (colors, borders) → canvas updates immediately
- [ ] Duplicate block → new block appears below
- [ ] Delete block → block removed, selectedBlockId cleared
- [ ] Lock block → block cannot be dragged or deleted
- [ ] Undo (Ctrl+Z) → last action reversed
- [ ] Redo (Ctrl+Y) → action re-applied
- [ ] Preview mode → editing UI hidden, form looks correct
- [ ] Zoom in/out → only canvas scales, sidebars unchanged
- [ ] Click outside blocks → deselects

### HTML Import/Export
- [ ] Export empty form → downloads valid HTML file
- [ ] Export form with all 18 block types → downloads HTML
- [ ] Re-import that exported HTML → all blocks recognized correctly
- [ ] Re-imported blocks are fully editable
- [ ] Import external email template HTML → recognized and editable
- [ ] Import Bootstrap form HTML → recognized and editable
- [ ] Import HTML with tables → table block created and editable
- [ ] Import HTML with buttons → button block created
- [ ] Import HTML with invalid content → error toast shown, no crash
- [ ] Import non-HTML file → error toast shown immediately
- [ ] Import very large HTML file → no freeze, either loads or shows error

### Crash Prevention
- [ ] Delete section that has selected block → no crash
- [ ] Rapid undo/redo clicking → no crash
- [ ] Drag block and press Escape → drag cancels cleanly, no crash
- [ ] Open inspector, switch between block types rapidly → no crash
- [ ] Add maximum blocks (50+) → no performance degradation
- [ ] Open signature block → loads without crash
- [ ] Edit table block → no crash

### New Features
- [ ] Background color picker works on all blocks
- [ ] Text color picker works on text blocks
- [ ] Border settings apply correctly
- [ ] Delete key removes selected block
- [ ] Escape key deselects block
- [ ] Table cells are editable inline

---

## 📎 ADDITIONAL CONTEXT FOR CLAUDE CODE

### External HTML Templates to Test With
When I provide external HTML template files, analyze each one and:
1. Run it through the parser mentally
2. Identify exactly which elements fail to parse and why
3. Fix the parser to handle those cases
4. Verify the fix works for the general case, not just that specific file

### Priority Order
Fix issues in this order:
1. **CRITICAL:** App crashes (anything that throws an unhandled error)
2. **HIGH:** Import/export not working correctly  
3. **HIGH:** State not updating (inspector changes not reflecting on canvas)
4. **MEDIUM:** Missing features (background color, keyboard shortcuts)
5. **LOW:** Code quality, dead code removal, TypeScript strictness

### What NOT to Change
- Do not change the routing structure
- Do not replace the @dnd-kit library
- Do not replace Tailwind CSS
- Do not change the login credentials
- Do not change the overall layout (3-panel: library | canvas | inspector)
- Do not replace shadcn/ui components with custom ones

---

## 🚦 START HERE

1. First, read all files in `src/features/form-editor/`
2. Read the parser files in `src/features/form-editor/parser/`
3. Read the export files in `src/features/form-editor/export/`
4. Read `src/features/form-editor/EditorContext.tsx` and `editorReducer.ts`
5. Read `src/features/form-editor/blocks/` — all block components
6. Produce the Phase 1 audit report as a numbered list with file names and line numbers
7. Then implement fixes phase by phase
8. After all fixes, run through the Phase 6 testing checklist and report results

**Let's begin — please start with the Phase 1 audit.**

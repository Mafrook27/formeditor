# SparkLMS Editor — Claude Code Autonomous Refactor Prompt
# Paste this entire file as your first message to Claude Code.

---

## CONTEXT

You are a senior React architect and product engineer. You are working on SparkLMS,
a fintech internal tool where agents manage and edit HTML email and document templates.

The codebase is approximately 80% complete but has critical bugs, architectural issues,
and missing polish that prevent it from being production-ready. Your job is to
autonomously analyze, refactor, and fix the entire `src/features/form-editor/` module
plus all shared components it uses.

Read `SKILL.md` in the project root before doing anything else. It contains:
- Product context
- All known bugs with root causes
- Architecture rules
- Import/Export requirements
- Inspector behavior specification

---

## YOUR EXECUTION PLAN

Work through these phases in order. Do not skip phases. After each phase, run
`npm run build` to confirm zero TypeScript errors before proceeding.

---

## PHASE 1 — Audit & Inventory (Do Not Change Code Yet)

1. Read every file in `src/features/form-editor/`
2. Read every file in `src/shared/`
3. List all reusable components that exist vs. what SKILL.md says should exist
4. List every block component and check: does it have the standard layout wrapper?
5. List every inspector component and check: does it use the correct reusable inputs?
6. Find all `React.memo` usages — flag any with custom comparators
7. Find all places where `placeholder` is set — check if it reaches the DOM
8. Find all places where `backgroundColor` is read — check if it's guarded
9. Find all places where margin/padding is applied — check if it uses the wrapper pattern
10. Output a full audit report as a comment in `AUDIT_REPORT.md`

---

## PHASE 2 — Shared Reusable Components

Create or fix these in `src/shared/components/`:

### 2.1 NumberInput.tsx
```tsx
// Props: value, onChange, min?, max?, step?, unit?, disabled?
// - Controlled input, only allows numeric characters
// - Arrow Up/Down: +1/-1 (Shift: +10/-10)
// - On blur: clamp to [min, max], default 0 if empty
// - Shows unit label (px, %, em) on right if provided
// - Fully accessible (aria-label)
```

### 2.2 ColorPicker.tsx
```tsx
// Props: value (hex string), onChange, label?
// - Renders color swatch (click opens native color input)
// - Hex text input next to swatch (live validation)
// - Empty string = no color (shows checkerboard pattern)
// - onChange fires with valid hex or empty string
```

### 2.3 PropertyRow.tsx
```tsx
// Props: label, children, hint?
// - Consistent 2-column layout for inspector rows
// - Label on left (fixed width), control on right
// - Optional hint text below
// - Used for EVERY property in the inspector
```

### 2.4 SliderWithInput.tsx
```tsx
// Props: value, onChange, min, max, step?, unit?
// - Radix Slider on left + NumberInput on right
// - Always in sync, both update the same value
```

### 2.5 InspectorSection.tsx
```tsx
// Props: title, children, defaultOpen?
// - Collapsible section with chevron
// - Consistent padding and divider
// - Used to group related properties in inspector
```

### 2.6 ConfirmDialog.tsx (check if exists, create if not)
```tsx
// Props: open, onConfirm, onCancel, title, description, confirmLabel?
// - Uses shadcn AlertDialog
// - Default confirmLabel = "Delete"
// - Confirm button is destructive (red)
```

---

## PHASE 3 — Fix Base Block Architecture

### 3.1 Update editorConfig.ts
Add missing fields to `BASE_DEFAULTS`:
```ts
backgroundColor: '',
borderColor: '#e5e7eb',
borderWidth: 0,
borderStyle: 'solid' as const,
borderRadius: 0,
```

Create a `getLayoutStyle(block: BaseBlock): React.CSSProperties` utility:
```ts
export function getLayoutStyle(block: BaseBlock): React.CSSProperties {
  return {
    width: `${block.width}%`,
    marginTop: block.marginTop ?? 0,
    marginBottom: block.marginBottom ?? 0,
    marginLeft: block.marginLeft ?? 0,
    marginRight: block.marginRight ?? 0,
    paddingTop: block.paddingY ?? 0,
    paddingBottom: block.paddingY ?? 0,
    paddingLeft: block.paddingX ?? 0,
    paddingRight: block.paddingX ?? 0,
    backgroundColor: block.backgroundColor || undefined,
    border: block.borderWidth
      ? `${block.borderWidth}px ${block.borderStyle ?? 'solid'} ${block.borderColor ?? '#e5e7eb'}`
      : undefined,
    borderRadius: block.borderRadius ? `${block.borderRadius}px` : undefined,
    boxSizing: 'border-box',
  };
}
```

### 3.2 Fix ALL 18 Block Components

For every block in `src/features/form-editor/blocks/`:

**Pattern to enforce:**
```tsx
export const HeadingBlock = memo(function HeadingBlock({ block }: { block: HeadingBlock }) {
  const layoutStyle = getLayoutStyle(block);

  return (
    <div style={layoutStyle}>
      {/* Only block-specific content here, NO layout styles on inner elements */}
      <Tag style={{ color: block.color, fontSize: block.fontSize, ... }}>
        {block.text}
      </Tag>
    </div>
  );
});
// NO custom memo comparator - default shallow comparison only
```

**Specific fixes per block:**

`TextInputBlock`:
- Fix: `<input type={block.inputType ?? 'text'} placeholder={block.placeholder ?? ''} />`
- Add: `name`, `required`, `id` attributes
- Label must be `<label htmlFor={block.id}>`

`TextareaBlock`:
- Fix: `<textarea placeholder={block.placeholder ?? ''} rows={block.rows ?? 4} />`
- Add: resize handle CSS

`DropdownBlock`:
- Fix: options must render from `block.options` array (not hardcoded)
- Fix: `placeholder` as first `<option value="">` 

`DatePickerBlock`:
- Fix: `<input type="date" placeholder={block.placeholder ?? ''} />`

`RadioGroupBlock`:
- Fix: group all options under same `name={block.name || block.id}`
- Fix: `layout` prop controls `flex-direction`

`CheckboxGroupBlock`:
- Same name grouping fix

`TableBlock` — Full rewrite:
```tsx
// Inline editable cells using contentEditable
// Right-click context menu for add/remove rows/columns
// Inspector: rows, columns, headers toggle, striped, bordered, cell padding
```

`SignatureBlock`:
- Only render signature_pad in edit mode
- In preview/export: render as bordered div with label

`RawHTMLBlock`:
- Render with DOMPurify sanitized dangerouslySetInnerHTML
- In edit mode: show CodeMirror or textarea for raw editing

`ImageBlock`:
- Fix: if `src` is empty, show upload placeholder
- Add: click to upload / paste URL input

---

## PHASE 4 — Fix Inspector Panel

### 4.1 Layout Tab
Replace all raw `<input type="number">` with `<SliderWithInput>` or `<NumberInput>`.
Every property must use `<PropertyRow>` wrapper.

```tsx
// Width
<PropertyRow label="Width">
  <SliderWithInput value={block.width} onChange={v => update({ width: v })} min={25} max={100} unit="%" />
</PropertyRow>

// Margins (4 fields in 2x2 grid)
<PropertyRow label="Margin">
  <div className="grid grid-cols-2 gap-2">
    <NumberInput value={block.marginTop} onChange={v => update({ marginTop: v })} min={0} max={200} unit="px" />
    <NumberInput value={block.marginRight} onChange={v => update({ marginRight: v })} min={0} max={200} unit="px" />
    <NumberInput value={block.marginBottom} onChange={v => update({ marginBottom: v })} min={0} max={200} unit="px" />
    <NumberInput value={block.marginLeft} onChange={v => update({ marginLeft: v })} min={0} max={200} unit="px" />
  </div>
</PropertyRow>
```

### 4.2 Style Tab
```tsx
<PropertyRow label="Background">
  <ColorPicker value={block.backgroundColor ?? ''} onChange={v => update({ backgroundColor: v })} />
</PropertyRow>

<PropertyRow label="Border Color">
  <ColorPicker value={block.borderColor ?? ''} onChange={v => update({ borderColor: v })} />
</PropertyRow>

<PropertyRow label="Border Width">
  <SliderWithInput value={block.borderWidth ?? 0} onChange={v => update({ borderWidth: v })} min={0} max={20} unit="px" />
</PropertyRow>

<PropertyRow label="Border Radius">
  <SliderWithInput value={block.borderRadius ?? 0} onChange={v => update({ borderRadius: v })} min={0} max={50} unit="px" />
</PropertyRow>
```

### 4.3 General Tab
Each block type must have its own focused inspector component in
`src/features/form-editor/inspector/blocks/`. Use the reusable components throughout.

---

## PHASE 5 — HTML Import (Complete Rewrite)

Rewrite `src/features/form-editor/import/htmlParser.ts`:

```ts
export function parseHTMLToSections(html: string): { sections: EditorSection[]; warnings: string[] } {
  const warnings: string[] = [];

  // Step 1: Check for SparkLMS native metadata
  const metaMatch = html.match(/<!--\s*spark-metadata:\s*({[\s\S]*?})\s*-->/);
  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      if (meta.version && meta.sections) {
        return { sections: meta.sections, warnings: [] };
      }
    } catch {
      warnings.push('Found spark-metadata but failed to parse it. Falling back to DOM parsing.');
    }
  }

  // Step 2: Sanitize
  const clean = DOMPurify.sanitize(html, {
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['style', 'class', 'id', 'name', 'for', 'type', 'placeholder',
               'required', 'rows', 'cols', 'href', 'target', 'src', 'alt'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  // Step 3: Parse DOM
  const doc = new DOMParser().parseFromString(clean, 'text/html');
  const body = doc.body;

  // Step 4: Detect layout type
  const hasSections = body.querySelectorAll('.section').length > 0;
  const hasTableLayout = body.querySelector('table') !== null;

  if (hasSections) {
    // SparkLMS-structured without metadata → parse sections directly
    return parseSectionLayout(body, warnings);
  } else if (hasTableLayout) {
    // Table-based email HTML (Mailchimp, Outlook, etc.)
    return parseTableLayout(body, warnings);
  } else {
    // Generic HTML → convert each top-level child to a block in one section
    return parseGenericLayout(body, warnings);
  }
}

// For each element, extract block OR return null → caller wraps as RawHTMLBlock
function elementToBlock(el: Element, warnings: string[]): EditorBlock | null {
  const tag = el.tagName.toLowerCase();
  const styles = extractInlineStyles(el);

  switch (tag) {
    case 'h1': return createBlockFromElement('heading', el, { level: 'h1', text: el.textContent ?? '', ...styles });
    case 'h2': return createBlockFromElement('heading', el, { level: 'h2', text: el.textContent ?? '', ...styles });
    case 'h3': return createBlockFromElement('heading', el, { level: 'h3', text: el.textContent ?? '', ...styles });
    case 'h4': return createBlockFromElement('heading', el, { level: 'h4', text: el.textContent ?? '', ...styles });
    case 'p':  return createBlockFromElement('paragraph', el, { text: el.innerHTML ?? '', ...styles });
    case 'a':  return createBlockFromElement('hyperlink', el, { text: el.textContent ?? '', href: el.getAttribute('href') ?? '#', ...styles });
    case 'hr': return createBlockFromElement('divider', el, { ...styles });
    case 'img': return createBlockFromElement('image', el, { src: el.getAttribute('src') ?? '', alt: el.getAttribute('alt') ?? '', ...styles });
    case 'ul': return createBlockFromElement('list', el, { listType: 'unordered', items: Array.from(el.querySelectorAll('li')).map(li => li.textContent ?? ''), ...styles });
    case 'ol': return createBlockFromElement('list', el, { listType: 'ordered', items: Array.from(el.querySelectorAll('li')).map(li => li.textContent ?? ''), ...styles });
    case 'table': return parseTableElement(el as HTMLTableElement, styles);
    case 'button': return createBlockFromElement('button', el, { label: el.textContent ?? 'Button', ...styles });
    case 'input': return parseInputElement(el as HTMLInputElement, styles);
    case 'textarea': return createBlockFromElement('textarea', el, {
        label: findLabel(el) ?? 'Label',
        placeholder: el.getAttribute('placeholder') ?? '',
        rows: parseInt(el.getAttribute('rows') ?? '4'),
        name: el.getAttribute('name') ?? '',
        ...styles,
      });
    case 'select': return parseSelectElement(el as HTMLSelectElement, styles);
    default:
      // Unknown element → RawHTMLBlock (never discard)
      warnings.push(`Unknown element <${tag}> wrapped as Raw HTML block.`);
      return createBlockFromElement('raw-html', el, { html: el.outerHTML });
  }
}
```

---

## PHASE 6 — HTML Export (Upgrade)

Rewrite `src/features/form-editor/export/htmlExporter.ts`:

### 6.1 Export Modes
```ts
type ExportMode = 'email' | 'document';

export function exportToHTML(sections: EditorSection[], mode: ExportMode = 'email'): string {
  const body = sections.map(s => sectionToHTML(s, mode)).join('\n');
  const metadata = JSON.stringify({ version: '1.0', sections });

  if (mode === 'email') {
    return buildEmailHTML(body, metadata);
  } else {
    return buildDocumentHTML(body, metadata);
  }
}
```

### 6.2 Email HTML (Table-Based, Inline CSS)
```ts
function buildEmailHTML(body: string, metadata: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Email Template</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:8px;">
        <tr><td style="padding:32px;">
          ${body}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
<!-- spark-metadata: ${metadata} -->
</html>`;
}
```

### 6.3 Document HTML (CSS Classes, Print-Friendly)
```ts
function buildDocumentHTML(body: string, metadata: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; max-width: 860px; margin: 0 auto; padding: 40px 32px; }
    .spark-section { display: flex; gap: 16px; margin-bottom: 16px; }
    .spark-column { flex: 1; min-width: 0; }
    input, textarea, select { font-family: inherit; font-size: 14px; }
    @media print {
      body { padding: 0; }
      .spark-section { page-break-inside: avoid; }
    }
    @media (max-width: 600px) {
      .spark-section { flex-direction: column; }
    }
  </style>
</head>
<body>
  ${body}
</body>
<!-- spark-metadata: ${metadata} -->
</html>`;
}
```

### 6.4 Block Export — Fix Layout Styles Applied Inline
Every block export must include ALL layout properties inline:
```ts
function getInlineLayoutCSS(block: BaseBlock): string {
  const parts: string[] = [];
  if (block.marginTop) parts.push(`margin-top:${block.marginTop}px`);
  if (block.marginBottom) parts.push(`margin-bottom:${block.marginBottom}px`);
  if (block.marginLeft) parts.push(`margin-left:${block.marginLeft}px`);
  if (block.marginRight) parts.push(`margin-right:${block.marginRight}px`);
  if (block.paddingY) { parts.push(`padding-top:${block.paddingY}px`); parts.push(`padding-bottom:${block.paddingY}px`); }
  if (block.paddingX) { parts.push(`padding-left:${block.paddingX}px`); parts.push(`padding-right:${block.paddingX}px`); }
  if (block.backgroundColor) parts.push(`background-color:${block.backgroundColor}`);
  if (block.borderWidth) parts.push(`border:${block.borderWidth}px ${block.borderStyle ?? 'solid'} ${block.borderColor ?? '#e5e7eb'}`);
  if (block.borderRadius) parts.push(`border-radius:${block.borderRadius}px`);
  parts.push(`width:${block.width ?? 100}%`);
  return parts.join(';');
}
```

---

## PHASE 7 — Canvas UX Improvements

### 7.1 Block Selection Polish
- Selected block: `outline: 2px solid #3B82F6; outline-offset: 2px;` (not border — doesn't affect layout)
- Hover state: `outline: 1px dashed #93C5FD; outline-offset: 2px;`
- Locked block: gray overlay + lock icon badge

### 7.2 Empty State
When no sections exist, show a professional empty state:
```tsx
<div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
  <Layout size={40} strokeWidth={1} />
  <div className="text-center">
    <p className="font-medium text-slate-600">Start building your template</p>
    <p className="text-sm">Add a section below or import an existing HTML template</p>
  </div>
  <div className="flex gap-2">
    <Button onClick={() => addSection(1)} variant="outline">+ 1 Column</Button>
    <Button onClick={() => addSection(2)} variant="outline">+ 2 Columns</Button>
    <Button onClick={() => addSection(3)} variant="outline">+ 3 Columns</Button>
  </div>
</div>
```

### 7.3 Section Controls
- Add section buttons: appear between sections on hover (not just at bottom)
- Each section has a subtle "drag to reorder" handle on the left edge
- Section column count shown as badge on section hover (e.g., "2 col")

### 7.4 Drag & Drop
- Activation constraint: `distance: 8, delay: 100` — prevents accidental drags
- DragOverlay: shows ghost of block being dragged (50% opacity)
- Drop zone: highlights entire column when dragging over it
- Invalid drop: red highlight + cursor: not-allowed

---

## PHASE 8 — Code Splitting & Performance

### 8.1 Router — Lazy Load All Pages
```tsx
// src/app/router.tsx
import { lazy, Suspense } from 'react';

const LoginPage      = lazy(() => import('../features/auth/pages/LoginPage'));
const DashboardPage  = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const FormEditorPage = lazy(() => import('../features/form-editor/pages/FormEditorPage'));

// Wrap each route element:
<Suspense fallback={<PageLoader />}>
  <FormEditorPage />
</Suspense>
```

### 8.2 Heavy Libraries — Dynamic Import
```ts
// Signature pad — only loaded when SignatureBlock mounts
const SignaturePad = lazy(() => import('signature_pad'));

// DOMPurify — only loaded by parser
// Import at top of htmlParser.ts (it's small, ok to static import)
```

### 8.3 Vite Config — Bundle Splitting
```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/modifiers'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-slider'],
        'editor': ['src/features/form-editor/EditorContext.tsx'],
      }
    }
  }
}
```

---

## PHASE 9 — Final Cleanup & Quality Gates

### 9.1 TypeScript
- Zero `any` types (use `unknown` + type guards)
- All exported functions have explicit return types
- All props interfaces are exported from their component file

### 9.2 Error Boundaries
Add `<EditorErrorBoundary>` around the canvas:
```tsx
class EditorErrorBoundary extends React.Component<...> {
  // On error: show "Editor crashed — reload or import from backup" + Copy State button
}
```

### 9.3 Console Cleanup
- Remove all `console.log` statements
- Replace with: `console.warn` for import warnings, `console.error` for actual errors

### 9.4 Run Final Checks
```bash
npm run build          # Zero TypeScript errors
npm run lint           # Zero ESLint errors
# Manually verify testing checklist from SKILL.md
```

---

## WHAT NOT TO CHANGE

- Auth logic (login page, token storage)
- Dashboard page content
- Route structure
- shadcn/ui component source files (regenerate with CLI if needed)
- `package.json` scripts
- Any file outside `src/` unless it's `vite.config.ts`

---

## OUTPUT AFTER COMPLETION

Create `REFACTOR_COMPLETE.md` listing:
1. Every file changed and why
2. Every bug fixed with the fix applied
3. Every new component created
4. Any issues found that were NOT in SKILL.md
5. Any TODOs left for future iterations

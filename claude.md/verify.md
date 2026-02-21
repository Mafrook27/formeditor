# PARALLEL AGENT — External HTML Import Fix
# Open a NEW Claude Code terminal. Paste this entire file. Run autonomously.
# DO NOT touch any file except those listed in "Files to Modify" section.

---

## WHAT YOU ARE FIXING

SparkLMS block editor cannot properly import external HTML files
(templates not built inside this app). The problems are:

- Tables from external HTML not recognized as TableBlock
- Images inside `<td>` cells are dropped entirely
- Nested content inside table cells is ignored
- Inline styles (colors, fonts, padding, margin) are lost
- Some imports produce blank canvas
- Some imports produce one single uneditable RawHTMLBlock instead of proper blocks
- Even when partially imported, blocks are not editable

The goal: ANY HTML file — no matter who built it, how messy it is —
must import into the editor as editable blocks that look like the original.

---

## STEP 1 — READ EVERYTHING FIRST

Before writing any code, read these files in order:

```
1. public/external_editor/          ← ALL sample HTML files
2. src/features/form-editor/import/htmlParser.ts    ← current parser
3. src/features/form-editor/editorConfig.ts         ← block types & defaults
4. src/features/form-editor/blocks/BlockRenderer.tsx ← how blocks render
```

For each file in `public/external_editor/`, write a short diagnosis:
- What HTML structure is it using? (table-based, div-based, mixed)
- What is the current parser doing wrong with it?
- What specific elements are being missed?

---

## STEP 2 — UNDERSTAND THE TWO TYPES OF TABLES

This is the #1 source of failures. You must distinguish them:

### Type A: LAYOUT TABLE (email wrapper — do NOT convert to TableBlock)
```html
<!-- Signs: width=600, cellpadding, cellspacing, role=presentation, or bgcolor -->
<table width="600" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td>  ← this td contains actual CONTENT blocks
      <h1>Hello</h1>
      <p>Paragraph here</p>
      <img src="banner.jpg" />
    </td>
  </tr>
</table>
```
**Action:** Look INSIDE the `<td>` cells. Parse their children as blocks.
The table itself is just a wrapper — ignore it as structure.

### Type B: DATA TABLE (actual data — convert to TableBlock)
```html
<!-- Signs: has <th> headers, or multiple rows of data -->
<table>
  <thead><tr><th>Name</th><th>Amount</th></tr></thead>
  <tbody>
    <tr><td>John</td><td>50000</td></tr>
  </tbody>
</table>
```
**Action:** Convert to TableBlock with headers[] and rows[][].

### Detection logic:
```typescript
function isLayoutTable(table: HTMLTableElement): boolean {
  return (
    table.getAttribute('role') === 'presentation' ||
    table.getAttribute('cellpadding') !== null ||
    parseInt(table.getAttribute('width') ?? '0') >= 400 ||
    !!table.getAttribute('bgcolor') ||
    !table.querySelector('th') // no headers = likely layout
  );
}
```

---

## STEP 3 — HANDLE IMAGES INSIDE TABLE CELLS

Images are currently dropped when inside `<td>`. Fix this:

```typescript
// When parsing content of a <td> or any container:
function parseContainerChildren(el: Element, warnings: string[]): EditorBlock[] {
  const blocks: EditorBlock[] = [];

  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push(makeParagraph(text));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const child = node as HTMLElement;
    const tag = child.tagName?.toLowerCase();

    // IMAGE — never skip this
    if (tag === 'img') {
      blocks.push({
        ...BASE_DEFAULTS,
        id: uuid(),
        type: 'image',
        src: child.getAttribute('src') ?? '',
        alt: child.getAttribute('alt') ?? '',
        align: 'center',
        maxWidth: 100,
        ...extractInlineStyles(child),
      } as ImageBlock);
      return;
    }

    // Everything else
    const block = elementToBlock(child, warnings);
    if (block) blocks.push(block);
  });

  return blocks;
}
```

---

## STEP 4 — MULTI-COLUMN DETECTION FROM TABLES

When a `<tr>` has 2 or 3 `<td>` cells, that is a multi-column section:

```typescript
function tableRowToSection(row: HTMLTableRowElement, warnings: string[]): EditorSection | null {
  const cells = Array.from(row.querySelectorAll(':scope > td, :scope > th'));

  // Skip spacer rows
  if (cells.length === 0) return null;
  if (cells.every(c => !c.textContent?.trim() && !c.querySelector('img'))) return null;

  const numCols = Math.min(3, cells.length) as 1 | 2 | 3;
  const blocks: EditorBlock[][] = Array.from({ length: numCols }, () => []);

  cells.slice(0, 3).forEach((cell, ci) => {
    const cellBlocks = parseContainerChildren(cell as HTMLElement, warnings);
    blocks[ci].push(...cellBlocks);
  });

  // Only return section if it has content
  if (blocks.every(col => col.length === 0)) return null;

  return { id: uuid(), columns: numCols, blocks };
}
```

---

## STEP 5 — INLINE STYLE EXTRACTION (apply to every element)

```typescript
function extractInlineStyles(el: HTMLElement): Partial<BaseBlock> {
  const s = el.style;
  const attrs = el.attributes;
  const result: Partial<BaseBlock> = {};

  // Modern inline styles
  if (s.color) (result as any).color = s.color;
  if (s.fontSize) (result as any).fontSize = parseInt(s.fontSize) || undefined;
  if (s.fontWeight) (result as any).fontWeight = s.fontWeight;
  if (s.textAlign) (result as any).textAlign = s.textAlign;
  if (s.backgroundColor) result.backgroundColor = s.backgroundColor;
  if (s.borderColor) result.borderColor = s.borderColor;
  if (s.borderWidth) result.borderWidth = parseInt(s.borderWidth) || 0;
  if (s.borderRadius) result.borderRadius = parseInt(s.borderRadius) || 0;
  if (s.marginTop) result.marginTop = parseInt(s.marginTop) || 0;
  if (s.marginBottom) result.marginBottom = parseInt(s.marginBottom) || 0;
  if (s.marginLeft) result.marginLeft = parseInt(s.marginLeft) || 0;
  if (s.marginRight) result.marginRight = parseInt(s.marginRight) || 0;
  if (s.paddingTop) result.paddingY = parseInt(s.paddingTop) || 0;
  if (s.paddingLeft) result.paddingX = parseInt(s.paddingLeft) || 0;

  // Legacy HTML attributes (email HTML uses these)
  const bgColor = el.getAttribute('bgcolor');
  if (bgColor && !result.backgroundColor) result.backgroundColor = bgColor;

  const align = el.getAttribute('align');
  if (align) (result as any).textAlign = align;

  const width = el.getAttribute('width') || s.width;
  if (width) {
    const w = parseInt(width);
    if (!isNaN(w) && w > 0 && w <= 100) result.width = w;
  }

  // Inline padding from cellpadding attribute (table cells)
  const cellpadding = el.getAttribute('cellpadding');
  if (cellpadding) {
    const p = parseInt(cellpadding);
    if (!isNaN(p)) { result.paddingX = p; result.paddingY = p; }
  }

  return result;
}
```

---

## STEP 6 — FULL PARSER FLOW

Replace the current parser logic with this flow:

```typescript
export function parseHTMLToSections(rawHTML: string): ParseResult {
  const warnings: string[] = [];

  // 1. Check for SparkLMS native metadata — perfect round-trip
  const metaMatch = rawHTML.match(/<!--\s*spark-metadata:\s*({[\s\S]*?})\s*-->/);
  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      if (meta.version && Array.isArray(meta.sections)) {
        return { sections: meta.sections, warnings: [] };
      }
    } catch {
      warnings.push('spark-metadata found but could not be parsed. Falling back to DOM parsing.');
    }
  }

  // 2. Sanitize — strip scripts, keep styles and structure
  const clean = DOMPurify.sanitize(rawHTML, {
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['style','bgcolor','align','width','height','cellpadding',
               'cellspacing','border','colspan','rowspan','src','alt',
               'href','target','placeholder','name','type','required','rows'],
    FORBID_TAGS: ['script','iframe','object','embed'],
    FORBID_ATTR: ['onerror','onload','onclick','onmouseover'],
  });

  const doc = new DOMParser().parseFromString(clean, 'text/html');
  const body = doc.body;

  // 3. Route to correct parser based on structure
  const hasSectionDivs = body.querySelectorAll('.section, [data-spark-section]').length > 0;
  const hasLayoutTables = Array.from(body.querySelectorAll('table'))
    .some(t => isLayoutTable(t as HTMLTableElement));

  if (hasSectionDivs) {
    // SparkLMS structure without metadata
    return { sections: parseSectionDivs(body, warnings), warnings };
  } else if (hasLayoutTables) {
    // External email HTML (Mailchimp, Klaviyo, custom builders)
    return { sections: parseLayoutTables(body, warnings), warnings };
  } else {
    // Generic HTML — flat structure
    return { sections: parseGenericHTML(body, warnings), warnings };
  }
}

function parseLayoutTables(body: Element, warnings: string[]): EditorSection[] {
  const sections: EditorSection[] = [];

  // Get all rows across all layout tables
  body.querySelectorAll('table').forEach(table => {
    if (!isLayoutTable(table as HTMLTableElement)) return;

    table.querySelectorAll('tr').forEach(row => {
      const section = tableRowToSection(row as HTMLTableRowElement, warnings);
      if (section) sections.push(section);
    });
  });

  return sections.length > 0 ? sections : parseGenericHTML(body, warnings);
}

function parseGenericHTML(body: Element, warnings: string[]): EditorSection[] {
  const blocks: EditorBlock[] = [];

  Array.from(body.children).forEach(child => {
    // Skip empty wrappers — look inside
    const tag = child.tagName?.toLowerCase();
    if ((tag === 'div' || tag === 'center' || tag === 'section') && child.children.length > 0) {
      Array.from(child.children).forEach(inner => {
        const block = elementToBlock(inner as HTMLElement, warnings);
        if (block) blocks.push(block);
      });
      return;
    }

    const block = elementToBlock(child as HTMLElement, warnings);
    if (block) blocks.push(block);
  });

  if (blocks.length === 0) {
    warnings.push('No recognizable blocks found. Wrapping entire content as Raw HTML.');
    return [{
      id: uuid(), columns: 1,
      blocks: [[{ ...BASE_DEFAULTS, id: uuid(), type: 'raw-html', html: body.innerHTML }]],
    }];
  }

  // Group into sections of 4 blocks each
  const sections: EditorSection[] = [];
  for (let i = 0; i < blocks.length; i += 4) {
    sections.push({ id: uuid(), columns: 1, blocks: [blocks.slice(i, i + 4)] });
  }
  return sections;
}
```

---

## STEP 7 — ELEMENT MAPPING (complete, no gaps)

```typescript
function elementToBlock(el: HTMLElement, warnings: string[]): EditorBlock | null {
  const tag = el.tagName?.toLowerCase();
  if (!tag || ['script','style','head','meta','link','title'].includes(tag)) return null;

  const styles = extractInlineStyles(el);

  switch (tag) {
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'heading',
        text: el.textContent ?? '', level: (['h1','h2','h3','h4'].includes(tag) ? tag : 'h4') as any,
        color: el.style.color || '#111827',
        fontSize: parseInt(el.style.fontSize) || { h1:32,h2:24,h3:20,h4:18,h5:16,h6:14 }[tag] || 24,
        fontWeight: el.style.fontWeight || '700', textAlign: (el.style.textAlign as any) || 'left' };

    case 'p':
      if (!el.textContent?.trim() && !el.querySelector('img')) return null;
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'paragraph',
        text: el.innerHTML, color: el.style.color || '#374151',
        fontSize: parseInt(el.style.fontSize) || 16,
        lineHeight: parseFloat(el.style.lineHeight) || 1.6,
        textAlign: (el.style.textAlign as any) || 'left' };

    case 'img':
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'image',
        src: el.getAttribute('src') ?? '',
        alt: el.getAttribute('alt') ?? '',
        align: (el.getAttribute('align') as any) || 'center', maxWidth: 100 };

    case 'a':
      if (!el.textContent?.trim()) return null;
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'hyperlink',
        text: el.textContent ?? 'Link', href: el.getAttribute('href') ?? '#',
        color: el.style.color || '#2563EB', openInNewTab: el.getAttribute('target') === '_blank' };

    case 'hr':
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'divider',
        color: el.style.borderColor || '#E5E7EB', thickness: 1, style: 'solid' };

    case 'ul': case 'ol':
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'list',
        listType: tag === 'ol' ? 'ordered' : 'unordered',
        items: Array.from(el.querySelectorAll('li')).map(li => li.textContent?.trim() ?? ''),
        color: el.style.color || '#374151', fontSize: 16 };

    case 'table':
      if (isLayoutTable(el as HTMLTableElement)) {
        // Look inside — parse children of first td
        const firstTd = el.querySelector('td');
        if (firstTd) {
          const inner = parseContainerChildren(firstTd as HTMLElement, warnings);
          if (inner.length > 0) return inner.length === 1 ? inner[0] : null;
        }
        warnings.push('Layout table with complex content wrapped as Raw HTML.');
        return { ...BASE_DEFAULTS, id: uuid(), type: 'raw-html', html: el.outerHTML };
      }
      return parseTableElement(el as HTMLTableElement, styles);

    case 'button':
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'button',
        label: el.textContent?.trim() ?? 'Button',
        variant: 'primary', size: 'md', fullWidth: false, align: 'left' };

    case 'input':
      return parseInputEl(el as HTMLInputElement, styles);

    case 'textarea':
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'textarea',
        label: findLabel(el) ?? 'Label', placeholder: el.getAttribute('placeholder') ?? '',
        required: el.hasAttribute('required'), helperText: '',
        rows: parseInt(el.getAttribute('rows') ?? '4'), name: el.getAttribute('name') ?? '' };

    case 'select':
      return { ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'dropdown',
        label: findLabel(el) ?? 'Label',
        options: Array.from(el.querySelectorAll('option')).filter(o => o.value).map(o => o.textContent?.trim() ?? ''),
        placeholder: el.querySelector('option[value=""]')?.textContent?.trim() ?? 'Select...',
        required: el.hasAttribute('required'), name: el.getAttribute('name') ?? '' };

    case 'div': case 'section': case 'center': case 'span': case 'td': {
      // Unwrap single-child containers
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0 && el.textContent?.trim()) {
        return makeParagraph(el.innerHTML, extractInlineStyles(el));
      }
      if (children.length === 1) {
        const inner = elementToBlock(children[0], warnings);
        if (inner) return inner;
      }
      // Multiple children or unrecognized — try parsing children
      const innerBlocks = parseContainerChildren(el, warnings);
      if (innerBlocks.length === 1) return innerBlocks[0];
      if (innerBlocks.length > 1) {
        warnings.push(`<${tag}> with ${innerBlocks.length} children wrapped as Raw HTML.`);
      }
      if (el.textContent?.trim() || el.querySelector('img')) {
        return { ...BASE_DEFAULTS, id: uuid(), type: 'raw-html', html: el.outerHTML };
      }
      return null;
    }

    default:
      if (el.textContent?.trim() || el.querySelector('img')) {
        warnings.push(`Unknown <${tag}> preserved as Raw HTML.`);
        return { ...BASE_DEFAULTS, id: uuid(), type: 'raw-html', html: el.outerHTML };
      }
      return null;
  }
}
```

---

## STEP 8 — LABEL DETECTION FOR FORM FIELDS

```typescript
function findLabel(el: HTMLElement): string | null {
  const id = el.getAttribute('id');

  // 1. <label for="id">
  if (id) {
    const label = el.ownerDocument?.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent?.trim() ?? null;
  }

  // 2. Parent is <label>
  if (el.parentElement?.tagName.toLowerCase() === 'label') {
    return el.parentElement.textContent?.replace(el.textContent ?? '', '').trim() ?? null;
  }

  // 3. Previous sibling is <label>
  const prev = el.previousElementSibling;
  if (prev?.tagName.toLowerCase() === 'label') {
    return prev.textContent?.trim() ?? null;
  }

  // 4. placeholder as fallback
  const placeholder = el.getAttribute('placeholder');
  if (placeholder) return placeholder;

  // 5. name attribute formatted
  const name = el.getAttribute('name');
  if (name) return name.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return null;
}
```

---

## STEP 9 — VALIDATION TESTS

After fixing the parser, test manually in the browser for every file in `public/external_editor/`:

```
TEST 1 — No crash:
  Import file → editor loads → no blank screen → no console errors

TEST 2 — Content visible:
  All text, images, buttons from original HTML are visible as blocks

TEST 3 — Nothing is a single RawHTMLBlock:
  If the entire import is one RawHTMLBlock = parser failed, fix it

TEST 4 — Images recognized:
  Any <img> in original → shows as ImageBlock with src preserved

TEST 5 — Tables recognized:
  Data tables → TableBlock with correct headers and rows
  Layout tables → contents extracted as blocks

TEST 6 — Editable:
  Click any block → inspector opens with correct properties
  Change a property → canvas updates immediately

TEST 7 — Round-trip:
  Import external file → Export → Re-import → same blocks appear
```

All 7 tests must pass for EVERY file in `public/external_editor/`.

---

## FILES TO MODIFY

```
src/features/form-editor/import/htmlParser.ts    ← MAIN FILE to fix
```

Do NOT touch anything else.

---

## DONE WHEN

- Zero crashes on any HTML file
- All files in public/external_editor/ produce proper editable blocks
- No entire-page RawHTMLBlock results
- Images from tables are recognized as ImageBlock
- Console shows warnings only (not errors) for unknown elements
- Round-trip works: SparkLMS export → re-import → identical
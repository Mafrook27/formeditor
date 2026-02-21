// src/features/form-editor/import/htmlParser.ts
// Complete rewrite — handles SparkLMS native, table-email, div, and generic HTML.
// NEVER discards content — unknown elements become RawHTMLBlock.

import DOMPurify from 'dompurify';
import { v4 as uuid } from 'uuid';
import type { EditorBlock, EditorSection, BaseBlock } from '../editorConfig';
import { BASE_DEFAULTS } from '../editorConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParseResult {
  sections: EditorSection[];
  warnings: string[];
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export function parseHTMLToSections(rawHTML: string): ParseResult {
  const warnings: string[] = [];

  // ── Step 1: Try native metadata (perfect round-trip) ──────────────────────
  const metaMatch = rawHTML.match(/<!--\s*spark-metadata:\s*({[\s\S]*?})\s*-->/);
  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      if (meta.version && Array.isArray(meta.sections)) {
        return { sections: meta.sections, warnings: [] };
      }
    } catch {
      warnings.push('spark-metadata found but invalid JSON — falling back to DOM parsing.');
    }
  }

  // ── Step 2: Sanitize (keep style attrs, block scripts) ───────────────────
  const clean = DOMPurify.sanitize(rawHTML, {
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: [
      'style', 'class', 'id', 'name', 'for', 'type', 'placeholder',
      'required', 'rows', 'cols', 'href', 'target', 'src', 'alt',
      'width', 'height', 'colspan', 'rowspan', 'cellpadding', 'cellspacing',
      'border', 'bgcolor', 'align', 'valign',
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus'],
  });

  const doc = new DOMParser().parseFromString(clean, 'text/html');
  const body = doc.body;

  // ── Step 3: Detect layout type and parse ─────────────────────────────────
  const hasSectionDivs = body.querySelectorAll('[data-spark-section], .section').length > 0;
  const topLevelTables = Array.from(body.children).filter(el => el.tagName === 'TABLE');
  const isTableEmailLayout = topLevelTables.length > 0 && isEmailTableLayout(body);

  if (hasSectionDivs) {
    return parseSectionLayout(body, warnings);
  } else if (isTableEmailLayout) {
    return parseTableEmailLayout(body, warnings);
  } else {
    return parseGenericLayout(body, warnings);
  }
}

// ─── Layout Parsers ───────────────────────────────────────────────────────────

function parseSectionLayout(body: Element, warnings: string[]): ParseResult {
  const sectionEls = body.querySelectorAll('[data-spark-section], .section');
  const sections: EditorSection[] = [];

  sectionEls.forEach(sectionEl => {
    const columnEls = sectionEl.querySelectorAll('[data-spark-column], .column');
    const numCols = Math.min(3, Math.max(1, columnEls.length)) as 1 | 2 | 3;
    const blocks: EditorBlock[][] = Array.from({ length: numCols }, () => []);

    columnEls.forEach((colEl, ci) => {
      if (ci >= 3) return;
      Array.from(colEl.children).forEach(child => {
        const block = elementToBlock(child as HTMLElement, warnings);
        if (block) blocks[ci].push(block);
      });
    });

    sections.push({ id: uuid(), columns: numCols, blocks });
  });

  return { sections, warnings };
}

function parseTableEmailLayout(body: Element, warnings: string[]): ParseResult {
  // Table-based emails (Mailchimp, Klaviyo, Outlook-compatible)
  // Find inner content tables and map rows to sections
  const sections: EditorSection[] = [];

  // Get all "content" rows — skip wrapper/spacer rows
  const rows = body.querySelectorAll('tr');

  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td, th'));
    if (cells.length === 0) return;

    // Skip pure-spacer rows (empty or only &nbsp;)
    const text = cells.map(c => c.textContent?.trim()).join('');
    if (!text) return;

    const numCols = Math.min(3, cells.length) as 1 | 2 | 3;
    const blocks: EditorBlock[][] = Array.from({ length: numCols }, () => []);

    cells.slice(0, 3).forEach((cell, ci) => {
      const children = Array.from(cell.children);
      if (children.length === 0 && cell.textContent?.trim()) {
        // Text-only cell → paragraph
        blocks[ci].push(makeParagraph(cell.innerHTML.trim()));
      } else {
        children.forEach(child => {
          const block = elementToBlock(child as HTMLElement, warnings);
          if (block) blocks[ci].push(block);
        });
      }
    });

    // Only add section if it has any blocks
    const hasBlocks = blocks.some(col => col.length > 0);
    if (hasBlocks) {
      sections.push({ id: uuid(), columns: numCols, blocks });
    }
  });

  return { sections, warnings };
}

function parseGenericLayout(body: Element, warnings: string[]): ParseResult {
  // Any HTML — each top-level element becomes a block in a 1-column section
  const blocks: EditorBlock[] = [];

  Array.from(body.children).forEach(child => {
    const block = elementToBlock(child as HTMLElement, warnings);
    if (block) blocks.push(block);
  });

  if (blocks.length === 0) {
    // Last resort: wrap entire body as raw HTML
    warnings.push('Could not parse any recognizable blocks — wrapping as Raw HTML.');
    blocks.push(makeRawHTML(body.innerHTML));
  }

  // Group every ~5 blocks into a section for manageability
  const sections: EditorSection[] = [];
  const chunkSize = 5;
  for (let i = 0; i < blocks.length; i += chunkSize) {
    sections.push({
      id: uuid(),
      columns: 1,
      blocks: [blocks.slice(i, i + chunkSize)],
    });
  }

  return { sections, warnings };
}

// ─── Element → Block ──────────────────────────────────────────────────────────

export function elementToBlock(el: HTMLElement, warnings: string[]): EditorBlock | null {
  const tag = el.tagName?.toLowerCase();
  if (!tag) return null;

  // Skip comment nodes, script tags, style tags
  if (['script', 'style', 'meta', 'link', 'head'].includes(tag)) return null;

  const styles = extractInlineStyles(el);

  switch (tag) {
    // ── Text ──────────────────────────────────────────────────────────────
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'heading',
        text: el.textContent ?? '',
        level: tag as 'h1' | 'h2' | 'h3' | 'h4',
        color: el.style.color || '#111827',
        fontSize: parseInt(el.style.fontSize) || defaultFontSize(tag),
        fontWeight: el.style.fontWeight || '700',
        textAlign: (el.style.textAlign as any) || 'left',
      };

    case 'p':
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'paragraph',
        text: el.innerHTML ?? '',
        color: el.style.color || '#374151',
        fontSize: parseInt(el.style.fontSize) || 16,
        lineHeight: parseFloat(el.style.lineHeight) || 1.6,
        textAlign: (el.style.textAlign as any) || 'left',
      };

    case 'a':
      // Only if standalone anchor (not inside a paragraph)
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'hyperlink',
        text: el.textContent ?? 'Link',
        href: el.getAttribute('href') ?? '#',
        color: el.style.color || '#2563EB',
        openInNewTab: el.getAttribute('target') === '_blank',
      };

    case 'span':
    case 'div': {
      // Check if it contains recognizable children
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 1) {
        // Single child — try to parse it
        const child = elementToBlock(children[0], warnings);
        if (child) return child;
      }
      if (children.length > 1) {
        // Multiple children — treat as raw
        warnings.push(`<${tag}> with multiple children wrapped as Raw HTML.`);
        return makeRawHTML(el.outerHTML);
      }
      // Plain text div/span → paragraph
      if (el.textContent?.trim()) {
        return makeParagraph(el.innerHTML);
      }
      return null;
    }

    // ── Inputs ────────────────────────────────────────────────────────────
    case 'input':
      return parseInputElement(el as HTMLInputElement, styles, warnings);

    case 'textarea':
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'textarea',
        label: findAssociatedLabel(el) ?? 'Label',
        placeholder: el.getAttribute('placeholder') ?? '',
        required: el.hasAttribute('required'),
        helperText: '',
        rows: parseInt(el.getAttribute('rows') ?? '4'),
        name: el.getAttribute('name') ?? '',
      };

    case 'select':
      return parseSelectElement(el as HTMLSelectElement, styles);

    // ── Layout ────────────────────────────────────────────────────────────
    case 'hr':
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'divider',
        color: el.style.borderColor || el.style.color || '#E5E7EB',
        thickness: parseInt(el.style.borderTopWidth) || 1,
        style: (el.style.borderTopStyle as any) || 'solid',
      };

    case 'img':
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'image',
        src: el.getAttribute('src') ?? '',
        alt: el.getAttribute('alt') ?? '',
        align: 'center',
        maxWidth: parseInt(el.style.maxWidth) || 100,
      };

    case 'table': {
      // Check if it's a layout table (email wrapper) or data table
      const isLayout = isEmailLayoutTable(el as HTMLTableElement);
      if (isLayout) {
        warnings.push('Layout table detected — parsing inner content recursively.');
        return makeRawHTML(el.outerHTML); // preserve as-is for safety
      }
      return parseTableElement(el as HTMLTableElement, styles);
    }

    case 'ul':
    case 'ol':
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'list',
        listType: tag === 'ol' ? 'ordered' : 'unordered',
        items: Array.from(el.querySelectorAll('li')).map(li => li.textContent?.trim() ?? ''),
        color: el.style.color || '#374151',
        fontSize: parseInt(el.style.fontSize) || 16,
      };

    case 'button':
      return {
        ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'button',
        label: el.textContent?.trim() ?? 'Button',
        variant: 'primary',
        size: 'md',
        fullWidth: false,
        align: 'left',
      };

    // ── Unknown → RawHTMLBlock ─────────────────────────────────────────────
    default:
      warnings.push(`Unknown element <${tag}> preserved as Raw HTML block.`);
      return makeRawHTML(el.outerHTML);
  }
}

// ─── Element Parsers ──────────────────────────────────────────────────────────

function parseInputElement(
  el: HTMLInputElement,
  styles: Partial<BaseBlock>,
  warnings: string[],
): EditorBlock | null {
  const type = el.getAttribute('type')?.toLowerCase() ?? 'text';

  if (type === 'radio') {
    // Radio buttons are grouped — return null here, handle at group level
    return null;
  }
  if (type === 'checkbox') {
    return {
      ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'single-checkbox',
      label: findAssociatedLabel(el) ?? 'Checkbox',
      required: el.hasAttribute('required'),
      name: el.getAttribute('name') ?? '',
      checked: el.hasAttribute('checked'),
    };
  }
  if (type === 'submit' || type === 'button') {
    return {
      ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'button',
      label: el.getAttribute('value') ?? 'Submit',
      variant: 'primary', size: 'md', fullWidth: false, align: 'left',
    };
  }
  if (type === 'date') {
    return {
      ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'date-picker',
      label: findAssociatedLabel(el) ?? 'Date',
      required: el.hasAttribute('required'),
      helperText: '',
      name: el.getAttribute('name') ?? '',
    };
  }

  // text, email, tel, number, password, url → TextInputBlock
  const validTypes = ['text', 'email', 'tel', 'number', 'password', 'url'];
  const inputType = validTypes.includes(type) ? type : 'text';

  return {
    ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'text-input',
    label: findAssociatedLabel(el) ?? 'Label',
    placeholder: el.getAttribute('placeholder') ?? '',
    required: el.hasAttribute('required'),
    helperText: '',
    inputType: inputType as any,
    name: el.getAttribute('name') ?? '',
  };
}

function parseSelectElement(el: HTMLSelectElement, styles: Partial<BaseBlock>): EditorBlock {
  const options = Array.from(el.querySelectorAll('option'))
    .filter(o => o.value !== '')
    .map(o => o.textContent?.trim() ?? '');

  const placeholder = Array.from(el.querySelectorAll('option'))
    .find(o => o.value === '')?.textContent?.trim() ?? 'Select...';

  return {
    ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'dropdown',
    label: findAssociatedLabel(el) ?? 'Label',
    options,
    required: el.hasAttribute('required'),
    placeholder,
    name: el.getAttribute('name') ?? '',
  };
}

function parseTableElement(el: HTMLTableElement, styles: Partial<BaseBlock>): EditorBlock {
  const headers: string[] = [];
  const rows: string[][] = [];

  const headerRow = el.querySelector('thead tr');
  if (headerRow) {
    headerRow.querySelectorAll('th, td').forEach(cell => {
      headers.push(cell.textContent?.trim() ?? '');
    });
  }

  el.querySelectorAll('tbody tr').forEach(row => {
    const cells: string[] = [];
    row.querySelectorAll('td, th').forEach(cell => {
      cells.push(cell.textContent?.trim() ?? '');
    });
    if (cells.length) rows.push(cells);
  });

  // If no explicit thead, use first row as headers
  if (!headers.length && rows.length) {
    headers.push(...(rows.shift() ?? []));
  }

  return {
    ...BASE_DEFAULTS, ...styles, id: uuid(), type: 'table',
    headers: headers.length ? headers : ['Column 1'],
    rows: rows.length ? rows : [['']],
    striped: false,
    bordered: true,
  };
}

// ─── Style Extraction ─────────────────────────────────────────────────────────

function extractInlineStyles(el: HTMLElement): Partial<BaseBlock> {
  const s = el.style;
  const result: Partial<BaseBlock> = {};

  if (s.backgroundColor) result.backgroundColor = s.backgroundColor;
  if (s.borderColor) result.borderColor = s.borderColor;
  if (s.borderWidth) result.borderWidth = parseInt(s.borderWidth) || 0;
  if (s.borderRadius) result.borderRadius = parseInt(s.borderRadius) || 0;
  if (s.marginTop) result.marginTop = parseInt(s.marginTop) || 0;
  if (s.marginBottom) result.marginBottom = parseInt(s.marginBottom) || 0;
  if (s.marginLeft) result.marginLeft = parseInt(s.marginLeft) || 0;
  if (s.marginRight) result.marginRight = parseInt(s.marginRight) || 0;
  if (s.paddingTop || s.padding) result.paddingY = parseInt(s.paddingTop || s.padding) || 0;
  if (s.paddingLeft || s.padding) result.paddingX = parseInt(s.paddingLeft || s.padding) || 0;

  const width = el.getAttribute('width') || s.width;
  if (width) {
    const w = parseInt(width);
    if (!isNaN(w) && w > 0 && w <= 100) result.width = w;
  }

  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findAssociatedLabel(el: HTMLElement): string | null {
  const id = el.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent?.trim() ?? null;
  }
  // Check if parent is a label
  if (el.parentElement?.tagName.toLowerCase() === 'label') {
    return el.parentElement.textContent?.replace(el.textContent ?? '', '').trim() ?? null;
  }
  // Check for preceding sibling label
  const prev = el.previousElementSibling;
  if (prev?.tagName.toLowerCase() === 'label') {
    return prev.textContent?.trim() ?? null;
  }
  return null;
}

function isEmailTableLayout(table: HTMLTableElement): boolean {
  // Heuristics: table used as layout wrapper (not data)
  return (
    table.getAttribute('role') === 'presentation' ||
    table.getAttribute('cellpadding') !== null ||
    parseInt(table.getAttribute('width') ?? '0') > 400
  );
}

function isEmailLayoutTable(body: Element): boolean {
  const tables = body.querySelectorAll('table');
  return Array.from(tables).some(t => isEmailTableLayout(t as HTMLTableElement));
}

function defaultFontSize(tag: string): number {
  const map: Record<string, number> = { h1: 32, h2: 24, h3: 20, h4: 18, h5: 16, h6: 14 };
  return map[tag] ?? 24;
}

function makeParagraph(html: string): EditorBlock {
  return {
    ...BASE_DEFAULTS, id: uuid(), type: 'paragraph',
    text: html,
    color: '#374151', fontSize: 16, lineHeight: 1.6, textAlign: 'left',
  };
}

function makeRawHTML(html: string): EditorBlock {
  return {
    ...BASE_DEFAULTS, id: uuid(), type: 'raw-html',
    html,
  };
}

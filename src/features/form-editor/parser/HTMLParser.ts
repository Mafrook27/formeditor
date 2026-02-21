import { sanitizeHTML } from './Sanitizer';
import { v4 as uuidv4 } from 'uuid';
import type { EditorBlock, EditorSection } from '../editorConfig';
import { BLOCK_TYPES } from '../editorConfig';

export const EDITOR_VERSION = '1';
export const EDITOR_VERSION_ATTR = 'data-editor-version';
export const EDITOR_SECTION_ATTR = 'data-editor-section';
export const EDITOR_COLUMN_ATTR = 'data-editor-column';
export const EDITOR_BLOCK_TYPE_ATTR = 'data-block-type';
export const EDITOR_LAYOUT_ATTR = 'data-editor-layout';

export interface ParsedDocument {
  sections: EditorSection[];
  rawHTML: string;
  isEditorGenerated: boolean;
  version: string | null;
  metadata: {
    hasStyles: boolean;
    hasTables: boolean;
    hasLists: boolean;
    hasForms: boolean;
    hasSignatures: boolean;
    styleContent: string;
  };
}

export interface BlockParseContext {
  originalStyles: string;
  parentStyles: CSSStyleDeclaration | null;
  isEditorGenerated: boolean;
}

export function parseHTML(html: string): ParsedDocument {
  try {
    const sanitized = sanitizeHTML(html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');

    const hasSections = doc.querySelector(`[${EDITOR_SECTION_ATTR}]`) !== null;
    const isEditorGenerated = hasSections;

    const htmlElement = doc.documentElement;
    const version = htmlElement?.getAttribute(EDITOR_VERSION_ATTR) || (isEditorGenerated ? '1' : null);

    const styleContent = extractAllStyles(doc);

    const metadata = {
      hasStyles: styleContent.length > 0 || hasInlineStyles(doc),
      hasTables: doc.querySelector('table') !== null,
      hasLists: doc.querySelector('ul, ol') !== null,
      hasForms: doc.querySelector('input, select, textarea, button') !== null,
      hasSignatures: hasSignatureElements(doc),
      styleContent,
    };

    const context: BlockParseContext = {
      originalStyles: styleContent,
      parentStyles: null,
      isEditorGenerated,
    };

    let sections: EditorSection[];

    if (isEditorGenerated) {
      sections = parseEditorGeneratedHTML(doc, context);
    } else {
      sections = parseExternalHTML(doc, context);
    }

    return {
      sections,
      rawHTML: sanitized,
      isEditorGenerated,
      version,
      metadata,
    };
  } catch (err) {
    console.error('[parseHTML] Failed to parse HTML:', err);
    return {
      sections: [{ id: uuidv4(), columns: 1, blocks: [[]] }],
      rawHTML: html,
      isEditorGenerated: false,
      version: null,
      metadata: {
        hasStyles: false, hasTables: false, hasLists: false,
        hasForms: false, hasSignatures: false, styleContent: '',
      },
    };
  }
}

function extractAllStyles(doc: Document): string {
  const styles: string[] = [];
  doc.querySelectorAll('style').forEach(style => {
    if (style.textContent) {
      styles.push(style.textContent);
    }
  });
  return styles.join('\n');
}

function hasInlineStyles(doc: Document): boolean {
  return doc.querySelector('[style]') !== null;
}

function hasSignatureElements(doc: Document): boolean {
  const signButtons = doc.querySelectorAll('button[type="button"]');
  for (const btn of signButtons) {
    if (btn.textContent?.trim().toUpperCase() === 'SIGN') {
      return true;
    }
  }
  return doc.querySelector('.signdiv, .signature, [data-signature]') !== null;
}

function parseEditorGeneratedHTML(doc: Document, context: BlockParseContext): EditorSection[] {
  const sections: EditorSection[] = [];
  const sectionElements = doc.querySelectorAll(`[${EDITOR_SECTION_ATTR}]`);

  if (sectionElements.length === 0) {
    return parseExternalHTML(doc, context);
  }

  sectionElements.forEach(sectionEl => {
    const layoutAttr = sectionEl.getAttribute(EDITOR_LAYOUT_ATTR);
    const sectionId = sectionEl.getAttribute('data-section-id') || uuidv4();
    const columns = (parseInt(layoutAttr || '1') || 1) as 1 | 2 | 3;

    const section: EditorSection = {
      id: sectionId,
      columns,
      blocks: Array(columns).fill(null).map(() => []),
    };

    const columnContainers = sectionEl.querySelectorAll(`:scope > [${EDITOR_COLUMN_ATTR}]`);

    if (columnContainers.length > 0) {
      columnContainers.forEach((colEl) => {
        const colIdx = parseInt(colEl.getAttribute(EDITOR_COLUMN_ATTR) || '0');
        const targetIdx = Math.min(colIdx, columns - 1);
        const blocks = parseColumnBlocks(colEl as HTMLElement, context);
        section.blocks[targetIdx] = blocks;
      });
    } else {
      const blocks = parseColumnBlocks(sectionEl as HTMLElement, context);
      section.blocks[0] = blocks;
    }

    sections.push(section);
  });

  return sections;
}

// Heuristic: detect if an element looks like a multi-column layout wrapper
// even when using CSS classes rather than inline styles
function detectColumnCount(element: HTMLElement): number | null {
  const style = element.style;

  // Inline grid
  if (style.display === 'grid' && style.gridTemplateColumns) {
    const frUnits = style.gridTemplateColumns.match(/1fr/g);
    const repeatMatch = style.gridTemplateColumns.match(/repeat\((\d+)/);
    if (repeatMatch) return Math.min(parseInt(repeatMatch[1]), 3);
    if (frUnits) return Math.min(frUnits.length, 3);
  }

  // Inline flex with matching child widths
  if (style.display === 'flex' || style.display === '-webkit-flex') {
    const flexChildren = Array.from(element.children) as HTMLElement[];
    if (flexChildren.length >= 2 && flexChildren.length <= 3) {
      const allHaveWidth = flexChildren.every(c => c.style.width || c.style.flex);
      if (allHaveWidth) return flexChildren.length as 1 | 2 | 3;
    }
  }

  // CSS class heuristics (Bootstrap, Foundation, common naming patterns)
  const cls = element.className || '';
  if (/\bcol-2\b|\btwo-col|\b2-col|\bgrid-2\b/.test(cls)) return 2;
  if (/\bcol-3\b|\bthree-col|\b3-col|\bgrid-3\b/.test(cls)) return 3;
  if (/\brow\b/.test(cls)) {
    const childCols = Array.from(element.children).filter(c =>
      /\bcol\b|\bcolumn\b|\bcol-\d\b/.test((c as HTMLElement).className || '')
    );
    if (childCols.length >= 2 && childCols.length <= 3) return childCols.length;
  }

  // Table-based two/three column (width-balanced td siblings)
  if (element.tagName.toLowerCase() === 'tr') {
    const tds = element.querySelectorAll(':scope > td');
    if (tds.length >= 2 && tds.length <= 3) return tds.length;
  }

  return null;
}

function parseExternalHTML(doc: Document, context: BlockParseContext): EditorSection[] {
  const body = doc.body;
  const sections: EditorSection[] = [];
  let currentBlocks: EditorBlock[] = [];

  for (let i = 0; i < body.childNodes.length; i++) {
    const node = body.childNodes[i];

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const style = element.style;

      if (style.display === 'grid' && style.gridTemplateColumns) {
        if (currentBlocks.length > 0) {
          sections.push({ id: uuidv4(), columns: 1, blocks: [currentBlocks] });
          currentBlocks = [];
        }
        const gridSection = parseGridLayoutAsSection(element, context);
        if (gridSection) sections.push(gridSection);
        continue;
      }

      const detectedCols = detectColumnCount(element);
      if (detectedCols && detectedCols >= 2) {
        if (currentBlocks.length > 0) {
          sections.push({ id: uuidv4(), columns: 1, blocks: [currentBlocks] });
          currentBlocks = [];
        }
        const children = Array.from(element.children) as HTMLElement[];
        if (children.length === detectedCols) {
          const cols = detectedCols as 1 | 2 | 3;
          const colBlocks: EditorBlock[][] = children.map(child => {
            const blocks: EditorBlock[] = [];
            for (let j = 0; j < child.childNodes.length; j++) {
              blocks.push(...parseNode(child.childNodes[j], context));
            }
            return blocks;
          });
          sections.push({ id: uuidv4(), columns: cols, blocks: colBlocks });
          continue;
        }
      }

      if (style.display === 'flex' || style.display === '-webkit-flex') {
        const flexChildren = Array.from(element.children) as HTMLElement[];
        if (flexChildren.length >= 2 && flexChildren.length <= 3) {
          const allHaveWidth = flexChildren.every(c => c.style.width);
          if (allHaveWidth) {
            if (currentBlocks.length > 0) {
              sections.push({ id: uuidv4(), columns: 1, blocks: [currentBlocks] });
              currentBlocks = [];
            }
            const cols = flexChildren.length as 1 | 2 | 3;
            const colBlocks: EditorBlock[][] = flexChildren.map(child => {
              const blocks: EditorBlock[] = [];
              for (let j = 0; j < child.childNodes.length; j++) {
                blocks.push(...parseNode(child.childNodes[j], context));
              }
              return blocks;
            });
            sections.push({ id: uuidv4(), columns: cols, blocks: colBlocks });
            continue;
          }
        }
      }
    }

    const parsedBlocks = parseNode(node, context);
    currentBlocks.push(...parsedBlocks);
  }

  if (currentBlocks.length > 0) {
    const validBlocks = currentBlocks.filter(block => {
      if (block.type === BLOCK_TYPES.PARAGRAPH || block.type === BLOCK_TYPES.HEADING) {
        return (block as any).content?.trim() || (block as any).htmlContent?.trim();
      }
      if (block.type === BLOCK_TYPES.RAW_HTML) {
        return (block as any).htmlContent?.trim();
      }
      return true;
    });

    if (validBlocks.length > 0) {
      sections.push({ id: uuidv4(), columns: 1, blocks: [validBlocks] });
    }
  }

  return sections.length > 0 ? sections : [{ id: uuidv4(), columns: 1, blocks: [[]] }];
}

function parseColumnBlocks(container: HTMLElement, context: BlockParseContext): EditorBlock[] {
  const blocks: EditorBlock[] = [];

  if (container.children.length === 0) {
    return blocks;
  }

  for (let i = 0; i < container.children.length; i++) {
    const element = container.children[i] as HTMLElement;
    const blockType = element.getAttribute('data-block-type');

    if (blockType) {
      const block = restoreTypedBlock(element, blockType, context);
      if (block) blocks.push(block);
    } else {
      const parsed = parseNode(element, context);
      blocks.push(...parsed);
    }
  }

  return blocks;
}

function parseNode(node: Node, context: BlockParseContext): EditorBlock[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (text) {
      return [createParagraphBlock(text, '', context)];
    }
    return [];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();

  const voidElements = ['hr', 'br', 'img', 'input'];
  if (!element.innerHTML.trim() && !voidElements.includes(tagName)) {
    return [];
  }

  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return [parseHeadingElement(element, tagName)];

    case 'p':
      return [parseParagraphElement(element, context)];

    case 'div':
      return parseContainerElement(element, context);

    case 'table':
      return [parseTableElement(element, context)];

    case 'ul':
    case 'ol':
      return [parseListElement(element, tagName)];

    case 'hr':
      return [parseDividerElement(element)];

    case 'img':
      return [parseImageElement(element)];

    case 'input':
      return parseInputElement(element as HTMLInputElement);

    case 'textarea':
      return [parseTextareaElement(element as HTMLTextAreaElement)];

    case 'select':
      return [parseSelectElement(element as HTMLSelectElement)];

    case 'button':
      return [parseButtonElement(element as HTMLButtonElement)];

    case 'fieldset':
      return parseFieldsetElement(element, context);

    case 'form':
      return parseContainerChildren(element, context);

    case 'label':
      if (element.querySelector('input[type="checkbox"], input[type="radio"]')) {
        return parseCheckboxLabelElement(element);
      }
      return [parseParagraphElement(element, context)];

    case 'style':
    case 'script':
      return [];

    case 'a':
      return [parseHyperlinkElement(element)];

    case 'span':
    case 'strong':
    case 'em':
    case 'b':
    case 'i':
    case 'u':
      return [parseParagraphElement(element, context)];

    case 'br':
      return [];

    case 'section':
    case 'article':
    case 'header':
    case 'footer':
    case 'nav':
    case 'aside':
    case 'main':
      return parseContainerChildren(element, context);

    default:
      if (element.children.length > 0) {
        return parseContainerChildren(element, context);
      }
      if (element.textContent?.trim()) {
        return [parseParagraphElement(element, context)];
      }
      return [];
  }
}

const INLINE_TAGS = new Set([
  'b', 'i', 'u', 'em', 'strong', 'span', 'a', 'br', 'small', 'mark',
  'sub', 'sup', 'del', 'ins', 'font', 'abbr', 'cite', 'code', 'time', 's', 'strike',
]);

function isInlineOnlyContainer(element: HTMLElement): boolean {
  if (!element.textContent?.trim()) return false;
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = (child as HTMLElement).tagName.toLowerCase();
      if (!INLINE_TAGS.has(tag)) return false;
    }
  }
  return true;
}

function parseContainerElement(element: HTMLElement, context: BlockParseContext): EditorBlock[] {
  if (element.classList.contains('signdiv')) {
    return [parseSignatureElement(element)];
  }

  const style = element.style;
  if (style.display === 'grid' && style.gridTemplateColumns) {
    return parseGridLayoutAsBlocks(element, context);
  }

  if (style.display === 'flex' || style.display === '-webkit-flex') {
    const flexChildren = Array.from(element.children) as HTMLElement[];
    if (flexChildren.length >= 2) {
      const blocks: EditorBlock[] = [];
      flexChildren.forEach(child => {
        blocks.push(...parseNode(child, context));
      });
      if (blocks.length > 0) return blocks;
    }
  }

  const label = element.querySelector('label');
  const input = element.querySelector('input, textarea, select');

  if (label && input) {
    const inputType = input.getAttribute('type') || input.tagName.toLowerCase();

    if (inputType === 'checkbox') {
      return parseCheckboxLabelElement(element);
    }
    if (inputType === 'radio') {
      return [];
    }
    if (input.tagName === 'SELECT') {
      return [parseSelectElement(input as HTMLSelectElement, label.textContent || '')];
    }
    if (input.tagName === 'TEXTAREA') {
      return [parseTextareaElement(input as HTMLTextAreaElement, label.textContent || '')];
    }

    return parseInputElement(input as HTMLInputElement, label.textContent || '');
  }

  if (isInlineOnlyContainer(element)) {
    return [parseParagraphElement(element, context)];
  }

  return parseContainerChildren(element, context);
}

function parseContainerChildren(element: HTMLElement, context: BlockParseContext): EditorBlock[] {
  const blocks: EditorBlock[] = [];

  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];
    const parsed = parseNode(child, context);
    blocks.push(...parsed);
  }

  return blocks;
}

function parseGridLayoutAsBlocks(element: HTMLElement, context: BlockParseContext): EditorBlock[] {
  const blocks: EditorBlock[] = [];

  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;

    const label = child.querySelector('label');
    const input = child.querySelector('input, textarea, select');

    if (label && input) {
      const inputType = input.getAttribute('type') || input.tagName.toLowerCase();

      if (input.tagName === 'SELECT') {
        blocks.push(parseSelectElement(input as HTMLSelectElement, label.textContent || ''));
      } else if (input.tagName === 'TEXTAREA') {
        blocks.push(parseTextareaElement(input as HTMLTextAreaElement, label.textContent || ''));
      } else if (inputType !== 'checkbox' && inputType !== 'radio') {
        const parsed = parseInputElement(input as HTMLInputElement, label.textContent || '');
        blocks.push(...parsed);
      }
    } else {
      const parsed = parseNode(child, context);
      blocks.push(...parsed);
    }
  }

  return blocks;
}

function parseGridLayoutAsSection(element: HTMLElement, context: BlockParseContext): EditorSection | null {
  const style = element.style;
  const gridColumns = style.gridTemplateColumns;

  let columnCount = 1;
  if (gridColumns) {
    const frUnits = gridColumns.match(/1fr/g);
    const repeatMatch = gridColumns.match(/repeat\((\d+)/);
    if (repeatMatch) {
      columnCount = Math.min(parseInt(repeatMatch[1]), 3);
    } else if (frUnits) {
      columnCount = Math.min(frUnits.length, 3);
    }
  }

  if (columnCount === 1) return null;

  const columns = columnCount as 1 | 2 | 3;
  const children = Array.from(element.children) as HTMLElement[];

  if (children.length === columns) {
    const columnBlocks: EditorBlock[][] = children.map(child => {
      const blocks: EditorBlock[] = [];
      for (let i = 0; i < child.childNodes.length; i++) {
        blocks.push(...parseNode(child.childNodes[i], context));
      }
      return blocks;
    });

    return { id: uuidv4(), columns, blocks: columnBlocks };
  }

  const allBlocks: EditorBlock[] = [];
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;

    const label = child.querySelector('label');
    const input = child.querySelector('input, textarea, select');

    if (label && input) {
      const inputType = input.getAttribute('type') || input.tagName.toLowerCase();

      if (input.tagName === 'SELECT') {
        allBlocks.push(parseSelectElement(input as HTMLSelectElement, label.textContent || ''));
      } else if (input.tagName === 'TEXTAREA') {
        allBlocks.push(parseTextareaElement(input as HTMLTextAreaElement, label.textContent || ''));
      } else if (inputType !== 'checkbox' && inputType !== 'radio') {
        const parsed = parseInputElement(input as HTMLInputElement, label.textContent || '');
        allBlocks.push(...parsed);
      }
    } else {
      const parsed = parseNode(child, context);
      allBlocks.push(...parsed);
    }
  }

  const columnBlocks: EditorBlock[][] = Array(columns).fill(null).map(() => []);
  allBlocks.forEach((block, idx) => {
    const colIdx = idx % columns;
    columnBlocks[colIdx].push(block);
  });

  return { id: uuidv4(), columns, blocks: columnBlocks };
}

// ─── Block Parsing Functions ─────────────────────────────────────────

function parseHeadingElement(element: HTMLElement, tagName: string): EditorBlock {
  const level = tagName as 'h1' | 'h2' | 'h3' | 'h4';
  const style = element.style;

  let fontSize = 15;
  if (style.fontSize) {
    const match = style.fontSize.match(/(\d+)/);
    if (match) fontSize = parseInt(match[1]);
  } else {
    const defaults: Record<string, number> = { h1: 24, h2: 18, h3: 15, h4: 14, h5: 13, h6: 12 };
    fontSize = defaults[tagName] || 15;
  }

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.HEADING,
    content: element.textContent || '',
    htmlContent: element.innerHTML,
    level: ['h1', 'h2', 'h3', 'h4'].includes(level) ? level : 'h2',
    fontSize,
    fontWeight: parseInt(style.fontWeight) || 700,
    textAlign: style.textAlign || 'left',
    lineHeight: parseFloat(style.lineHeight) || 1.3,
    color: style.color || '',
    width: 100,
    marginTop: parseMargin(style.marginTop),
    marginBottom: parseMargin(style.marginBottom) || 10,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseParagraphElement(element: HTMLElement, context: BlockParseContext): EditorBlock {
  const style = element.style;

  let fontSize = 11;
  if (style.fontSize) {
    const match = style.fontSize.match(/(\d+)/);
    if (match) fontSize = parseInt(match[1]);
  }

  return createParagraphBlock(
    element.textContent || '',
    element.innerHTML,
    context,
    {
      fontSize,
      fontWeight: parseInt(style.fontWeight) || 400,
      textAlign: style.textAlign || 'left',
      lineHeight: parseFloat(style.lineHeight) || 1.4,
      color: style.color || '',
    }
  );
}

function parseHyperlinkElement(element: HTMLElement): EditorBlock {
  const anchor = element as HTMLAnchorElement;
  const style = element.style;

  let fontSize = 14;
  if (style.fontSize) {
    const match = style.fontSize.match(/(\d+)/);
    if (match) fontSize = parseInt(match[1]);
  }

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.HYPERLINK,
    text: anchor.textContent || 'Click here',
    url: anchor.href || '#',
    openInNewTab: anchor.target === '_blank',
    underline: style.textDecoration?.includes('underline') ?? true,
    fontSize,
    fontWeight: parseInt(style.fontWeight) || 400,
    textAlign: style.textAlign || 'left',
    lineHeight: parseFloat(style.lineHeight) || 1.6,
    color: style.color || '#0066cc',
    width: 100,
    marginTop: parseMargin(style.marginTop),
    marginBottom: parseMargin(style.marginBottom) || 8,
    marginLeft: 0,
    marginRight: 0,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function createParagraphBlock(
  content: string,
  htmlContent: string,
  _context: BlockParseContext,
  styles?: Partial<{ fontSize: number; fontWeight: number; textAlign: string; lineHeight: number; color: string }>
): EditorBlock {
  return {
    id: uuidv4(),
    type: BLOCK_TYPES.PARAGRAPH,
    content: content,
    htmlContent: htmlContent,
    fontSize: styles?.fontSize || 11,
    fontWeight: styles?.fontWeight || 400,
    textAlign: styles?.textAlign || 'left',
    lineHeight: styles?.lineHeight || 1.4,
    color: styles?.color || '',
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function extractCellText(cell: Element): string {
  const parts: string[] = [];
  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent;
      if (t) parts.push(t);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === 'br') { parts.push('\n'); return; }
    if (tag === 'p' || tag === 'div') {
      if (parts.length > 0 && !/\n$/.test(parts[parts.length - 1])) parts.push('\n');
      Array.from(el.childNodes).forEach(walk);
      parts.push('\n');
      return;
    }
    if (tag === 'li') {
      parts.push('\u2022 ' + (el.textContent?.trim() || '') + '\n');
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      if (parts.length > 0 && !/\n$/.test(parts[parts.length - 1])) parts.push('\n');
      Array.from(el.children).forEach(child => {
        if (child.tagName.toLowerCase() === 'li') walk(child);
      });
      return;
    }
    if (tag === 'span' && el.classList.contains('placeholder')) {
      parts.push(el.textContent || '');
      return;
    }
    Array.from(el.childNodes).forEach(walk);
  }
  Array.from(cell.childNodes).forEach(walk);
  return parts.join('').replace(/\n{3,}/g, '\n\n').trim();
}

function parseTableElement(element: HTMLElement, _context: BlockParseContext): EditorBlock {
  const rows: string[][] = [];
  let hasHeaderRow = false;
  let maxCols = 0;

  // Track rowspan: map of colIndex → remaining rows it spans
  const rowspanTracker: Map<number, number> = new Map();

  function processRow(tr: Element, isFirstRow: boolean): string[] {
    const cells: string[] = [];
    let colCursor = 0;

    // Insert empty strings for cells occupied by rowspans from previous rows
    const insertRowspanPlaceholders = () => {
      while (rowspanTracker.has(colCursor)) {
        const remaining = rowspanTracker.get(colCursor)! - 1;
        if (remaining > 0) {
          rowspanTracker.set(colCursor, remaining);
        } else {
          rowspanTracker.delete(colCursor);
        }
        cells.push('');
        colCursor++;
      }
    };

    tr.querySelectorAll(':scope > th, :scope > td').forEach(cell => {
      insertRowspanPlaceholders();
      const colspan = parseInt(cell.getAttribute('colspan') || '1') || 1;
      const rowspan = parseInt(cell.getAttribute('rowspan') || '1') || 1;
      const text = extractCellText(cell);
      cells.push(text);
      // Register rowspan for subsequent rows
      if (rowspan > 1) {
        for (let c = 0; c < colspan; c++) {
          rowspanTracker.set(colCursor + c, rowspan - 1);
        }
      }
      // Fill colspan extras
      for (let c = 1; c < colspan; c++) cells.push('');
      colCursor += colspan;
    });
    // Fill any trailing rowspan placeholders
    insertRowspanPlaceholders();

    return cells;
  }

  const thead = element.querySelector(':scope > thead');
  if (thead) {
    hasHeaderRow = true;
    let firstTr = true;
    thead.querySelectorAll(':scope > tr').forEach(tr => {
      const cells = processRow(tr, firstTr);
      firstTr = false;
      if (cells.length > 0) { rows.push(cells); maxCols = Math.max(maxCols, cells.length); }
    });
  }

  const tbody = element.querySelector(':scope > tbody');
  const rowContainer = tbody || element;
  let firstBodyRow = true;
  rowContainer.querySelectorAll(':scope > tr').forEach((tr, rowIdx) => {
    if (thead && tr.closest('thead')) return;
    if (rowIdx === 0 && !hasHeaderRow && tr.querySelector(':scope > th')) hasHeaderRow = true;
    const cells = processRow(tr, firstBodyRow && rows.length === 0);
    firstBodyRow = false;
    if (cells.length > 0) { rows.push(cells); maxCols = Math.max(maxCols, cells.length); }
  });

  if (!tbody && !thead && rows.length === 0) {
    let firstTr = true;
    element.querySelectorAll(':scope > tr').forEach((tr, rowIdx) => {
      if (rowIdx === 0 && tr.querySelector(':scope > th')) hasHeaderRow = true;
      const cells = processRow(tr, firstTr);
      firstTr = false;
      if (cells.length > 0) { rows.push(cells); maxCols = Math.max(maxCols, cells.length); }
    });
  }

  if (maxCols > 0) {
    rows.forEach(row => { while (row.length < maxCols) row.push(''); });
  }

  if (rows.length === 0) { rows.push(['Cell 1', 'Cell 2', 'Cell 3']); maxCols = 3; }

  let columnWidths: number[] | undefined;
  const rowHeights: number[] = [];
  element.querySelectorAll('tr').forEach(tr => {
    const h = (tr as HTMLElement).style.height;
    rowHeights.push(h && h.endsWith('px') ? parseFloat(h) : 0);
  });
  const hasRowHeights = rowHeights.some(h => h > 0);

  const colgroup = element.querySelector('colgroup');
  if (colgroup) {
    const widths: number[] = [];
    colgroup.querySelectorAll('col').forEach(col => {
      const w = (col as HTMLElement).style.width;
      if (w && w.endsWith('%')) widths.push(parseFloat(w));
    });
    if (widths.length === maxCols) columnWidths = widths;
  }

  if (!columnWidths) {
    const detectedWidths: number[] = [];
    const sampleTr = element.querySelector('tr');
    if (sampleTr) {
      sampleTr.querySelectorAll(':scope > th, :scope > td').forEach(cell => {
        const el = cell as HTMLElement;
        const w = el.style.width || el.getAttribute('width') || '';
        const cs = parseInt(cell.getAttribute('colspan') || '1') || 1;
        if (w.endsWith('%')) {
          const pct = parseFloat(w) / cs;
          for (let i = 0; i < cs; i++) detectedWidths.push(pct);
        }
      });
      if (detectedWidths.length === maxCols && detectedWidths.every(w => w > 0)) {
        columnWidths = detectedWidths;
      }
    }
  }

  if (!columnWidths) columnWidths = Array(maxCols).fill(100 / maxCols);

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.TABLE,
    htmlContent: element.outerHTML,
    rows,
    headerRow: hasHeaderRow,
    columnWidths,
    rowHeights: hasRowHeights ? rowHeights : undefined,
    width: 100,
    marginTop: 8,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseListElement(element: HTMLElement, tagName: string): EditorBlock {
  const items: string[] = [];

  element.querySelectorAll(':scope > li').forEach(li => {
    items.push(li.textContent || '');
  });

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.LIST,
    listType: tagName === 'ol' ? 'ordered' : 'unordered',
    htmlContent: element.outerHTML,
    items: items.length > 0 ? items : ['Item 1', 'Item 2'],
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseDividerElement(element: HTMLElement): EditorBlock {
  const style = element.style;

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.DIVIDER,
    thickness: 1,
    style: 'solid',
    color: '#e2e8f0',
    width: 100,
    marginTop: parseMargin(style.marginTop) || 16,
    marginBottom: parseMargin(style.marginBottom) || 16,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseImageElement(element: HTMLElement): EditorBlock {
  const img = element as HTMLImageElement;

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.IMAGE,
    src: img.src || img.getAttribute('src') || '',
    alt: img.alt || '',
    alignment: 'center',
    borderRadius: parseInt(img.style.borderRadius) || 0,
    maxHeight: parseInt(img.style.maxHeight) || 300,
    width: 100,
    marginTop: parseMargin(img.style.marginTop),
    marginBottom: parseMargin(img.style.marginBottom) || 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseInputElement(element: HTMLInputElement, label?: string): EditorBlock[] {
  const type = element.type || 'text';
  const baseLabel = label?.replace(/\s*\*\s*$/, '').trim() || element.placeholder || 'Field';
  const isRequired = element.required || label?.includes('*') || false;

  switch (type) {
    case 'date':
      return [{
        id: uuidv4(),
        type: BLOCK_TYPES.DATE_PICKER,
        label: baseLabel,
        required: isRequired,
        fieldName: element.name || element.id || `date_${Date.now()}`,
        helpText: '',
        width: 50,
        marginTop: 0,
        marginBottom: 8,
        paddingX: 0,
        paddingY: 0,
        locked: false,
      } as EditorBlock];

    case 'file':
    case 'checkbox':
    case 'radio':
      return [];

    default:
      return [{
        id: uuidv4(),
        type: BLOCK_TYPES.TEXT_INPUT,
        label: baseLabel,
        placeholder: element.placeholder || '',
        required: isRequired,
        fieldName: element.name || element.id || `text_${Date.now()}`,
        helpText: '',
        validationType: type === 'email' ? 'email' : type === 'tel' ? 'phone' : 'none',
        maxLength: element.maxLength > 0 ? String(element.maxLength) : '',
        width: 100,
        marginTop: 0,
        marginBottom: 8,
        paddingX: 0,
        paddingY: 0,
        locked: false,
      } as EditorBlock];
  }
}

function parseTextareaElement(element: HTMLTextAreaElement, label?: string): EditorBlock {
  const baseLabel = label?.replace(/\s*\*\s*$/, '').trim() || element.placeholder || 'Text Area';

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.TEXTAREA,
    label: baseLabel,
    placeholder: element.placeholder || '',
    required: element.required || label?.includes('*') || false,
    fieldName: element.name || element.id || `textarea_${Date.now()}`,
    helpText: '',
    rows: element.rows || 4,
    maxLength: element.maxLength > 0 ? String(element.maxLength) : '',
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseSelectElement(element: HTMLSelectElement, label?: string): EditorBlock {
  const options: string[] = [];
  element.querySelectorAll('option').forEach(opt => {
    if (opt.value) {
      options.push(opt.textContent || opt.value);
    }
  });

  const baseLabel = label?.replace(/\s*\*\s*$/, '').trim() || 'Dropdown';

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.DROPDOWN,
    label: baseLabel,
    required: element.required || label?.includes('*') || false,
    fieldName: element.name || element.id || `dropdown_${Date.now()}`,
    helpText: '',
    options: options.length > 0 ? options : ['Option 1', 'Option 2'],
    defaultValue: element.value || '',
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseButtonElement(element: HTMLButtonElement): EditorBlock {
  const buttonText = element.textContent?.trim() || 'Button';
  const buttonType = element.type || 'button';

  if (element.hasAttribute('data-signature-button') || buttonText.toUpperCase() === 'SIGN') {
    return {
      id: uuidv4(),
      type: BLOCK_TYPES.SIGNATURE,
      label: buttonText || 'Sign Here',
      required: false,
      fieldName: `signature_${Date.now()}`,
      helpText: 'Click to insert signature',
      signatureUrl: '',
      width: 100,
      marginTop: 0,
      marginBottom: 8,
      paddingX: 0,
      paddingY: 0,
      locked: false,
    } as EditorBlock;
  }

  let variant: 'primary' | 'secondary' | 'outline' = 'primary';
  if (element.classList.contains('btn-secondary') || element.classList.contains('btn-cancel')) {
    variant = 'secondary';
  } else if (element.classList.contains('btn-outline') || element.classList.contains('btn-save')) {
    variant = 'outline';
  }

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.BUTTON,
    label: buttonText,
    buttonType: buttonType === 'submit' ? 'submit' : buttonType === 'reset' ? 'reset' : 'button',
    variant,
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function parseFieldsetElement(element: HTMLElement, context: BlockParseContext): EditorBlock[] {
  const legend = element.querySelector('legend');
  const label = legend?.textContent?.replace(/\s*\*\s*$/, '').trim() || 'Group';
  const isRequired = legend?.textContent?.includes('*') || false;

  const radios = element.querySelectorAll('input[type="radio"]');
  const checkboxes = element.querySelectorAll('input[type="checkbox"]');

  if (radios.length > 0) {
    const options: string[] = [];
    radios.forEach(radio => {
      const radioLabel = radio.closest('label')?.textContent?.trim();
      if (radioLabel) options.push(radioLabel);
    });

    const firstRadio = radios[0] as HTMLInputElement;

    return [{
      id: uuidv4(),
      type: BLOCK_TYPES.RADIO_GROUP,
      label,
      required: isRequired || firstRadio.required,
      fieldName: firstRadio.name || `radio_${Date.now()}`,
      helpText: '',
      options: options.length > 0 ? options : ['Option A', 'Option B'],
      layout: 'vertical',
      width: 100,
      marginTop: 0,
      marginBottom: 8,
      paddingX: 0,
      paddingY: 0,
      locked: false,
    } as EditorBlock];
  }

  if (checkboxes.length > 1) {
    const options: string[] = [];
    checkboxes.forEach(cb => {
      const cbLabel = cb.closest('label')?.textContent?.trim();
      if (cbLabel) options.push(cbLabel);
    });

    const firstCheckbox = checkboxes[0] as HTMLInputElement;

    return [{
      id: uuidv4(),
      type: BLOCK_TYPES.CHECKBOX_GROUP,
      label,
      required: isRequired,
      fieldName: firstCheckbox.name || `checkbox_group_${Date.now()}`,
      helpText: '',
      options: options.length > 0 ? options : ['Choice 1', 'Choice 2'],
      layout: 'vertical',
      width: 100,
      marginTop: 0,
      marginBottom: 8,
      paddingX: 0,
      paddingY: 0,
      locked: false,
    } as EditorBlock];
  }

  return parseContainerChildren(element, context);
}

function parseCheckboxLabelElement(element: HTMLElement): EditorBlock[] {
  const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
  const label = element.textContent?.trim() || '';

  if (!checkbox) return [];

  return [{
    id: uuidv4(),
    type: BLOCK_TYPES.SINGLE_CHECKBOX,
    label: label.replace(/^\s*/, ''),
    required: checkbox.required,
    fieldName: checkbox.name || checkbox.id || `agreement_${Date.now()}`,
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock];
}

function parseSignatureElement(element: HTMLElement): EditorBlock {
  // Check <label> first, then <span> (common in .signdiv), then fallback
  const labelEl = element.querySelector('label') || element.querySelector('span.sig-label') || element.querySelector('span:not([class*="btn"]):not([class*="button"])');
  const label = labelEl?.textContent?.replace(/\s*\*\s*$/, '').trim() || 'Signature';
  const isRequired = element.querySelector('[required]') !== null || element.textContent?.includes('*') || false;
  const signatureImg = element.querySelector('img.signature, img[alt*="ignature"]') as HTMLImageElement | null;

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.SIGNATURE,
    label,
    required: isRequired,
    fieldName: `signature_${Date.now()}`,
    helpText: 'Click to insert signature',
    signatureUrl: signatureImg?.src || '',
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

function restoreTypedBlock(element: HTMLElement, blockType: string, _context: BlockParseContext): EditorBlock | null {
  const baseProps = {
    id: element.getAttribute('data-block-id') || uuidv4(),
    width: parseInt(element.getAttribute('data-width') || '100'),
    marginTop: parseInt(element.getAttribute('data-margin-top') || element.style.marginTop || '0'),
    marginBottom: parseInt(element.getAttribute('data-margin-bottom') || element.style.marginBottom || '8'),
    marginLeft: parseInt(element.getAttribute('data-margin-left') || '0'),
    marginRight: parseInt(element.getAttribute('data-margin-right') || '0'),
    paddingX: parseInt(element.getAttribute('data-padding-x') || '0'),
    paddingY: parseInt(element.getAttribute('data-padding-y') || '0'),
    locked: element.getAttribute('data-locked') === 'true',
  };

  switch (blockType) {
    case BLOCK_TYPES.HEADING:
      return {
        ...baseProps,
        type: BLOCK_TYPES.HEADING,
        content: element.textContent || '',
        htmlContent: element.innerHTML,
        level: (element.getAttribute('data-level') || 'h2') as 'h1' | 'h2' | 'h3' | 'h4',
        fontSize: parseInt(element.getAttribute('data-font-size') || '24'),
        fontWeight: parseInt(element.getAttribute('data-font-weight') || '600'),
        textAlign: element.getAttribute('data-align') || 'left',
        lineHeight: parseFloat(element.getAttribute('data-line-height') || '1.3'),
        color: element.getAttribute('data-color') || '',
      } as EditorBlock;

    case BLOCK_TYPES.PARAGRAPH:
      return {
        ...baseProps,
        type: BLOCK_TYPES.PARAGRAPH,
        content: element.textContent || '',
        htmlContent: element.innerHTML,
        fontSize: parseInt(element.getAttribute('data-font-size') || '14'),
        fontWeight: parseInt(element.getAttribute('data-font-weight') || '400'),
        textAlign: element.getAttribute('data-align') || 'left',
        lineHeight: parseFloat(element.getAttribute('data-line-height') || '1.6'),
        color: element.getAttribute('data-color') || '',
      } as EditorBlock;

    case BLOCK_TYPES.HYPERLINK:
      return {
        ...baseProps,
        type: BLOCK_TYPES.HYPERLINK,
        text: element.getAttribute('data-text') || 'Click here',
        url: element.getAttribute('data-url') || '#',
        openInNewTab: element.getAttribute('data-open-new-tab') === 'true',
        underline: element.getAttribute('data-underline') === 'true',
        fontSize: parseInt(element.getAttribute('data-font-size') || '14'),
        fontWeight: parseInt(element.getAttribute('data-font-weight') || '400'),
        textAlign: element.getAttribute('data-align') || 'left',
        lineHeight: parseFloat(element.getAttribute('data-line-height') || '1.6'),
        color: element.getAttribute('data-color') || '#0066cc',
      } as EditorBlock;

    case BLOCK_TYPES.DIVIDER:
      return {
        ...baseProps,
        type: BLOCK_TYPES.DIVIDER,
        thickness: parseInt(element.getAttribute('data-thickness') || '1'),
        style: element.getAttribute('data-style') || 'solid',
        color: element.getAttribute('data-color') || '#e2e8f0',
      } as EditorBlock;

    case BLOCK_TYPES.IMAGE:
      return {
        ...baseProps,
        type: BLOCK_TYPES.IMAGE,
        src: element.getAttribute('data-src') || '',
        alt: element.getAttribute('data-alt') || '',
        alignment: element.getAttribute('data-alignment') || 'center',
        borderRadius: parseInt(element.getAttribute('data-border-radius') || '0'),
        maxHeight: parseInt(element.getAttribute('data-max-height') || '300'),
      } as EditorBlock;

    case BLOCK_TYPES.TEXT_INPUT:
      return {
        ...baseProps,
        type: BLOCK_TYPES.TEXT_INPUT,
        label: element.getAttribute('data-label') || 'Field',
        fieldName: element.getAttribute('data-field-name') || `text_${Date.now()}`,
        placeholder: element.getAttribute('data-placeholder') || '',
        required: element.getAttribute('data-required') === 'true',
        validationType: element.getAttribute('data-validation') || 'none',
        maxLength: element.getAttribute('data-max-length') || '',
        helpText: '',
      } as EditorBlock;

    case BLOCK_TYPES.TEXTAREA:
      return {
        ...baseProps,
        type: BLOCK_TYPES.TEXTAREA,
        label: element.getAttribute('data-label') || 'Text Area',
        fieldName: element.getAttribute('data-field-name') || `textarea_${Date.now()}`,
        placeholder: element.getAttribute('data-placeholder') || '',
        required: element.getAttribute('data-required') === 'true',
        rows: parseInt(element.getAttribute('data-rows') || '4'),
        maxLength: element.getAttribute('data-max-length') || '',
        helpText: '',
      } as EditorBlock;

    case BLOCK_TYPES.DROPDOWN: {
      const optionsStr = element.getAttribute('data-options');
      let options: string[] = ['Option 1', 'Option 2'];
      try { if (optionsStr) options = JSON.parse(optionsStr); } catch { /* keep default */ }
      return {
        ...baseProps,
        type: BLOCK_TYPES.DROPDOWN,
        label: element.getAttribute('data-label') || 'Dropdown',
        fieldName: element.getAttribute('data-field-name') || `dropdown_${Date.now()}`,
        required: element.getAttribute('data-required') === 'true',
        options,
        defaultValue: element.getAttribute('data-default-value') || '',
        helpText: '',
      } as EditorBlock;
    }

    case BLOCK_TYPES.RADIO_GROUP: {
      const radioOptionsStr = element.getAttribute('data-options');
      let radioOptions: string[] = ['Option A', 'Option B'];
      try { if (radioOptionsStr) radioOptions = JSON.parse(radioOptionsStr); } catch { /* keep default */ }
      return {
        ...baseProps,
        type: BLOCK_TYPES.RADIO_GROUP,
        label: element.getAttribute('data-label') || 'Radio Group',
        fieldName: element.getAttribute('data-field-name') || `radio_${Date.now()}`,
        required: element.getAttribute('data-required') === 'true',
        options: radioOptions,
        layout: element.getAttribute('data-layout') as 'vertical' | 'horizontal' || 'vertical',
        helpText: '',
      } as EditorBlock;
    }

    case BLOCK_TYPES.CHECKBOX_GROUP: {
      const checkboxOptionsStr = element.getAttribute('data-options');
      let checkboxOptions: string[] = ['Choice 1', 'Choice 2'];
      try { if (checkboxOptionsStr) checkboxOptions = JSON.parse(checkboxOptionsStr); } catch { /* keep default */ }
      return {
        ...baseProps,
        type: BLOCK_TYPES.CHECKBOX_GROUP,
        label: element.getAttribute('data-label') || 'Checkbox Group',
        fieldName: element.getAttribute('data-field-name') || `checkbox_group_${Date.now()}`,
        required: element.getAttribute('data-required') === 'true',
        options: checkboxOptions,
        layout: element.getAttribute('data-layout') as 'vertical' | 'horizontal' || 'vertical',
        helpText: '',
      } as EditorBlock;
    }

    case BLOCK_TYPES.SINGLE_CHECKBOX:
      return {
        ...baseProps,
        type: BLOCK_TYPES.SINGLE_CHECKBOX,
        label: element.getAttribute('data-label') || 'Checkbox',
        fieldName: element.getAttribute('data-field-name') || `agreement_${Date.now()}`,
        required: element.getAttribute('data-required') === 'true',
      } as EditorBlock;

    case BLOCK_TYPES.DATE_PICKER:
      return {
        ...baseProps,
        type: BLOCK_TYPES.DATE_PICKER,
        label: element.getAttribute('data-label') || 'Date',
        fieldName: element.getAttribute('data-field-name') || `date_${Date.now()}`,
        required: element.getAttribute('data-required') === 'true',
        helpText: '',
      } as EditorBlock;

    case BLOCK_TYPES.SIGNATURE:
      return {
        ...baseProps,
        type: BLOCK_TYPES.SIGNATURE,
        label: element.getAttribute('data-label') || 'Signature',
        fieldName: element.getAttribute('data-field-name') || `signature_${Date.now()}`,
        required: element.getAttribute('data-required') === 'true',
        signatureUrl: element.getAttribute('data-signature-url') || '',
        helpText: 'Click to insert signature',
      } as EditorBlock;

    case BLOCK_TYPES.TABLE: {
      const rowsStr = element.getAttribute('data-rows');
      let tableRows: string[][] = [['Cell 1', 'Cell 2', 'Cell 3']];
      try { if (rowsStr) tableRows = JSON.parse(rowsStr); } catch { /* keep default */ }
      const colWidthsStr = element.getAttribute('data-column-widths');
      const rowHeightsStr = element.getAttribute('data-row-heights');
      let parsedRowHeights: number[] | undefined;
      try { if (rowHeightsStr) parsedRowHeights = JSON.parse(rowHeightsStr) as number[]; } catch { /* keep default */ }
      const hasAnyRowHeight = parsedRowHeights?.some((h: number) => h > 0);
      let parsedColWidths: number[] | undefined;
      try { if (colWidthsStr) parsedColWidths = JSON.parse(colWidthsStr) as number[]; } catch { /* keep default */ }
      return {
        ...baseProps,
        type: BLOCK_TYPES.TABLE,
        htmlContent: element.outerHTML,
        rows: tableRows,
        headerRow: element.getAttribute('data-header-row') === 'true',
        columnWidths: parsedColWidths,
        rowHeights: hasAnyRowHeight ? parsedRowHeights : undefined,
      } as EditorBlock;
    }

    case BLOCK_TYPES.LIST: {
      const itemsStr = element.getAttribute('data-items');
      let items: string[] = ['Item 1', 'Item 2'];
      try { if (itemsStr) items = JSON.parse(itemsStr); } catch { /* keep default */ }
      return {
        ...baseProps,
        type: BLOCK_TYPES.LIST,
        listType: element.getAttribute('data-list-type') as 'ordered' | 'unordered' || 'unordered',
        htmlContent: element.outerHTML,
        items,
      } as EditorBlock;
    }

    case BLOCK_TYPES.BUTTON:
      return {
        ...baseProps,
        type: BLOCK_TYPES.BUTTON,
        label: element.getAttribute('data-label') || 'Button',
        buttonType: element.getAttribute('data-button-type') as 'button' | 'submit' | 'reset' || 'button',
        variant: element.getAttribute('data-variant') as 'primary' | 'secondary' | 'outline' || 'primary',
      } as EditorBlock;

    case BLOCK_TYPES.RAW_HTML:
      return {
        ...baseProps,
        type: BLOCK_TYPES.RAW_HTML,
        htmlContent: element.innerHTML,
        originalStyles: _context.originalStyles,
      } as EditorBlock;

    default: {
      const parsed = parseNode(element, _context);
      return parsed[0] || null;
    }
  }
}

// ─── Utility Functions ───────────────────────────────────────────────

function parseMargin(margin?: string): number {
  if (!margin) return 0;
  const match = margin.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export type { EditorBlock as ParsedBlock };

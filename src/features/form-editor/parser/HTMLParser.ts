// HTML Parser - TWO-LAYER parsing: Structure → Blocks
// Detects import mode: internal (editor-generated) vs external (adaptive parsing)
// CRITICAL: External HTML must preserve typography and be fully editable

import { sanitizeHTML } from './Sanitizer';
import { v4 as uuidv4 } from 'uuid';
import type { EditorBlock, EditorSection } from '../editorConfig';
import { BLOCK_TYPES } from '../editorConfig';

// Editor version marker - critical for roundtrip fidelity
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

/**
 * Parse HTML and convert to editor structure
 * External HTML: Preserve as much structure as possible
 * Internal HTML: Restore exact layout from metadata
 */
export function parseHTML(html: string): ParsedDocument {
  const sanitized = sanitizeHTML(html);
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');
  
  // Detect import mode - check for editor sections instead of version attribute
  // (version attribute is on <html> tag which gets stripped by sanitizer)
  const hasSections = doc.querySelector(`[${EDITOR_SECTION_ATTR}]`) !== null;
  const isEditorGenerated = hasSections;
  
  // Try to get version from html tag if available
  const htmlElement = doc.documentElement;
  const version = htmlElement?.getAttribute(EDITOR_VERSION_ATTR) || (isEditorGenerated ? '1' : null);
  
  // Extract ALL style content for preservation (CRITICAL for external HTML)
  const styleContent = extractAllStyles(doc);
  
  // Build metadata
  const metadata = {
    hasStyles: styleContent.length > 0 || hasInlineStyles(doc),
    hasTables: doc.querySelector('table') !== null,
    hasLists: doc.querySelector('ul, ol') !== null,
    hasForms: doc.querySelector('input, select, textarea, button') !== null,
    hasSignatures: hasSignatureElements(doc),
    styleContent,
  };
  
  // Create parse context
  const context: BlockParseContext = {
    originalStyles: styleContent,
    parentStyles: null,
    isEditorGenerated,
  };
  
  let sections: EditorSection[];
  
  if (isEditorGenerated) {
    // Internal HTML: Restore exact layout from metadata
    sections = parseEditorGeneratedHTML(doc, context);
  } else {
    // External HTML: Smart parsing that preserves structure
    sections = parseExternalHTML(doc, context);
  }
  
  return {
    sections,
    rawHTML: sanitized,
    isEditorGenerated,
    version,
    metadata,
  };
}

/**
 * Extract ALL style content from document - both <style> tags and inline
 */
function extractAllStyles(doc: Document): string {
  const styles: string[] = [];
  
  // Get <style> tag contents
  doc.querySelectorAll('style').forEach(style => {
    if (style.textContent) {
      styles.push(style.textContent);
    }
  });
  
  return styles.join('\n');
}

/**
 * Check if document has inline styles
 */
function hasInlineStyles(doc: Document): boolean {
  return doc.querySelector('[style]') !== null;
}

/**
 * Check for signature elements (SIGN buttons, signature areas)
 */
function hasSignatureElements(doc: Document): boolean {
  // Look for SIGN buttons
  const signButtons = doc.querySelectorAll('button[type="button"]');
  for (const btn of signButtons) {
    if (btn.textContent?.trim().toUpperCase() === 'SIGN') {
      return true;
    }
  }
  // Look for signature classes
  return doc.querySelector('.signdiv, .signature, [data-signature]') !== null;
}

/**
 * Parse editor-generated HTML - restore exact layout
 */
function parseEditorGeneratedHTML(doc: Document, context: BlockParseContext): EditorSection[] {
  const sections: EditorSection[] = [];
  
  // Find sections with editor metadata - they might be inside a form element
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
    
    // Use :scope > to get only direct children column containers
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

/**
 * Parse external HTML - Create INDIVIDUAL EDITABLE blocks
 * Detects CSS Grid layouts and converts to multi-column sections
 */
function parseExternalHTML(doc: Document, context: BlockParseContext): EditorSection[] {
  const body = doc.body;
  const sections: EditorSection[] = [];
  let currentBlocks: EditorBlock[] = [];
  
  // Parse ALL children, detecting grid layouts
  for (let i = 0; i < body.childNodes.length; i++) {
    const node = body.childNodes[i];
    
    // Check if this is a grid layout container
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const style = element.style;
      
      // Detect CSS Grid with 2 or 3 columns
      if (style.display === 'grid' && style.gridTemplateColumns) {
        // Save any accumulated blocks as a section first
        if (currentBlocks.length > 0) {
          sections.push({
            id: uuidv4(),
            columns: 1,
            blocks: [currentBlocks],
          });
          currentBlocks = [];
        }
        
        // Parse grid as multi-column section
        const gridSection = parseGridLayoutAsSection(element, context);
        if (gridSection) {
          sections.push(gridSection);
        }
        continue;
      }
    }
    
    // Regular block parsing
    const parsedBlocks = parseNode(node, context);
    currentBlocks.push(...parsedBlocks);
  }
  
  // Add remaining blocks as final section
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
      sections.push({
        id: uuidv4(),
        columns: 1,
        blocks: [validBlocks],
      });
    }
  }
  
  return sections.length > 0 ? sections : [{
    id: uuidv4(),
    columns: 1,
    blocks: [[]],
  }];
}

/**
 * Parse blocks within a column container
 */
function parseColumnBlocks(container: HTMLElement, context: BlockParseContext): EditorBlock[] {
  const blocks: EditorBlock[] = [];
  
  // Handle empty columns - return empty array
  if (container.children.length === 0) {
    return blocks;
  }
  
  for (let i = 0; i < container.children.length; i++) {
    const element = container.children[i] as HTMLElement;
    const blockType = element.getAttribute('data-block-type'); // Use literal string to match export
    
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

/**
 * Parse a single DOM node into editor blocks
 */
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
  
  // Skip empty non-void elements
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
      return []; // Skip - already extracted
    
    case 'span':
    case 'strong':
    case 'em':
    case 'b':
    case 'i':
    case 'u':
    case 'a':
      // Inline elements at block level - wrap in paragraph
      return [parseParagraphElement(element, context)];
    
    case 'br':
      return [];
    
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

/**
 * Parse container element (div)
 */
function parseContainerElement(element: HTMLElement, context: BlockParseContext): EditorBlock[] {
  // Check for signature area - ONLY match .signdiv class exactly
  if (element.classList.contains('signdiv')) {
    return [parseSignatureElement(element)];
  }
  
  // Check for CSS Grid layout (external HTML with grid-template-columns)
  const style = element.style;
  if (style.display === 'grid' && style.gridTemplateColumns) {
    return parseGridLayoutAsBlocks(element, context);
  }
  
  // Check for form field wrapper
  const label = element.querySelector(':scope > label');
  const input = element.querySelector(':scope > input, :scope > textarea, :scope > select');
  
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
  
  // Parse children as blocks
  return parseContainerChildren(element, context);
}

/**
 * Parse container children as blocks
 */
function parseContainerChildren(element: HTMLElement, context: BlockParseContext): EditorBlock[] {
  const blocks: EditorBlock[] = [];
  
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];
    const parsed = parseNode(child, context);
    blocks.push(...parsed);
  }
  
  return blocks;
}

/**
 * Parse CSS Grid layout as individual blocks (for external HTML)
 * Converts grid items to separate form field blocks
 */
function parseGridLayoutAsBlocks(element: HTMLElement, context: BlockParseContext): EditorBlock[] {
  const blocks: EditorBlock[] = [];
  
  // Parse each direct child as a potential form field
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;
    
    // Check if it's a form field wrapper (has label + input)
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
      // Parse as regular block
      const parsed = parseNode(child, context);
      blocks.push(...parsed);
    }
  }
  
  return blocks;
}

/**
 * Parse CSS Grid layout as a multi-column section
 * Detects column count from grid-template-columns and distributes blocks
 */
function parseGridLayoutAsSection(element: HTMLElement, context: BlockParseContext): EditorSection | null {
  const style = element.style;
  const gridColumns = style.gridTemplateColumns;
  
  // Detect column count from grid-template-columns
  // Examples: "1fr 1fr" = 2 cols, "1fr 1fr 1fr" = 3 cols
  let columnCount = 1;
  if (gridColumns) {
    const frUnits = gridColumns.match(/1fr/g);
    if (frUnits) {
      columnCount = Math.min(frUnits.length, 3); // Max 3 columns
    }
  }
  
  if (columnCount === 1) {
    // Not a multi-column grid, parse as regular blocks
    return null;
  }
  
  // Parse all children as blocks
  const allBlocks: EditorBlock[] = [];
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i] as HTMLElement;
    
    // Check if it's a form field wrapper
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
  
  // Distribute blocks across columns (round-robin)
  const columns = columnCount as 1 | 2 | 3;
  const columnBlocks: EditorBlock[][] = Array(columns).fill(null).map(() => []);
  
  allBlocks.forEach((block, idx) => {
    const colIdx = idx % columns;
    columnBlocks[colIdx].push(block);
  });
  
  return {
    id: uuidv4(),
    columns,
    blocks: columnBlocks,
  };
}

// ─── Block Parsing Functions ─────────────────────────────────────────

function parseHeadingElement(element: HTMLElement, tagName: string): EditorBlock {
  const level = tagName as 'h1' | 'h2' | 'h3' | 'h4';
  const style = element.style;
  
  // Preserve original font size from inline style or compute from tag
  let fontSize = 15; // Default for external HTML
  if (style.fontSize) {
    const match = style.fontSize.match(/(\d+)/);
    if (match) fontSize = parseInt(match[1]);
  } else {
    // FinTech default sizes
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
  
  // Use original font size or FinTech default (11px)
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

function createParagraphBlock(
  content: string,
  htmlContent: string,
  context: BlockParseContext,
  styles?: Partial<{ fontSize: number; fontWeight: number; textAlign: string; lineHeight: number; color: string }>
): EditorBlock {
  return {
    id: uuidv4(),
    type: BLOCK_TYPES.PARAGRAPH,
    content: content.trim(),
    htmlContent: htmlContent,
    fontSize: styles?.fontSize || 11, // FinTech default
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

function parseTableElement(element: HTMLElement, context: BlockParseContext): EditorBlock {
  const rows: string[][] = [];
  let hasHeaderRow = false;
  
  // Check for thead
  const thead = element.querySelector('thead');
  if (thead) {
    hasHeaderRow = true;
    thead.querySelectorAll('tr').forEach(tr => {
      const cells: string[] = [];
      tr.querySelectorAll('th, td').forEach(cell => {
        cells.push(cell.textContent || '');
      });
      if (cells.length > 0) rows.push(cells);
    });
  }
  
  // Parse tbody or direct rows
  const tbody = element.querySelector('tbody') || element;
  tbody.querySelectorAll(':scope > tr').forEach((tr, rowIdx) => {
    if (thead && tr.closest('thead')) return;
    
    const cells: string[] = [];
    const cellElements = tr.querySelectorAll('th, td');
    
    if (rowIdx === 0 && !hasHeaderRow) {
      const hasThCells = tr.querySelector('th') !== null;
      if (hasThCells) hasHeaderRow = true;
    }
    
    cellElements.forEach(cell => {
      cells.push(cell.textContent || '');
    });
    
    if (cells.length > 0) rows.push(cells);
  });
  
  if (rows.length === 0) {
    rows.push(['Cell 1', 'Cell 2', 'Cell 3']);
  }
  
  return {
    id: uuidv4(),
    type: BLOCK_TYPES.TABLE,
    htmlContent: element.outerHTML,
    rows,
    headerRow: hasHeaderRow,
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
      return [{
        id: uuidv4(),
        type: BLOCK_TYPES.FILE_UPLOAD,
        label: baseLabel,
        required: isRequired,
        fieldName: element.name || element.id || `file_${Date.now()}`,
        helpText: '',
        acceptTypes: element.accept || '',
        maxSize: '10MB',
        multiple: element.multiple,
        width: 100,
        marginTop: 0,
        marginBottom: 8,
        paddingX: 0,
        paddingY: 0,
        locked: false,
      } as EditorBlock];
    
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
  
  // Check if this is a SIGN button (via attribute or text)
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
  const label = element.querySelector('label')?.textContent?.replace(/\s*\*\s*$/, '').trim() || 'Signature';
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

/**
 * Restore a typed block from editor metadata with 100% fidelity
 */
function restoreTypedBlock(element: HTMLElement, blockType: string, context: BlockParseContext): EditorBlock | null {
  // Extract common properties from data attributes
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
    
    case BLOCK_TYPES.DROPDOWN:
      const optionsStr = element.getAttribute('data-options');
      const options = optionsStr ? JSON.parse(optionsStr) : ['Option 1', 'Option 2'];
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
    
    case BLOCK_TYPES.RADIO_GROUP:
      const radioOptionsStr = element.getAttribute('data-options');
      const radioOptions = radioOptionsStr ? JSON.parse(radioOptionsStr) : ['Option A', 'Option B'];
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
    
    case BLOCK_TYPES.CHECKBOX_GROUP:
      const checkboxOptionsStr = element.getAttribute('data-options');
      const checkboxOptions = checkboxOptionsStr ? JSON.parse(checkboxOptionsStr) : ['Choice 1', 'Choice 2'];
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
    
    case BLOCK_TYPES.FILE_UPLOAD:
      return {
        ...baseProps,
        type: BLOCK_TYPES.FILE_UPLOAD,
        label: element.getAttribute('data-label') || 'File Upload',
        fieldName: element.getAttribute('data-field-name') || `file_${Date.now()}`,
        required: element.getAttribute('data-required') === 'true',
        acceptTypes: element.getAttribute('data-accept-types') || '',
        maxSize: element.getAttribute('data-max-size') || '10MB',
        multiple: element.getAttribute('data-multiple') === 'true',
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
    
    case BLOCK_TYPES.TABLE:
      const rowsStr = element.getAttribute('data-rows');
      const rows = rowsStr ? JSON.parse(rowsStr) : [['Cell 1', 'Cell 2', 'Cell 3']];
      return {
        ...baseProps,
        type: BLOCK_TYPES.TABLE,
        htmlContent: element.outerHTML,
        rows,
        headerRow: element.getAttribute('data-header-row') === 'true',
      } as EditorBlock;
    
    case BLOCK_TYPES.LIST:
      const itemsStr = element.getAttribute('data-items');
      const items = itemsStr ? JSON.parse(itemsStr) : ['Item 1', 'Item 2'];
      return {
        ...baseProps,
        type: BLOCK_TYPES.LIST,
        listType: element.getAttribute('data-list-type') as 'ordered' | 'unordered' || 'unordered',
        htmlContent: element.outerHTML,
        items,
      } as EditorBlock;
    
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
        originalStyles: context.originalStyles,
      } as EditorBlock;
    
    default:
      const parsed = parseNode(element, context);
      return parsed[0] || null;
  }
}

// ─── Utility Functions ───────────────────────────────────────────────

function parseMargin(margin?: string): number {
  if (!margin) return 0;
  const match = margin.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Legacy export for compatibility
export type { EditorBlock as ParsedBlock };

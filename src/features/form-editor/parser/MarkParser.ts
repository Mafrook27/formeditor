// Mark Parser - TWO-LAYER parsing: Inline styles → Marks
// Handles bold, italic, underline, links, colors, and placeholders
// Uses style inheritance from parent nodes

export interface TextMark {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'link' | 'textColor' | 'backgroundColor' | 'fontSize' | 'fontFamily' | 'placeholder';
  value?: string;
}

export interface TextSegment {
  text: string;
  marks: TextMark[];
}

export interface InheritedStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
}

/**
 * Parse HTML content and extract text segments with marks
 * Implements style inheritance from parent nodes
 */
export function parseInlineMarks(htmlContent: string, inheritedStyles?: InheritedStyles): TextSegment[] {
  if (!htmlContent) return [{ text: '', marks: [] }];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
  const container = doc.body.firstElementChild;
  
  if (!container) return [{ text: htmlContent, marks: [] }];
  
  const segments: TextSegment[] = [];
  const initialMarks = inheritedStylesToMarks(inheritedStyles);
  
  processNode(container, initialMarks, segments);
  
  // Merge adjacent segments with identical marks
  return mergeSegments(segments);
}

/**
 * Convert inherited styles to marks
 */
function inheritedStylesToMarks(styles?: InheritedStyles): TextMark[] {
  if (!styles) return [];
  const marks: TextMark[] = [];
  
  if (styles.bold || (styles.fontWeight && parseInt(styles.fontWeight) >= 600)) {
    marks.push({ type: 'bold' });
  }
  if (styles.italic) marks.push({ type: 'italic' });
  if (styles.underline) marks.push({ type: 'underline' });
  if (styles.strikethrough) marks.push({ type: 'strikethrough' });
  if (styles.color) marks.push({ type: 'textColor', value: styles.color });
  if (styles.backgroundColor) marks.push({ type: 'backgroundColor', value: styles.backgroundColor });
  if (styles.fontSize) marks.push({ type: 'fontSize', value: styles.fontSize });
  if (styles.fontFamily) marks.push({ type: 'fontFamily', value: styles.fontFamily });
  
  return marks;
}

/**
 * Recursively process DOM nodes and extract text with marks
 * Implements style inheritance
 */
function processNode(node: Node, inheritedMarks: TextMark[], segments: TextSegment[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (text) {
      // Parse placeholders in text
      processTextWithPlaceholders(text, inheritedMarks, segments);
    }
    return;
  }
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    // Skip if element is empty and not a meaningful tag
    if (!element.innerHTML && !['br', 'hr'].includes(tagName)) {
      return;
    }
    
    // Build current marks from inherited + element-specific
    const currentMarks = [...inheritedMarks];
    
    // Add marks based on element type
    addElementMarks(element, tagName, currentMarks);
    
    // Add marks from inline styles
    addStyleMarks(element, currentMarks);
    
    // Process children with accumulated marks
    for (let i = 0; i < node.childNodes.length; i++) {
      processNode(node.childNodes[i], currentMarks, segments);
    }
  }
}

/**
 * Add marks based on HTML element type
 */
function addElementMarks(element: HTMLElement, tagName: string, marks: TextMark[]): void {
  switch (tagName) {
    case 'strong':
    case 'b':
      if (!marks.some(m => m.type === 'bold')) {
        marks.push({ type: 'bold' });
      }
      break;
    case 'em':
    case 'i':
      if (!marks.some(m => m.type === 'italic')) {
        marks.push({ type: 'italic' });
      }
      break;
    case 'u':
    case 'ins':
      if (!marks.some(m => m.type === 'underline')) {
        marks.push({ type: 'underline' });
      }
      break;
    case 's':
    case 'strike':
    case 'del':
      if (!marks.some(m => m.type === 'strikethrough')) {
        marks.push({ type: 'strikethrough' });
      }
      break;
    case 'a':
      if (!marks.some(m => m.type === 'link')) {
        marks.push({ type: 'link', value: element.getAttribute('href') || '' });
      }
      break;
  }
}

/**
 * Add marks from inline styles
 */
function addStyleMarks(element: HTMLElement, marks: TextMark[]): void {
  const style = element.style;
  
  // Font weight
  if (style.fontWeight) {
    const weight = parseInt(style.fontWeight);
    if (weight >= 600 || style.fontWeight === 'bold' || style.fontWeight === 'bolder') {
      if (!marks.some(m => m.type === 'bold')) {
        marks.push({ type: 'bold' });
      }
    }
  }
  
  // Font style
  if (style.fontStyle === 'italic' || style.fontStyle === 'oblique') {
    if (!marks.some(m => m.type === 'italic')) {
      marks.push({ type: 'italic' });
    }
  }
  
  // Text decoration
  if (style.textDecoration?.includes('underline') || style.textDecorationLine?.includes('underline')) {
    if (!marks.some(m => m.type === 'underline')) {
      marks.push({ type: 'underline' });
    }
  }
  if (style.textDecoration?.includes('line-through') || style.textDecorationLine?.includes('line-through')) {
    if (!marks.some(m => m.type === 'strikethrough')) {
      marks.push({ type: 'strikethrough' });
    }
  }
  
  // Color
  if (style.color) {
    // Remove existing color mark and add new one
    const colorIdx = marks.findIndex(m => m.type === 'textColor');
    if (colorIdx >= 0) marks.splice(colorIdx, 1);
    marks.push({ type: 'textColor', value: style.color });
  }
  
  // Background color
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    const bgIdx = marks.findIndex(m => m.type === 'backgroundColor');
    if (bgIdx >= 0) marks.splice(bgIdx, 1);
    marks.push({ type: 'backgroundColor', value: style.backgroundColor });
  }
  
  // Font size
  if (style.fontSize) {
    const fsIdx = marks.findIndex(m => m.type === 'fontSize');
    if (fsIdx >= 0) marks.splice(fsIdx, 1);
    marks.push({ type: 'fontSize', value: style.fontSize });
  }
  
  // Font family
  if (style.fontFamily) {
    const ffIdx = marks.findIndex(m => m.type === 'fontFamily');
    if (ffIdx >= 0) marks.splice(ffIdx, 1);
    marks.push({ type: 'fontFamily', value: style.fontFamily });
  }
}

/**
 * Process text and detect placeholders (@Name and PH@Name formats)
 */
function processTextWithPlaceholders(text: string, marks: TextMark[], segments: TextSegment[]): void {
  // Match both @Name and PH@Name formats
  const placeholderRegex = /((?:PH)?@[\w]+)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = placeholderRegex.exec(text)) !== null) {
    // Text before placeholder
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        segments.push({ text: beforeText, marks: [...marks] });
      }
    }
    
    // Placeholder itself
    segments.push({
      text: match[0],
      marks: [...marks, { type: 'placeholder', value: match[0] }]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Remaining text after last placeholder
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      segments.push({ text: remainingText, marks: [...marks] });
    }
  }
  
  // No placeholders found - add entire text
  if (lastIndex === 0 && text) {
    segments.push({ text, marks: [...marks] });
  }
}

/**
 * Merge adjacent segments with identical marks
 */
function mergeSegments(segments: TextSegment[]): TextSegment[] {
  if (segments.length <= 1) return segments;
  
  const merged: TextSegment[] = [];
  
  for (const segment of segments) {
    if (merged.length === 0) {
      merged.push(segment);
      continue;
    }
    
    const last = merged[merged.length - 1];
    if (marksEqual(last.marks, segment.marks)) {
      last.text += segment.text;
    } else {
      merged.push(segment);
    }
  }
  
  return merged.filter(s => s.text); // Remove empty segments
}

/**
 * Check if two mark arrays are equivalent
 */
function marksEqual(a: TextMark[], b: TextMark[]): boolean {
  if (a.length !== b.length) return false;
  
  const sortedA = [...a].sort((x, y) => x.type.localeCompare(y.type));
  const sortedB = [...b].sort((x, y) => x.type.localeCompare(y.type));
  
  return sortedA.every((mark, i) => 
    mark.type === sortedB[i].type && mark.value === sortedB[i].value
  );
}

/**
 * Convert text segments back to HTML
 */
export function serializeMarksToHTML(segments: TextSegment[]): string {
  if (!segments.length) return '';
  
  let html = '';
  
  for (const segment of segments) {
    let text = escapeHTML(segment.text);
    
    // Apply marks in specific order (innermost first)
    // Order: fontSize, fontFamily, color, bg -> formatting -> link -> placeholder
    
    const sortedMarks = [...segment.marks].sort((a, b) => {
      const order = ['fontSize', 'fontFamily', 'textColor', 'backgroundColor', 'bold', 'italic', 'underline', 'strikethrough', 'link', 'placeholder'];
      return order.indexOf(a.type) - order.indexOf(b.type);
    });
    
    for (const mark of sortedMarks) {
      switch (mark.type) {
        case 'bold':
          text = `<strong>${text}</strong>`;
          break;
        case 'italic':
          text = `<em>${text}</em>`;
          break;
        case 'underline':
          text = `<u>${text}</u>`;
          break;
        case 'strikethrough':
          text = `<s>${text}</s>`;
          break;
        case 'link':
          text = `<a href="${escapeAttribute(mark.value || '#')}">${text}</a>`;
          break;
        case 'textColor':
          text = `<span style="color: ${escapeAttribute(mark.value || '')}">${text}</span>`;
          break;
        case 'backgroundColor':
          text = `<span style="background-color: ${escapeAttribute(mark.value || '')}">${text}</span>`;
          break;
        case 'fontSize':
          text = `<span style="font-size: ${escapeAttribute(mark.value || '')}">${text}</span>`;
          break;
        case 'fontFamily':
          text = `<span style="font-family: ${escapeAttribute(mark.value || '')}">${text}</span>`;
          break;
        case 'placeholder':
          text = `<span class="placeholder" data-placeholder="${escapeAttribute(mark.value || '')}">${text}</span>`;
          break;
      }
    }
    
    html += text;
  }
  
  return html;
}

/**
 * Check if text contains placeholders
 * Supports both @Name and PH@Name formats
 */
export function containsPlaceholders(text: string): boolean {
  return /(PH@[\w]+|@[\w]+)/.test(text);
}

/**
 * Extract all placeholders from text
 */
export function extractPlaceholders(text: string): string[] {
  const matches = text.match(/(?:PH)?@[\w]+/g);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Replace placeholder with value
 */
export function replacePlaceholder(text: string, placeholder: string, value: string): string {
  return text.replace(new RegExp(escapeRegex(placeholder), 'g'), value);
}

// Helper functions
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract styles from element for inheritance
 */
export function extractInheritedStyles(element: HTMLElement): InheritedStyles {
  const computed = window.getComputedStyle(element);
  const inline = element.style;
  
  return {
    bold: inline.fontWeight ? parseInt(inline.fontWeight) >= 600 : computed.fontWeight ? parseInt(computed.fontWeight) >= 600 : false,
    italic: inline.fontStyle === 'italic' || computed.fontStyle === 'italic',
    underline: inline.textDecoration?.includes('underline') || computed.textDecoration?.includes('underline'),
    strikethrough: inline.textDecoration?.includes('line-through') || computed.textDecoration?.includes('line-through'),
    color: inline.color || undefined,
    backgroundColor: inline.backgroundColor && inline.backgroundColor !== 'transparent' ? inline.backgroundColor : undefined,
    fontSize: inline.fontSize || undefined,
    fontFamily: inline.fontFamily || undefined,
    fontWeight: inline.fontWeight || undefined,
  };
}

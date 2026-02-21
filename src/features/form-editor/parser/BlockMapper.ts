// Block Mapper - Maps parsed blocks to editor structure
// Re-exports types for compatibility

import { v4 as uuidv4 } from "uuid";
import type { EditorBlock, EditorSection } from "../editorConfig";
import { BLOCK_TYPES } from "../editorConfig";

// Re-export from MarkParser for compatibility
export type { TextMark, TextSegment } from "./MarkParser";

// Type alias for backward compatibility
export type ParsedBlock = EditorBlock;

/**
 * Create a raw HTML block that preserves original content
 */
export function createRawHTMLBlock(
  html: string,
  styles: string = "",
): EditorBlock {
  return {
    id: uuidv4(),
    type: BLOCK_TYPES.RAW_HTML,
    htmlContent: html,
    originalStyles: styles,
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

/**
 * Create a paragraph block from text
 */
export function createParagraphBlock(
  content: string,
  htmlContent: string = "",
): EditorBlock {
  return {
    id: uuidv4(),
    type: BLOCK_TYPES.PARAGRAPH,
    content,
    htmlContent: htmlContent || content,
    fontSize: 14,
    fontWeight: 400,
    textAlign: "left",
    lineHeight: 1.6,
    color: "",
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

/**
 * Create a heading block
 */
export function createHeadingBlock(
  content: string,
  level: "h1" | "h2" | "h3" | "h4" = "h2",
  htmlContent: string = "",
): EditorBlock {
  const fontSizes = { h1: 32, h2: 24, h3: 20, h4: 18 };

  return {
    id: uuidv4(),
    type: BLOCK_TYPES.HEADING,
    content,
    htmlContent: htmlContent || content,
    level,
    fontSize: fontSizes[level],
    fontWeight: level === "h1" ? 700 : 600,
    textAlign: "left",
    lineHeight: 1.3,
    color: "",
    width: 100,
    marginTop: 0,
    marginBottom: 12,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

/**
 * Create a table block from rows
 */
export function createTableBlock(
  rows: string[][],
  headerRow: boolean = true,
): EditorBlock {
  return {
    id: uuidv4(),
    type: BLOCK_TYPES.TABLE,
    htmlContent: "",
    rows,
    headerRow,
    width: 100,
    marginTop: 8,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

/**
 * Create a list block from items
 */
export function createListBlock(
  items: string[],
  ordered: boolean = false,
): EditorBlock {
  return {
    id: uuidv4(),
    type: BLOCK_TYPES.LIST,
    listType: ordered ? "ordered" : "unordered",
    htmlContent: "",
    items,
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  } as EditorBlock;
}

/**
 * Map parsed blocks to editor blocks (legacy compatibility)
 */
export function mapParsedBlocksToEditor(blocks: EditorBlock[]): EditorBlock[] {
  return blocks;
}

/**
 * Create a section with blocks
 */
export function createSectionWithBlocks(
  blocks: EditorBlock[],
  columns: 1 | 2 | 3 = 1,
): EditorSection {
  const sectionBlocks: EditorBlock[][] = Array(columns)
    .fill(null)
    .map(() => []);

  // Distribute blocks to first column by default
  sectionBlocks[0] = blocks;

  return {
    id: uuidv4(),
    columns,
    blocks: sectionBlocks,
  };
}

// Parser module exports

export {
  parseHTML,
  EDITOR_VERSION,
  EDITOR_VERSION_ATTR,
  EDITOR_SECTION_ATTR,
  EDITOR_COLUMN_ATTR,
  EDITOR_BLOCK_TYPE_ATTR,
  EDITOR_LAYOUT_ATTR,
  type ParsedDocument,
  type BlockParseContext,
  type ParsedBlock,
} from "./HTMLParser";

export {
  sanitizeHTML,
  lightSanitize,
  escapeHTML,
  unescapeHTML,
  hasDangerousContent,
} from "./Sanitizer";

export {
  createRawHTMLBlock,
  createParagraphBlock,
  createHeadingBlock,
  createTableBlock,
  createListBlock,
  mapParsedBlocksToEditor,
  createSectionWithBlocks,
  type ParsedBlock as BlockMapperParsedBlock,
} from "./BlockMapper";

export {
  parseInlineMarks,
  serializeMarksToHTML,
  containsPlaceholders,
  extractPlaceholders,
  replacePlaceholder,
  extractInheritedStyles,
  type TextMark,
  type TextSegment,
  type InheritedStyles,
} from "./MarkParser";

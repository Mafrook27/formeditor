import { v4 as uuidv4 } from 'uuid';

// ─── Block Type Constants ────────────────────────────────────────────
export const BLOCK_TYPES = {
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  DIVIDER: 'divider',
  IMAGE: 'image',
  TEXT_INPUT: 'text-input',
  TEXTAREA: 'textarea',
  DROPDOWN: 'dropdown',
  RADIO_GROUP: 'radio-group',
  CHECKBOX_GROUP: 'checkbox-group',
  SINGLE_CHECKBOX: 'single-checkbox',
  DATE_PICKER: 'date-picker',
  FILE_UPLOAD: 'file-upload',
  SIGNATURE: 'signature',
  TABLE: 'table',
  LIST: 'list',
  BUTTON: 'button',
  RAW_HTML: 'raw-html', // NEW: Preserves original HTML structure
} as const;

export type BlockType = typeof BLOCK_TYPES[keyof typeof BLOCK_TYPES];

export const BLOCK_CATEGORIES = {
  CONTENT: 'content',
  FORM: 'form',
} as const;

export type BlockCategory = typeof BLOCK_CATEGORIES[keyof typeof BLOCK_CATEGORIES];

// ─── Block interfaces ────────────────────────────────────────────────
export interface BaseBlockProps {
  id: string;
  type: BlockType;
  width: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  paddingX: number;
  paddingY: number;
  locked: boolean;
}

export interface HeadingBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.HEADING;
  content: string;
  htmlContent?: string; // Preserves original HTML with inline marks
  level: 'h1' | 'h2' | 'h3' | 'h4';
  fontSize: number;
  fontWeight: number;
  textAlign: string;
  lineHeight: number;
  color: string;
}

export interface ParagraphBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.PARAGRAPH;
  content: string;
  htmlContent?: string; // Preserves original HTML with inline marks
  fontSize: number;
  fontWeight: number;
  textAlign: string;
  lineHeight: number;
  color: string;
}

export interface DividerBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.DIVIDER;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

export interface ImageBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.IMAGE;
  src: string;
  alt: string;
  alignment: 'left' | 'center' | 'right';
  borderRadius: number;
  maxHeight: number;
}

export interface TextInputBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.TEXT_INPUT;
  label: string;
  placeholder: string;
  required: boolean;
  fieldName: string;
  helpText: string;
  validationType: string;
  maxLength: string;
}

export interface TextareaBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.TEXTAREA;
  label: string;
  placeholder: string;
  required: boolean;
  fieldName: string;
  helpText: string;
  rows: number;
  maxLength: string;
}

export interface DropdownBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.DROPDOWN;
  label: string;
  required: boolean;
  fieldName: string;
  helpText: string;
  options: string[];
  defaultValue: string;
}

export interface RadioGroupBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.RADIO_GROUP;
  label: string;
  required: boolean;
  fieldName: string;
  helpText: string;
  options: string[];
  layout: 'vertical' | 'horizontal';
}

export interface CheckboxGroupBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.CHECKBOX_GROUP;
  label: string;
  required: boolean;
  fieldName: string;
  helpText: string;
  options: string[];
  layout: 'vertical' | 'horizontal';
}

export interface SingleCheckboxBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.SINGLE_CHECKBOX;
  label: string;
  required: boolean;
  fieldName: string;
}

export interface DatePickerBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.DATE_PICKER;
  label: string;
  required: boolean;
  fieldName: string;
  helpText: string;
}

export interface FileUploadBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.FILE_UPLOAD;
  label: string;
  required: boolean;
  fieldName: string;
  helpText: string;
  acceptTypes: string;
  maxSize: string;
  multiple: boolean;
}

export interface SignatureBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.SIGNATURE;
  label: string;
  required: boolean;
  fieldName: string;
  helpText: string;
  signatureUrl?: string; // URL of inserted signature image
}

export interface TableBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.TABLE;
  htmlContent: string;
  rows: string[][];
  headerRow: boolean;
}

export interface ListBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.LIST;
  listType: 'ordered' | 'unordered';
  htmlContent?: string;
  items: string[];
}

export interface ButtonBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.BUTTON;
  label: string;
  buttonType: 'button' | 'submit' | 'reset';
  variant: 'primary' | 'secondary' | 'outline';
}

// NEW: Raw HTML block - preserves original HTML without conversion
export interface RawHTMLBlockProps extends BaseBlockProps {
  type: typeof BLOCK_TYPES.RAW_HTML;
  htmlContent: string;
  originalStyles?: string; // Preserve original CSS
}

export type EditorBlock =
  | HeadingBlockProps
  | ParagraphBlockProps
  | DividerBlockProps
  | ImageBlockProps
  | TextInputBlockProps
  | TextareaBlockProps
  | DropdownBlockProps
  | RadioGroupBlockProps
  | CheckboxGroupBlockProps
  | SingleCheckboxBlockProps
  | DatePickerBlockProps
  | FileUploadBlockProps
  | SignatureBlockProps
  | TableBlockProps
  | ListBlockProps
  | ButtonBlockProps
  | RawHTMLBlockProps;

// ─── Section interface ───────────────────────────────────────────────
export interface EditorSection {
  id: string;
  columns: 1 | 2 | 3;
  blocks: EditorBlock[][];  // blocks[columnIndex][blockIndex]
}

// ─── Editor state ────────────────────────────────────────────────────
export interface EditorState {
  sections: EditorSection[];
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  isPreviewMode: boolean;
  zoom: number;
  history: EditorSection[][];
  historyIndex: number;
  isDragging: boolean;
}

// ─── Block library items ─────────────────────────────────────────────
export interface BlockLibraryItem {
  type: BlockType;
  label: string;
  category: BlockCategory;
  icon: string;
}

export const BLOCK_LIBRARY: BlockLibraryItem[] = [
  { type: BLOCK_TYPES.HEADING, label: 'Heading', category: BLOCK_CATEGORIES.CONTENT, icon: 'Heading' },
  { type: BLOCK_TYPES.PARAGRAPH, label: 'Paragraph', category: BLOCK_CATEGORIES.CONTENT, icon: 'AlignLeft' },
  { type: BLOCK_TYPES.DIVIDER, label: 'Divider', category: BLOCK_CATEGORIES.CONTENT, icon: 'Minus' },
  { type: BLOCK_TYPES.IMAGE, label: 'Image', category: BLOCK_CATEGORIES.CONTENT, icon: 'Image' },
  { type: BLOCK_TYPES.TABLE, label: 'Table', category: BLOCK_CATEGORIES.CONTENT, icon: 'Table2' },
  { type: BLOCK_TYPES.LIST, label: 'List', category: BLOCK_CATEGORIES.CONTENT, icon: 'List' },
  { type: BLOCK_TYPES.TEXT_INPUT, label: 'Text Input', category: BLOCK_CATEGORIES.FORM, icon: 'TextCursorInput' },
  { type: BLOCK_TYPES.TEXTAREA, label: 'Textarea', category: BLOCK_CATEGORIES.FORM, icon: 'FileText' },
  { type: BLOCK_TYPES.DROPDOWN, label: 'Dropdown', category: BLOCK_CATEGORIES.FORM, icon: 'ChevronDown' },
  { type: BLOCK_TYPES.RADIO_GROUP, label: 'Radio Group', category: BLOCK_CATEGORIES.FORM, icon: 'CircleDot' },
  { type: BLOCK_TYPES.CHECKBOX_GROUP, label: 'Checkbox Group', category: BLOCK_CATEGORIES.FORM, icon: 'CheckSquare' },
  { type: BLOCK_TYPES.SINGLE_CHECKBOX, label: 'Agreement Checkbox', category: BLOCK_CATEGORIES.FORM, icon: 'Square' },
  { type: BLOCK_TYPES.DATE_PICKER, label: 'Date Picker', category: BLOCK_CATEGORIES.FORM, icon: 'Calendar' },
  { type: BLOCK_TYPES.FILE_UPLOAD, label: 'File Upload', category: BLOCK_CATEGORIES.FORM, icon: 'Upload' },
  { type: BLOCK_TYPES.SIGNATURE, label: 'Signature', category: BLOCK_CATEGORIES.FORM, icon: 'PenTool' },
  { type: BLOCK_TYPES.BUTTON, label: 'Button', category: BLOCK_CATEGORIES.FORM, icon: 'MousePointerClick' },
];

// ─── Default block factory ───────────────────────────────────────────
export function getDefaultBlockProps(type: BlockType): EditorBlock {
  const base: BaseBlockProps = {
    id: uuidv4(),
    type,
    width: 100,
    marginTop: 0,
    marginBottom: 8,
    marginLeft: 0,
    marginRight: 0,
    paddingX: 0,
    paddingY: 0,
    locked: false,
  };
  switch (type) {
    case BLOCK_TYPES.HEADING:
      return { ...base, type, content: 'Heading Text', level: 'h2', fontSize: 24, fontWeight: 600, textAlign: 'left', lineHeight: 1.3, color: '', marginBottom: 12 };
    case BLOCK_TYPES.PARAGRAPH:
      return { ...base, type, content: 'Enter your text here. This paragraph block supports rich content for legal agreements, descriptions, and professional documents.', fontSize: 14, fontWeight: 400, textAlign: 'left', lineHeight: 1.6, color: '' };
    case BLOCK_TYPES.DIVIDER:
      return { ...base, type, thickness: 1, style: 'solid', color: '#000000', marginTop: 16, marginBottom: 16 };
    case BLOCK_TYPES.IMAGE:
      return { ...base, type, src: '', alt: 'Image', alignment: 'center', borderRadius: 4, maxHeight: 300 };
    case BLOCK_TYPES.TEXT_INPUT:
      return { ...base, type, label: 'Text Field', placeholder: 'Enter text...', required: false, fieldName: `text_field_${Date.now()}`, helpText: '', validationType: 'none', maxLength: '' };
    case BLOCK_TYPES.TEXTAREA:
      return { ...base, type, label: 'Text Area', placeholder: 'Enter detailed text...', required: false, fieldName: `textarea_${Date.now()}`, helpText: '', rows: 4, maxLength: '' };
    case BLOCK_TYPES.DROPDOWN:
      return { ...base, type, label: 'Dropdown', required: false, fieldName: `dropdown_${Date.now()}`, helpText: '', options: ['Option 1', 'Option 2', 'Option 3'], defaultValue: '' };
    case BLOCK_TYPES.RADIO_GROUP:
      return { ...base, type, label: 'Radio Group', required: false, fieldName: `radio_${Date.now()}`, helpText: '', options: ['Option A', 'Option B', 'Option C'], layout: 'vertical' };
    case BLOCK_TYPES.CHECKBOX_GROUP:
      return { ...base, type, label: 'Checkbox Group', required: false, fieldName: `checkbox_group_${Date.now()}`, helpText: '', options: ['Choice 1', 'Choice 2', 'Choice 3'], layout: 'vertical' };
    case BLOCK_TYPES.SINGLE_CHECKBOX:
      return { ...base, type, label: 'I agree to the terms and conditions outlined in this agreement.', required: false, fieldName: `agreement_${Date.now()}` };
    case BLOCK_TYPES.DATE_PICKER:
      return { ...base, type, label: 'Date', required: false, fieldName: `date_${Date.now()}`, helpText: '', width: 50 };
    case BLOCK_TYPES.FILE_UPLOAD:
      return { ...base, type, label: 'File Upload', required: false, fieldName: `file_${Date.now()}`, helpText: '', acceptTypes: '.pdf,.doc,.docx,.jpg,.png', maxSize: '10MB', multiple: false };
    case BLOCK_TYPES.SIGNATURE:
      return { ...base, type, label: 'Signature', required: false, fieldName: `signature_${Date.now()}`, helpText: 'Click to insert signature', signatureUrl: '' };
    case BLOCK_TYPES.TABLE:
      return { ...base, type, htmlContent: '', rows: [['Header 1', 'Header 2', 'Header 3'], ['Cell 1', 'Cell 2', 'Cell 3'], ['Cell 4', 'Cell 5', 'Cell 6']], headerRow: true };
    case BLOCK_TYPES.LIST:
      return { ...base, type, listType: 'unordered', items: ['Item 1', 'Item 2', 'Item 3'] };
    case BLOCK_TYPES.BUTTON:
      return { ...base, type, label: 'Submit', buttonType: 'submit', variant: 'primary' };
    default:
      return base as EditorBlock;
  }
}

export function createSection(columns: 1 | 2 | 3 = 1): EditorSection {
  return {
    id: uuidv4(),
    columns,
    blocks: Array.from({ length: columns }, () => []),
  };
}

// ─── Initial demo state ──────────────────────────────────────────────
export function getInitialState(): EditorState {
  const introSection = createSection(1);
  introSection.blocks[0] = [
    { ...getDefaultBlockProps(BLOCK_TYPES.HEADING), content: 'Financial Services Agreement', level: 'h1', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 4 } as HeadingBlockProps,
    { ...getDefaultBlockProps(BLOCK_TYPES.PARAGRAPH), content: 'This Agreement ("Agreement") is entered into as of the date signed below, between the parties identified herein. Please review all terms carefully before signing.', fontSize: 13, textAlign: 'center', color: '', marginBottom: 16 } as ParagraphBlockProps,
    { ...getDefaultBlockProps(BLOCK_TYPES.DIVIDER), thickness: 5, marginTop: 0, marginBottom: 20 } as DividerBlockProps,
  ];

  const formSection = createSection(2);
  formSection.blocks[0] = [
    { ...getDefaultBlockProps(BLOCK_TYPES.TEXT_INPUT), label: 'Full Legal Name', placeholder: 'Enter your full name', required: true, fieldName: 'full_name' } as TextInputBlockProps,
    { ...getDefaultBlockProps(BLOCK_TYPES.TEXT_INPUT), label: 'Email Address', placeholder: 'name@example.com', required: true, fieldName: 'email', validationType: 'email' } as TextInputBlockProps,
  ];
  formSection.blocks[1] = [
    { ...getDefaultBlockProps(BLOCK_TYPES.TEXT_INPUT), label: 'Phone Number', placeholder: '(555) 000-0000', required: true, fieldName: 'phone', validationType: 'phone' } as TextInputBlockProps,
    { ...getDefaultBlockProps(BLOCK_TYPES.DATE_PICKER), label: 'Date of Birth', required: true, fieldName: 'dob', width: 100 } as DatePickerBlockProps,
  ];

  const termsSection = createSection(1);
  termsSection.blocks[0] = [
    { ...getDefaultBlockProps(BLOCK_TYPES.HEADING), content: 'Terms & Conditions', level: 'h3', fontSize: 18, fontWeight: 600, marginTop: 8, marginBottom: 8 } as HeadingBlockProps,
    { ...getDefaultBlockProps(BLOCK_TYPES.PARAGRAPH), content: 'By executing this Agreement, you acknowledge that you have read, understood, and agree to be bound by the terms and conditions set forth herein. This Agreement constitutes the entire understanding between the parties with respect to the subject matter contained herein and supersedes all prior negotiations, representations, or agreements relating thereto.', fontSize: 12, lineHeight: 1.7 } as ParagraphBlockProps,
    { ...getDefaultBlockProps(BLOCK_TYPES.SINGLE_CHECKBOX), label: 'I have read and agree to the Terms & Conditions, Privacy Policy, and Disclosure Agreement.', required: true, fieldName: 'terms_agree' } as SingleCheckboxBlockProps,
    { ...getDefaultBlockProps(BLOCK_TYPES.SIGNATURE), label: 'Applicant Signature', required: true, fieldName: 'applicant_signature', helpText: 'Please sign in the area above' } as SignatureBlockProps,
  ];

  return {
    sections: [introSection, formSection, termsSection],
    selectedBlockId: null,
    selectedSectionId: null,
    isPreviewMode: false,
    zoom: 100,
    history: [],
    historyIndex: -1,
    isDragging: false,
  };
}

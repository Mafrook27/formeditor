import React from 'react';
import { BLOCK_TYPES, type EditorBlock } from '../editorConfig';
import { HeadingBlock } from './HeadingBlock';
import { ParagraphBlock } from './ParagraphBlock';
import { DividerBlock } from './DividerBlock';
import { ImageBlock } from './ImageBlock';
import { TextInputBlock } from './TextInputBlock';
import { TextareaBlock } from './TextareaBlock';
import { DropdownBlock } from './DropdownBlock';
import { RadioGroupBlock } from './RadioGroupBlock';
import { CheckboxGroupBlock } from './CheckboxGroupBlock';
import { SingleCheckboxBlock } from './SingleCheckboxBlock';
import { DatePickerBlock } from './DatePickerBlock';
import { FileUploadBlock } from './FileUploadBlock';
import { SignatureBlock } from './SignatureBlock';
import { TableBlock } from './TableBlock';
import { ListBlock } from './ListBlock';
import { ButtonBlock } from './ButtonBlock';
import { RawHTMLBlock } from './RawHTMLBlock';

interface BlockRendererProps {
  block: EditorBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case BLOCK_TYPES.HEADING:
      return <HeadingBlock block={block} />;
    case BLOCK_TYPES.PARAGRAPH:
      return <ParagraphBlock block={block} />;
    case BLOCK_TYPES.DIVIDER:
      return <DividerBlock block={block} />;
    case BLOCK_TYPES.IMAGE:
      return <ImageBlock block={block} />;
    case BLOCK_TYPES.TEXT_INPUT:
      return <TextInputBlock block={block} />;
    case BLOCK_TYPES.TEXTAREA:
      return <TextareaBlock block={block} />;
    case BLOCK_TYPES.DROPDOWN:
      return <DropdownBlock block={block} />;
    case BLOCK_TYPES.RADIO_GROUP:
      return <RadioGroupBlock block={block} />;
    case BLOCK_TYPES.CHECKBOX_GROUP:
      return <CheckboxGroupBlock block={block} />;
    case BLOCK_TYPES.SINGLE_CHECKBOX:
      return <SingleCheckboxBlock block={block} />;
    case BLOCK_TYPES.DATE_PICKER:
      return <DatePickerBlock block={block} />;
    case BLOCK_TYPES.FILE_UPLOAD:
      return <FileUploadBlock block={block} />;
    case BLOCK_TYPES.SIGNATURE:
      return <SignatureBlock block={block} />;
    case BLOCK_TYPES.TABLE:
      return <TableBlock block={block} />;
    case BLOCK_TYPES.LIST:
      return <ListBlock block={block} />;
    case BLOCK_TYPES.BUTTON:
      return <ButtonBlock block={block} />;
    case BLOCK_TYPES.RAW_HTML:
      return <RawHTMLBlock block={block as any} />;
    default:
      return <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">Unknown block</div>;
  }
}

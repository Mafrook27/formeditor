import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TextareaBlockProps } from '../editorConfig';

export const TextareaBlock = memo(function TextareaBlock({ block }: { block: TextareaBlockProps }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea placeholder={block.placeholder} rows={block.rows} className="bg-card border-input text-sm resize-y" />
      {block.helpText && <p className="text-xs text-muted-foreground">{block.helpText}</p>}
    </div>
  );
});

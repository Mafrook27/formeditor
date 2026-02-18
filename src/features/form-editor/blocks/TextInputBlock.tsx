import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TextInputBlockProps } from '../editorConfig';

export const TextInputBlock = memo(function TextInputBlock({ block }: { block: TextInputBlockProps }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input type="text" placeholder={block.placeholder} className="bg-card border-input text-sm" />
      {block.helpText && <p className="text-xs text-muted-foreground">{block.helpText}</p>}
    </div>
  );
});

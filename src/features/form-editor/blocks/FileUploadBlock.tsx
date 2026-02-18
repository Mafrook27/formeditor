import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import type { FileUploadBlockProps } from '../editorConfig';

export const FileUploadBlock = memo(function FileUploadBlock({ block }: { block: FileUploadBlockProps }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-3 p-3 border border-dashed border-input rounded-md bg-muted/20 cursor-pointer hover:bg-muted/40" style={{ transitionProperty: 'background-color', transitionDuration: 'var(--transition-smooth)' }}>
        <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm text-foreground">Click to upload or drag file here</p>
          <p className="text-xs text-muted-foreground">
            {block.acceptTypes && `Accepted: ${block.acceptTypes}`}
            {block.maxSize && ` · Max: ${block.maxSize}`}
          </p>
        </div>
      </div>
      {block.helpText && <p className="text-xs text-muted-foreground">{block.helpText}</p>}
    </div>
  );
});

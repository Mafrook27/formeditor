import React, { memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DropdownBlockProps } from "../editorConfig";

export const DropdownBlock = memo(function DropdownBlock({
  block,
}: {
  block: DropdownBlockProps;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select defaultValue={block.defaultValue || undefined}>
        <SelectTrigger className="bg-card border-input text-sm">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {(block.options || []).map((opt, i) => (
            <SelectItem key={i} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {block.helpText && (
        <p className="text-xs text-muted-foreground">{block.helpText}</p>
      )}
    </div>
  );
});

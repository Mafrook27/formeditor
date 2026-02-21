import React, { memo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { DatePickerBlockProps } from "../editorConfig";

export const DatePickerBlock = memo(function DatePickerBlock({
  block,
}: {
  block: DatePickerBlockProps;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input type="date" className="bg-card border-input text-sm" />
      {block.helpText && (
        <p className="text-xs text-muted-foreground">{block.helpText}</p>
      )}
    </div>
  );
});

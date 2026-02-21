import React, { memo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckboxGroupBlockProps } from "../editorConfig";

export const CheckboxGroupBlock = memo(function CheckboxGroupBlock({
  block,
}: {
  block: CheckboxGroupBlockProps;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div
        className={
          block.layout === "horizontal"
            ? "flex flex-row flex-wrap gap-4"
            : "flex flex-col gap-2"
        }
      >
        {(block.options || []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Checkbox id={`${block.id}-cb-${i}`} />
            <Label
              htmlFor={`${block.id}-cb-${i}`}
              className="text-sm font-normal cursor-pointer"
            >
              {opt}
            </Label>
          </div>
        ))}
      </div>
      {block.helpText && (
        <p className="text-xs text-muted-foreground">{block.helpText}</p>
      )}
    </div>
  );
});

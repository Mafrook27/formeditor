import React, { memo } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { RadioGroupBlockProps } from "../editorConfig";

export const RadioGroupBlock = memo(function RadioGroupBlock({
  block,
}: {
  block: RadioGroupBlockProps;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <RadioGroup
        className={
          block.layout === "horizontal"
            ? "flex flex-row flex-wrap gap-4"
            : "flex flex-col gap-2"
        }
      >
        {(block.options || []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <RadioGroupItem value={opt} id={`${block.id}-${i}`} />
            <Label
              htmlFor={`${block.id}-${i}`}
              className="text-sm font-normal cursor-pointer"
            >
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {block.helpText && (
        <p className="text-xs text-muted-foreground">{block.helpText}</p>
      )}
    </div>
  );
});

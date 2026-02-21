import React, { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SingleCheckboxBlockProps } from "../editorConfig";

export const SingleCheckboxBlock = memo(function SingleCheckboxBlock({
  block,
}: {
  block: SingleCheckboxBlockProps;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Checkbox id={block.id} className="mt-0.5" />
      <Label
        htmlFor={block.id}
        className="text-sm font-normal leading-relaxed cursor-pointer"
      >
        {block.label}
        {block.required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  );
});

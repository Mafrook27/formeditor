import React, { memo } from "react";
import { useEditor } from "../EditorContext";
import { Button } from "@/components/ui/button";
import type { ButtonBlockProps } from "../editorConfig";

export const ButtonBlock = memo(function ButtonBlock({
  block,
}: {
  block: ButtonBlockProps;
}) {
  const { state } = useEditor();
  const isPreview = state.isPreviewMode;

  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      type={block.buttonType}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${variantStyles[block.variant]} ${
        isPreview ? "cursor-pointer" : "cursor-default"
      }`}
      onClick={(e) => {
        if (!isPreview) {
          e.preventDefault();
        }
      }}
    >
      {block.label}
    </button>
  );
});

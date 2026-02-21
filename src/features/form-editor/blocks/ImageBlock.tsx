import React, { memo, useRef } from "react";
import { useEditor } from "../EditorContext";
import type { ImageBlockProps } from "../editorConfig";
import { Image as ImageIcon } from "lucide-react";

export const ImageBlock = memo(function ImageBlock({
  block,
}: {
  block: ImageBlockProps;
}) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateBlockWithHistory(block.id, { src: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!block.src) {
    if (isPreview) return null;
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-editor-border rounded-lg bg-muted/30 cursor-pointer hover:border-editor-selected/40 group"
        onClick={() => fileRef.current?.click()}
        style={{
          transitionProperty: "border-color",
          transitionDuration: "var(--transition-smooth)",
        }}
      >
        <ImageIcon
          className="h-8 w-8 text-muted-foreground group-hover:text-editor-selected"
          style={{
            transitionProperty: "color",
            transitionDuration: "var(--transition-smooth)",
          }}
        />
        <span className="text-sm text-muted-foreground">
          Click to upload image
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    );
  }

  return (
    <div style={{ textAlign: block.alignment || "center" }}>
      <img
        src={block.src}
        alt={block.alt}
        style={{
          maxWidth: "100%",
          borderRadius: `${block.borderRadius}px`,
          maxHeight: `${block.maxHeight}px`,
          display: "inline-block",
        }}
      />
    </div>
  );
});

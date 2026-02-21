import { memo } from "react";
import type { DividerBlockProps } from "../editorConfig";
import { useEditor } from "../EditorContext";

export const DividerBlock = memo(function DividerBlock({
  block,
}: {
  block: DividerBlockProps;
}) {
  const { state } = useEditor();
  const isPreview = state.isPreviewMode;

  // In edit mode, add a wrapper with minimum height for easier grabbing
  if (!isPreview) {
    return (
      <div
        className="relative group/divider"
        style={{ minHeight: "32px", display: "flex", alignItems: "center" }}
      >
        <hr
          style={{
            border: "none",
            borderTop: `${block.thickness}px ${block.style} ${block.color || "#000000"}`,
            width: "100%",
            margin: 0,
          }}
        />
        {/* Visual indicator for easier grabbing */}
        <div className="absolute inset-0 opacity-0 group-hover/divider:opacity-100 transition-opacity pointer-events-none">
          <div className="h-full border-2 border-dashed border-primary/30 rounded" />
        </div>
      </div>
    );
  }

  // Preview mode - just the divider
  return (
    <hr
      style={{
        border: "none",
        borderTop: `${block.thickness}px ${block.style} ${block.color || "#000000"}`,
        width: "100%",
      }}
    />
  );
});

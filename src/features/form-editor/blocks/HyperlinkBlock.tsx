import React, { memo, useState, useRef, useEffect } from "react";
import { useEditor } from "../EditorContext";
import type { HyperlinkBlockProps } from "../editorConfig";
import styles from "../editor.module.css";

export const HyperlinkBlock = memo(function HyperlinkBlock({
  block,
}: {
  block: HyperlinkBlockProps;
}) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  const linkStyle: React.CSSProperties = {
    fontSize: `${block.fontSize}px`,
    fontWeight: block.fontWeight,
    lineHeight: block.lineHeight,
    color: block.color || "#0066cc",
    textDecoration: block.underline ? "underline" : "none",
    cursor: isPreview ? "pointer" : "text",
    display: "inline-block",
  };

  const containerStyle: React.CSSProperties = {
    textAlign: block.textAlign as React.CSSProperties["textAlign"],
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <a
          href={block.url || "#"}
          target={block.openInNewTab ? "_blank" : "_self"}
          rel={block.openInNewTab ? "noopener noreferrer" : undefined}
          className={styles.canvasBlock}
          style={linkStyle}
        >
          {block.text || "Click here"}
        </a>
      </div>
    );
  }

  // Set text content imperatively when entering edit mode — no React children inside contentEditable
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.textContent = block.text || "Click here";
      textRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  return (
    <div style={containerStyle}>
      {/* VIEW mode: React text node, no contentEditable */}
      {!isEditing && (
        <span
          style={linkStyle}
          className={`min-w-[50px] outline-none ${styles.canvasBlock}`}
          onDoubleClick={() => !block.locked && setIsEditing(true)}
        >
          {block.text || "Click here"}
        </span>
      )}
      {/* EDIT mode: empty contentEditable, content set via useEffect */}
      {isEditing && (
        <span
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          style={linkStyle}
          className={`min-w-[50px] outline-none ${styles.canvasBlock}`}
          onBlur={(e) => {
            setIsEditing(false);
            const newText = (e.currentTarget.innerText || "").replace(
              /\u00a0/g,
              " ",
            );
            if (newText !== block.text) {
              updateBlockWithHistory(block.id, { text: newText });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      )}
    </div>
  );
});

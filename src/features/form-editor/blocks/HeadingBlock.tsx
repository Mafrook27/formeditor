import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import { useEditor } from "../EditorContext";
import {
  PlaceholderDropdown,
  usePlaceholderTrigger,
  insertPlaceholderIntoText,
} from "../plugins/PlaceholderPlugin";
import { containsPlaceholders } from "../parser/MarkParser";
import type { HeadingBlockProps } from "../editorConfig";
import styles from "../editor.module.css";

function extractText(el: HTMLElement): string {
  return (el.innerText || "").replace(/\u00a0/g, " ");
}

const HeadingContent = memo(function HeadingContent({
  content,
  isPreview,
}: {
  content: string;
  isPreview: boolean;
}) {
  if (!content)
    return isPreview ? null : (
      <span className="text-muted-foreground/50">Click to add heading...</span>
    );

  if (containsPlaceholders(content)) {
    const parts = content.split(/(PH@[\w]+|@[\w]+)/g);
    let charOffset = 0;
    return (
      <>
        {parts.map((part) => {
          const key = `${charOffset}`;
          charOffset += part.length || 1;
          if (part.match(/^(PH@[\w]+|@[\w]+)$/)) {
            return (
              <span
                key={key}
                className="bg-primary/10 text-primary px-1 rounded"
                style={{
                  backgroundColor: "#b3d4fc",
                  color: "#000",
                  padding: "0 2px",
                }}
              >
                {part}
              </span>
            );
          }
          return <React.Fragment key={key}>{part}</React.Fragment>;
        })}
      </>
    );
  }

  return <>{content}</>;
});

export const HeadingBlock = memo(function HeadingBlock({
  block,
}: {
  block: HeadingBlockProps;
}) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const isSelectingPlaceholderRef = useRef(false);

  // Rich text format toolbar state
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [formatBarPos, setFormatBarPos] = useState({ x: 0, y: 0 });
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const handlePlaceholderInsert = useCallback(
    (placeholder: string, position: number) => {
      if (!editRef.current) return;
      isSelectingPlaceholderRef.current = true;
      const currentText = extractText(editRef.current);
      const newContent = insertPlaceholderIntoText(
        currentText,
        placeholder,
        position,
      );

      // Find start of the @-trigger so we know where to place cursor after insertion
      let atStart = position;
      for (let i = position; i >= 0; i--) {
        if (currentText.substring(i, i + 3) === "PH@") {
          atStart = i;
          break;
        } else if (currentText[i] === "@") {
          atStart = i;
          break;
        }
      }
      const cursorAfterInsert = atStart + placeholder.length + 1; // +1 for trailing space

      // Update DOM directly — state updates don't reflect in contentEditable while editing,
      // so without this the onBlur would read stale DOM text and overwrite the insertion.
      editRef.current.textContent = newContent;
      updateBlockWithHistory(block.id, {
        content: newContent,
        htmlContent: newContent,
      });

      setTimeout(() => {
        if (editRef.current) {
          try {
            const range = document.createRange();
            const sel = window.getSelection();
            const textNode = editRef.current.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              const pos = Math.min(
                cursorAfterInsert,
                textNode.textContent?.length ?? 0,
              );
              range.setStart(textNode, pos);
              range.collapse(true);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          } catch {
            /* ignore range errors */
          }
          editRef.current.focus();
          isSelectingPlaceholderRef.current = false;
        }
      }, 0);
    },
    [block.id, updateBlockWithHistory],
  );

  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });

  // Set innerHTML imperatively when entering edit mode — NEVER pass React children
  // into a contentEditable div (causes removeChild crash on re-render)
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.innerHTML = block.htmlContent || block.content;
      editRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]); // intentionally omit block.* — only run once on enter edit

  const updateFormatState = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, []);

  const handleSelectionChange = useCallback(() => {
    if (!isEditing || !editRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editRef.current.contains(sel.anchorNode)) {
      setShowFormatBar(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = editRef.current.getBoundingClientRect();
    setFormatBarPos({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 44,
    });
    setShowFormatBar(true);
    updateFormatState();
  }, [isEditing, updateFormatState]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  const applyFormat = useCallback(
    (command: string) => {
      document.execCommand(command, false);
      updateFormatState();
      editRef.current?.focus();
    },
    [updateFormatState],
  );

  const headingStyle: React.CSSProperties = {
    fontSize: `${block.fontSize}px`,
    fontWeight: block.fontWeight,
    textAlign: block.textAlign as React.CSSProperties["textAlign"],
    lineHeight: block.lineHeight,
    color: block.color || "inherit",
    fontFamily: block.fontFamily || "'Open Sans', Arial, Helvetica, sans-serif",
    outline: "none",
    cursor: isPreview ? "default" : "text",
  };

  if (isPreview) {
    if (block.htmlContent) {
      return (
        <div
          className={styles.canvasBlock}
          style={headingStyle}
          dangerouslySetInnerHTML={{ __html: block.htmlContent }}
        />
      );
    }
    return (
      <div className={styles.canvasBlock} style={headingStyle}>
        <HeadingContent content={block.content} isPreview={isPreview} />
      </div>
    );
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        {showFormatBar && isEditing && (
          <div
            style={{
              position: "absolute",
              left: `${formatBarPos.x}px`,
              top: `${formatBarPos.y}px`,
              transform: "translateX(-50%)",
              zIndex: 1000,
              background: "#1e293b",
              borderRadius: "6px",
              padding: "4px",
              display: "flex",
              gap: "2px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {[
              {
                cmd: "bold",
                label: "B",
                extra: { fontWeight: "bold" as const },
              },
              {
                cmd: "italic",
                label: "I",
                extra: { fontStyle: "italic" as const },
              },
              {
                cmd: "underline",
                label: "U",
                extra: { textDecoration: "underline" as const },
              },
            ].map(({ cmd, label, extra }) => (
              <button
                key={cmd}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat(cmd);
                }}
                style={{
                  ...extra,
                  background: activeFormats[cmd as keyof typeof activeFormats]
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  minWidth: "28px",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* VIEW mode: React children — NEVER put React children inside contentEditable */}
        {!isEditing && (
          <div
            style={headingStyle}
            className={`min-h-[1em] ${styles.canvasBlock}`}
            role="textbox"
            tabIndex={0}
            onDoubleClick={() => !block.locked && setIsEditing(true)}
          >
            <HeadingContent content={block.content} isPreview={false} />
          </div>
        )}

        {/* EDIT mode: empty contentEditable — content set via useEffect, no React children */}
        {isEditing && (
          <div
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            style={headingStyle}
            className={`min-h-[1em] ${styles.canvasBlock}`}
            role="textbox"
            tabIndex={0}
            onBlur={(e) => {
              if (isSelectingPlaceholderRef.current) return;
              setIsEditing(false);
              setShowFormatBar(false);
              placeholderTrigger.close();
              const newContent = extractText(e.currentTarget);
              const newHtmlContent = e.currentTarget.innerHTML;
              const updates: Partial<HeadingBlockProps> = {};
              if (newContent !== block.content) updates.content = newContent;
              if (newHtmlContent !== block.htmlContent)
                updates.htmlContent = newHtmlContent;
              if (Object.keys(updates).length > 0) {
                updateBlockWithHistory(block.id, updates);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
              if (editRef.current) {
                placeholderTrigger.handleKeyDown(e as any, editRef.current);
              }
            }}
          />
        )}
      </div>

      <PlaceholderDropdown
        isOpen={placeholderTrigger.isOpen}
        onClose={placeholderTrigger.close}
        onSelect={placeholderTrigger.handleSelect}
        position={placeholderTrigger.position}
        searchTerm={placeholderTrigger.searchTerm}
      />
    </>
  );
});

import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import { useEditor } from "../EditorContext";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical } from "lucide-react";
import {
  PlaceholderDropdown,
  usePlaceholderTrigger,
  insertPlaceholderIntoText,
} from "../plugins/PlaceholderPlugin";
import type { ListBlockProps } from "../editorConfig";
import editorStyles from "../editor.module.css";

export const ListBlock = memo(function ListBlock({
  block,
}: {
  block: ListBlockProps;
}) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextKeyId = useRef(0);
  const itemKeysRef = useRef<string[]>([]);

  // Safety check: ensure items exists
  const items = block.items || ["Item 1", "Item 2"];

  while (itemKeysRef.current.length < items.length) {
    itemKeysRef.current.push(String(nextKeyId.current++));
  }
  itemKeysRef.current.length = items.length;

  // Auto-resize textarea to fit content
  const autoResizeTextarea = useCallback(
    (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      }
    },
    [],
  );

  useEffect(() => {
    if (editingIndex !== null && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      autoResizeTextarea(textareaRef.current);
    }
  }, [editingIndex, autoResizeTextarea]);

  const updateItem = (idx: number, value: string) => {
    const newItems = items.map((item, i) => (i === idx ? value : item));
    updateBlockWithHistory(block.id, { items: newItems });
  };

  const handlePlaceholderInsert = useCallback(
    (placeholder: string, position: number) => {
      if (editingIndex === null) return;
      const currentText = items[editingIndex] || "";
      const newContent = insertPlaceholderIntoText(
        currentText,
        placeholder,
        position,
      );
      updateItem(editingIndex, newContent);

      // Place cursor after inserted placeholder
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

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          try {
            const pos = Math.min(
              cursorAfterInsert,
              textareaRef.current.value.length,
            );
            textareaRef.current.setSelectionRange(pos, pos);
          } catch {
            /* ignore selection errors */
          }
          textareaRef.current.focus();
          autoResizeTextarea(textareaRef.current);
        }
      });
    },
    [editingIndex, items, updateItem, autoResizeTextarea],
  );

  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });

  const addItem = () => {
    updateBlockWithHistory(block.id, { items: [...items, ""] });
    setEditingIndex(items.length);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== idx);
    updateBlockWithHistory(block.id, { items: newItems });
    itemKeysRef.current.splice(idx, 1);
    if (editingIndex === idx) setEditingIndex(null);
  };

  const toggleListType = () => {
    updateBlockWithHistory(block.id, {
      listType: block.listType === "ordered" ? "unordered" : "ordered",
    });
  };

  const handleItemClick = (idx: number) => {
    if (!isPreview && !block.locked) {
      setEditingIndex(idx);
    }
  };

  const handleBlur = () => {
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    // Allow Enter for new lines, use Ctrl+Enter to create new item
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addItem();
    } else if (e.key === "Backspace" && items[idx] === "" && items.length > 1) {
      e.preventDefault();
      removeItem(idx);
      if (idx > 0) setEditingIndex(() => idx - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (idx < items.length - 1) setEditingIndex(() => idx + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx > 0) setEditingIndex(() => idx - 1);
    }

    if (textareaRef.current) {
      placeholderTrigger.handleKeyDown(e as any, textareaRef.current);
    }
  };

  const ListTag = block.listType === "ordered" ? "ol" : "ul";
  const isEditable = !isPreview && !block.locked;

  return (
    <div className="space-y-2" style={{ minWidth: 0 }}>
      <ListTag
        className={`${block.listType === "ordered" ? "list-decimal" : "list-disc"} ml-5 space-y-1`}
        style={{ minWidth: 0 }}
      >
        {items.map((item, idx) => (
          <li
            key={itemKeysRef.current[idx]}
            className={`text-sm ${editorStyles.canvasCell}`}
            style={{ minWidth: 0 }}
          >
            {editingIndex === idx ? (
              <textarea
                ref={textareaRef}
                value={item}
                onChange={(e) => {
                  updateItem(idx, e.target.value);
                  autoResizeTextarea(e.target);
                }}
                onBlur={handleBlur}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-full bg-transparent border-0 outline-none ring-0 focus:ring-2 focus:ring-primary rounded px-1 -mx-1 resize-none"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  minHeight: "1.5rem",
                  overflow: "hidden",
                }}
              />
            ) : isEditable ? (
              <span
                className={`cursor-text hover:bg-primary/5 px-1 -mx-1 rounded block ${editorStyles.canvasCell}`}
                onClick={() => handleItemClick(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemClick(idx);
                  }
                }}
              >
                {item || (
                  <span className="text-muted-foreground/50">
                    Click to edit
                  </span>
                )}
              </span>
            ) : (
              <span className={editorStyles.canvasCell}>{item || ""}</span>
            )}
          </li>
        ))}
      </ListTag>

      {isEditable && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={addItem}
          >
            <Plus className="h-3 w-3" /> Item
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={toggleListType}
          >
            {block.listType === "ordered" ? "Numbered" : "Bulleted"}
          </Button>
          {items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={() => removeItem(items.length - 1)}
            >
              <X className="h-3 w-3" /> Remove Last
            </Button>
          )}
        </div>
      )}

      <PlaceholderDropdown
        isOpen={placeholderTrigger.isOpen}
        onClose={placeholderTrigger.close}
        onSelect={placeholderTrigger.handleSelect}
        position={placeholderTrigger.position}
        searchTerm={placeholderTrigger.searchTerm}
      />
    </div>
  );
});

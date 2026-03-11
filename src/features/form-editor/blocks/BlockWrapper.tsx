import React, { memo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditor } from "../EditorContext";
import type { EditorBlock } from "../editorConfig";
import { GripVertical, Copy, Trash2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import editorStyles from "../editor.module.css";

interface BlockWrapperProps {
  block: EditorBlock;
  sectionId: string;
  columnIndex: number;
  children: React.ReactNode;
}

export const BlockWrapper = memo(function BlockWrapper({
  block,
  sectionId,
  columnIndex,
  children,
}: BlockWrapperProps) {
  const {
    state,
    selectBlock,
    removeBlock,
    duplicateBlock,
    updateBlockWithHistory,
  } = useEditor();
  const isSelected = state.selectedBlockId === block.id;
  const isPreview = state.isPreviewMode;
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { type: "block", block, sectionId, columnIndex },
    disabled: isPreview || block.locked,
  });

  const visualStyle: React.CSSProperties = {
    backgroundColor: block.backgroundColor || undefined,
    color: (block as any).textColor || undefined,
    fontFamily: block.fontFamily || undefined,
    border: block.blockBorderWidth
      ? `${block.blockBorderWidth}px ${block.blockBorderStyle || "solid"} ${block.blockBorderColor || "#e2e8f0"}`
      : undefined,
    borderRadius: block.blockBorderRadius
      ? `${block.blockBorderRadius}px`
      : undefined,
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.3 : 1,
    width: `${block.width}%`,
    minWidth: 0, // Critical: allows flex/grid children to shrink below content size
    marginTop: `${block.marginTop || 0}px`,
    marginBottom: `${block.marginBottom || 0}px`,
    marginLeft: `${block.marginLeft || 0}px`,
    marginRight: `${block.marginRight || 0}px`,
    paddingLeft: `${block.paddingX || 0}px`,
    paddingRight: `${block.paddingX || 0}px`,
    paddingTop: `${block.paddingY || 0}px`,
    paddingBottom: `${block.paddingY || 0}px`,
    cursor: isDragging ? "grabbing" : "default",
    ...visualStyle,
  };

  if (isPreview) {
    return (
      <div
        style={{
          width: `${block.width}%`,
          minWidth: 0, // Critical: allows flex/grid children to shrink
          marginTop: `${block.marginTop || 0}px`,
          marginBottom: `${block.marginBottom || 0}px`,
          marginLeft: `${block.marginLeft || 0}px`,
          marginRight: `${block.marginRight || 0}px`,
          paddingLeft: `${block.paddingX || 0}px`,
          paddingRight: `${block.paddingX || 0}px`,
          paddingTop: `${block.paddingY || 0}px`,
          paddingBottom: `${block.paddingY || 0}px`,
          ...visualStyle,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-md border transition-[border-color,background-color,box-shadow] duration-200",
        isSelected && ["border-solid", editorStyles.blockSelected],
        isHovered && !isSelected && [
          "border-solid shadow-sm",
          editorStyles.blockHover,
        ],
        !isSelected &&
          !isHovered &&
          "border-dashed border-slate-300/40 hover:border-slate-400/60",
        isDragging && ["z-50", editorStyles.dragOverlay],
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onKeyDown={(e) => {
        // Don't prevent space/enter if user is editing inside the block
        const target = e.target as HTMLElement;
        if (
          target !== e.currentTarget &&
          (target.isContentEditable ||
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA")
        ) {
          return; // Let the editable element handle the key
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          selectBlock(block.id);
        }
      }}
    >
      {/* Enhanced drag handle with better positioning */}
      {(isHovered || isSelected) && !block.locked && (
        <div
          className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "cursor-grab rounded-md p-1.5 text-editor-handle transition-all duration-150 hover:bg-secondary/80 hover:text-foreground active:cursor-grabbing",
                    editorStyles.hoverLift,
                  )}
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Drag to reorder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Enhanced selected actions bar with better styling */}
      {isSelected && (
        <div
          className={cn(
            "absolute -top-11 right-2 z-20 flex items-center gap-1.5 rounded-md border border-editor-border/80 bg-background/95 px-2 py-1.5 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-sm",
            editorStyles.fadeIn,
          )}
        >
          <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Selected
          </span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md hover:bg-secondary/80 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateBlock(block.id);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Duplicate block</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md hover:bg-secondary/80 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBlockWithHistory(block.id, { locked: !block.locked });
                  }}
                >
                  {block.locked ? (
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {block.locked ? "Unlock block" : "Lock block"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(block.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Delete block</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Enhanced lock indicator */}
      {block.locked && (
        <div
          className={cn(
            "absolute -right-2 -top-2 z-10 rounded-full border border-amber-300 bg-amber-100 p-1 shadow-sm",
            editorStyles.fadeIn,
          )}
        >
          <Lock className="h-3 w-3 text-amber-700" />
        </div>
      )}

      {children}
    </div>
  );
});

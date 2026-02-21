import React, { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockWrapper } from "../blocks/BlockWrapper";
import { BlockRenderer } from "../blocks/BlockRenderer";
import { useEditor } from "../EditorContext";
import type { EditorSection, EditorBlock } from "../editorConfig";
import {
  Plus,
  Trash2,
  Columns2,
  Columns3,
  LayoutGrid,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";

interface SectionColumnProps {
  section: EditorSection;
  columnIndex: number;
  blocks: EditorBlock[];
}

const SectionColumn = memo(function SectionColumn({
  section,
  columnIndex,
  blocks,
}: SectionColumnProps) {
  const { state } = useEditor();
  const isPreview = state.isPreviewMode;
  const isCanvasDragging = state.isDragging;
  const droppableId = `${section.id}:${columnIndex}`;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: "column", sectionId: section.id, columnIndex },
    disabled: isPreview,
  });

  const blockIds = blocks.map((b) => b.id);

  return (
    <SortableContext
      items={blockIds}
      strategy={verticalListSortingStrategy}
      id={droppableId}
    >
      <div
        ref={setNodeRef}
        className={`relative min-h-[48px] p-2 rounded-sm ${
          isOver && !isPreview ? "dropzone-indicator" : ""
        } ${!isPreview && blocks.length === 0 ? "border border-dashed border-editor-border/50" : ""}`}
        style={{
          transitionProperty: "background-color, border-color",
          transitionDuration: "var(--transition-fast)",
        }}
      >
        {!isPreview && isCanvasDragging && (
          <div className="absolute top-1 left-2 text-[10px] text-muted-foreground bg-card/80 px-1 py-0.5 rounded pointer-events-none">
            Column {columnIndex + 1}
          </div>
        )}
        {blocks.length === 0 && !isPreview && (
          <div className="flex items-center justify-center h-12 text-xs text-muted-foreground">
            Drop blocks here
          </div>
        )}
        {blocks.map((block) => (
          <BlockWrapper
            key={block.id}
            block={block}
            sectionId={section.id}
            columnIndex={columnIndex}
          >
            <BlockRenderer block={block} />
          </BlockWrapper>
        ))}
      </div>
    </SortableContext>
  );
});

interface SectionContainerProps {
  section: EditorSection;
  index: number;
}

export const SectionContainer = memo(function SectionContainer({
  section,
  index,
}: SectionContainerProps) {
  const { state, removeSection, selectSection, addSection } = useEditor();
  const isPreview = state.isPreviewMode;
  const isCanvasDragging = state.isDragging;
  const isSelected = state.selectedSectionId === section.id;
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const sectionPaddingTop = section.paddingTop ?? 12;
  const sectionPaddingRight = section.paddingRight ?? 12;
  const sectionPaddingBottom = section.paddingBottom ?? 12;
  const sectionPaddingLeft = section.paddingLeft ?? 12;
  const sectionColumnGap = section.columnGap ?? 24;
  const sectionBackground = section.backgroundColor || undefined;
  const sectionTextColor = section.textColor || undefined;
  const sectionSpacing = 24;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: "section", section },
    disabled: isPreview,
  });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : undefined,
  };

  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  };

  const handleDeleteSection = React.useCallback(() => {
    removeSection(section.id);
    setShowDeleteConfirm(false);
    toast.success("Section deleted", {
      description: "The section and all its blocks have been removed.",
    });
  }, [section.id, removeSection]);

  const hasBlocks = (section.blocks ?? []).some((col) => col.length > 0);

  if (isPreview) {
    return (
      <div
        className={`grid ${gridCols[section.columns] || "grid-cols-1"}`}
        style={{
          gap: `${sectionColumnGap}px`,
          paddingTop: `${sectionPaddingTop}px`,
          paddingRight: `${sectionPaddingRight}px`,
          paddingBottom: `${sectionPaddingBottom}px`,
          paddingLeft: `${sectionPaddingLeft}px`,
          backgroundColor: sectionBackground,
          color: sectionTextColor,
          marginBottom: `${sectionSpacing}px`,
        }}
      >
        {(section.blocks ?? []).map((col, ci) => (
          <SectionColumn
            key={`${section.id}-${ci}`}
            section={section}
            columnIndex={ci}
            blocks={col}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...sortableStyle, marginBottom: `${sectionSpacing}px` }}
      className="group/section relative"
    >
      {/* Section header */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-t-md border border-b-0 cursor-pointer ${
          isSelected
            ? "bg-editor-selected-bg border-editor-selected/30"
            : "bg-muted/30 border-editor-border/50 hover:bg-muted/50"
        }`}
        style={{
          transitionProperty: "background-color, border-color",
          transitionDuration: "var(--transition-fast)",
        }}
        onClick={() => selectSection(section.id)}
      >
        <div className="flex items-center gap-2">
          {/* Section drag handle */}
          <button
            className="p-0.5 rounded-sm hover:bg-secondary cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover/section:opacity-100"
            style={{
              transitionProperty: "opacity, background-color, color",
              transitionDuration: "var(--transition-fast)",
            }}
            title="Drag to reorder section"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Section · {section.columns}{" "}
            {section.columns === 1 ? "Column" : "Columns"}
          </span>
          {!isPreview && (
            <span className={`text-[10px] text-muted-foreground ${isCanvasDragging ? "" : "opacity-70"}`}>
              Drag & drop blocks into columns
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100"
          style={{
            transitionProperty: "opacity",
            transitionDuration: "var(--transition-fast)",
          }}
        >
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                Remove section
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Grid */}
      <div
        className={`grid ${gridCols[section.columns] || "grid-cols-1"} border rounded-b-md ${
          isSelected ? "border-editor-selected/30" : "border-editor-border/50"
        }`}
        style={{
          gap: `${sectionColumnGap}px`,
          paddingTop: `${sectionPaddingTop}px`,
          paddingRight: `${sectionPaddingRight}px`,
          paddingBottom: `${sectionPaddingBottom}px`,
          paddingLeft: `${sectionPaddingLeft}px`,
          backgroundColor: sectionBackground,
          color: sectionTextColor,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            selectSection(section.id);
          }
        }}
      >
        {(section.blocks ?? []).map((col, ci) => (
          <SectionColumn
            key={`${section.id}-${ci}`}
            section={section}
            columnIndex={ci}
            blocks={col}
          />
        ))}
      </div>

      {/* Add section between */}
      <div
        className="flex items-center justify-center py-1 opacity-0 group-hover/section:opacity-100"
        style={{
          transitionProperty: "opacity",
          transitionDuration: "var(--transition-fast)",
        }}
      >
        <div className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-0.5 shadow-sm">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  style={{
                    transitionProperty: "background-color, color",
                    transitionDuration: "var(--transition-fast)",
                  }}
                  onClick={() => addSection(1, index + 1)}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">1 Column</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  style={{
                    transitionProperty: "background-color, color",
                    transitionDuration: "var(--transition-fast)",
                  }}
                  onClick={() => addSection(2, index + 1)}
                >
                  <Columns2 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">2 Columns</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
                  style={{
                    transitionProperty: "background-color, color",
                    transitionDuration: "var(--transition-fast)",
                  }}
                  onClick={() => addSection(3, index + 1)}
                >
                  <Columns3 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">3 Columns</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Section"
        description={
          hasBlocks
            ? "This section contains blocks. Are you sure you want to delete it? All blocks in this section will be permanently removed."
            : "Are you sure you want to delete this section?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteSection}
      />
    </div>
  );
});

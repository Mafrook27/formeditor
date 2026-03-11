import React, { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { BlockWrapper, BlockRenderer } from "../blocks";
import { useEditor } from "../EditorContext";
import type { EditorSection, EditorBlock } from "../editorConfig";
import {
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
import { ConfirmDialog } from "../components";
import { toast } from "sonner";
import editorStyles from "../editor.module.css";

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
        className={cn(
          "relative min-h-[48px] rounded-lg p-3 transition-all duration-200",
          isOver && !isPreview && editorStyles.dropzoneIndicator,
          !isPreview &&
            blocks.length === 0 &&
            "border-2 border-dashed border-editor-border/50 hover:border-editor-border/80 hover:bg-editor-hover/30",
        )}
      >
        {blocks.length === 0 && !isPreview && (
          <div className="flex flex-col items-center justify-center h-16 text-center">
            <div className="text-xs text-muted-foreground font-medium mb-1">
              Drop blocks here
            </div>
            <div className="text-xs text-muted-foreground/70">
              Drag from library or move existing blocks
            </div>
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
      {/* Enhanced section header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-t-lg border border-b-0 cursor-pointer transition-all duration-200 ${
          isSelected
            ? "bg-editor-selected-bg border-editor-selected/40 shadow-sm"
            : "bg-muted/20 border-editor-border/50 hover:bg-muted/40 hover:border-editor-border/80"
        }`}
        onClick={(e) => { e.stopPropagation(); selectSection(section.id); }}
      >
        <div className="flex items-center gap-3">
          {/* Enhanced section drag handle */}
          <button
            className={cn(
              "cursor-grab rounded-md p-1 text-muted-foreground opacity-0 transition-all duration-200 hover:bg-secondary/80 hover:text-foreground group-hover/section:opacity-100 active:cursor-grabbing",
              editorStyles.hoverLift,
            )}
            title="Drag to reorder section"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
              <LayoutGrid className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">
                Section
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{section.columns} {section.columns === 1 ? "Column" : "Columns"}</span>
                {hasBlocks && (
                  <>
                    <span>•</span>
                    <span>{(section.blocks ?? []).reduce((sum, col) => sum + col.length, 0)} blocks</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200"
        >
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                Delete section
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Enhanced Grid */}
      <div
        className={`grid ${gridCols[section.columns] || "grid-cols-1"} border rounded-b-lg transition-all duration-200 ${
          isSelected ? "border-editor-selected/40 shadow-sm" : "border-editor-border/50 hover:border-editor-border/80"
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
          e.stopPropagation();
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

      {/* Enhanced add section between with better styling */}
      <div
        className="flex items-center justify-center py-2 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200"
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm",
            editorStyles.hoverLift,
          )}
        >
          <span className="text-xs text-muted-foreground font-medium">Add section:</span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1.5 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-150"
                  onClick={() => addSection(1, index + 1)}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Single Column</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1.5 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-150"
                  onClick={() => addSection(2, index + 1)}
                >
                  <Columns2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Two Columns</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1.5 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-150"
                  onClick={() => addSection(3, index + 1)}
                >
                  <Columns3 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Three Columns</TooltipContent>
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

import React, { useCallback, useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { useEditor } from "./EditorContext";
import { TopToolbar, BlockLibrary } from "./toolbar";
import { InspectorPanel } from "./inspector";
import { SectionContainer } from "./sections";
import { BlockRenderer } from "./blocks";
import {
  getDefaultBlockProps,
  type BlockType,
  type EditorBlock,
} from "./editorConfig";
import { exportToHTML } from "./export";
import { Plus, Columns2, Columns3, LayoutGrid } from "lucide-react";
import editorStyles from "./editor.module.css";

export function EditorLayout() {
  const {
    state,
    addBlock,
    moveBlock,
    reorderBlocks,
    reorderSections,
    setDragging,
    selectBlock,
    addSection,
  } = useEditor();
  const { sections, isPreviewMode, zoom } = state;
  const [activeBlock, setActiveBlock] = useState<EditorBlock | null>(null);
  const [activeSectionCols, setActiveSectionCols] = useState<1 | 2 | 3 | null>(
    null,
  );
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setDragging(true);

      // Store the active block data for DragOverlay
      const activeData = event.active.data.current;
      if (activeData?.type === "block" && activeData.block) {
        setActiveBlock(activeData.block as EditorBlock);
      } else if (activeData?.type === "library-block" && activeData.blockType) {
        // Use full default props so BlockRenderer never receives an incomplete block
        setActiveBlock(getDefaultBlockProps(activeData.blockType as BlockType));
      } else if (activeData?.type === "library-section" && activeData.columns) {
        setActiveSectionCols(activeData.columns as 1 | 2 | 3);
      }
    },
    [setDragging],
  );

  const handleDragCancel = useCallback(() => {
    setDragging(false);
    setActiveBlock(null);
    setActiveSectionCols(null);
  },
    [setDragging],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragging(false);
      setActiveBlock(null);
      setActiveSectionCols(null);

      const { active, over } = event;
      const activeData = active.data.current;
      const overData = over?.data.current;

      // Allow creating a section even if dropped on empty canvas
      if (!over && activeData?.type === "library-section") {
        addSection(activeData.columns as 1 | 2 | 3);
        return;
      }

      if (!over) return;

      // Dropping a layout section from the library
      if (activeData?.type === "library-section") {
        const columns = activeData.columns as 1 | 2 | 3;

        if (overData?.type === "section") {
          const targetIndex = sections.findIndex((s) => s.id === over.id);
          addSection(columns, targetIndex !== -1 ? targetIndex : undefined);
        } else if (overData?.type === "column") {
          const targetIndex = sections.findIndex(
            (s) => s.id === overData.sectionId,
          );
          addSection(columns, targetIndex !== -1 ? targetIndex : undefined);
        } else if (overData?.type === "block") {
          const targetIndex = sections.findIndex(
            (s) => s.id === overData.sectionId,
          );
          addSection(columns, targetIndex !== -1 ? targetIndex : undefined);
        } else {
          addSection(columns);
        }
        return;
      }

      // Section reordering
      if (activeData?.type === "section") {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderSections(oldIndex, newIndex);
        }
        return;
      }

      // Dropping from library
      if (activeData?.type === "library-block") {
        const blockType = activeData.blockType as BlockType;
        // Determine target column
        if (overData?.type === "column") {
          addBlock(blockType, overData.sectionId, overData.columnIndex);
        } else if (overData?.type === "block" && overData.block) {
          // Drop on existing block - find its location
          const targetBlock = overData.block as EditorBlock;
          for (const section of sections) {
            for (let ci = 0; ci < section.blocks.length; ci++) {
              const idx = section.blocks[ci].findIndex(
                (b) => b.id === targetBlock.id,
              );
              if (idx !== -1) {
                addBlock(blockType, section.id, ci, idx);
                return;
              }
            }
          }
        } else if (sections.length > 0) {
          // Fallback: drop in first column of first section
          addBlock(blockType, sections[0].id, 0);
        }
        return;
      }

      // Reordering existing blocks
      if (activeData?.type === "block" && overData && activeData.block) {
        const activeBlock = activeData.block as EditorBlock;
        const activeSectionId = activeData.sectionId as string;
        const activeColumnIndex = activeData.columnIndex as number;

        if (overData.type === "column") {
          // Move to a column
          moveBlock(activeBlock.id, overData.sectionId, overData.columnIndex);
        } else if (overData.type === "block" && overData.block) {
          const overBlock = overData.block as EditorBlock;
          const overSectionId = overData.sectionId;
          const overColumnIndex = overData.columnIndex;

          if (
            activeSectionId === overSectionId &&
            activeColumnIndex === overColumnIndex
          ) {
            // Same column - reorder
            const col =
              sections.find((s) => s.id === activeSectionId)?.blocks[
                activeColumnIndex
              ] || [];
            const oldIndex = col.findIndex((b) => b.id === activeBlock.id);
            const newIndex = col.findIndex((b) => b.id === overBlock.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
              reorderBlocks(
                activeSectionId,
                activeColumnIndex,
                oldIndex,
                newIndex,
              );
            }
          } else {
            // Different column - move
            const targetCol =
              sections.find((s) => s.id === overSectionId)?.blocks[
                overColumnIndex
              ] || [];
            const toIndex = targetCol.findIndex((b) => b.id === overBlock.id);
            moveBlock(
              activeBlock.id,
              overSectionId,
              overColumnIndex,
              toIndex !== -1 ? toIndex : undefined,
            );
          }
        }
      }
    },
    [
      sections,
      addBlock,
      moveBlock,
      reorderBlocks,
      reorderSections,
      setDragging,
      addSection,
    ],
  );

  // Custom collision detection for better drop targeting
  const collisionDetection = useCallback((args: any) => {
    // First, try pointer-based collision for more precise targeting
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Fallback to rectangle intersection
    const intersectionCollisions = rectIntersection(args);
    if (intersectionCollisions.length > 0) {
      return intersectionCollisions;
    }

    // Final fallback to closest center
    return closestCenter(args);
  }, []);

  const canvasScale = zoom / 100;

  return (
    <div className="flex flex-col h-screen bg-editor-bg">
      <TopToolbar viewport={viewport} onViewportChange={setViewport} />
      <div className="flex flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {!isPreviewMode && <BlockLibrary />}

          {/* Canvas */}
          <div
            className={cn(
              "flex-1 overflow-auto bg-editor-bg",
              editorStyles.scrollArea,
            )}
            role="region"
            aria-label="Form editor canvas"
            tabIndex={0}
            onClick={() => !isPreviewMode && selectBlock(null)}
            onKeyDown={(e) => {
              if (isPreviewMode) return;
              const target = e.target as HTMLElement;
              if (
                target.isContentEditable ||
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA"
              ) {
                return;
              }
              
              // Enhanced keyboard navigation
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectBlock(null);
              }
              
              // Quick section creation shortcuts
              if (e.key === "1" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                addSection(1);
              }
              if (e.key === "2" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                addSection(2);
              }
              if (e.key === "3" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                addSection(3);
              }
            }}
          >
            {isPreviewMode ? (
              <div className="flex justify-center py-8 px-4 h-full">
                <iframe
                  srcDoc={exportToHTML(sections)}
                  title="Preview"
                  style={{
                    width:
                      viewport === "mobile"
                        ? "375px"
                        : viewport === "tablet"
                          ? "768px"
                          : "100%",
                    maxWidth: "860px",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    background: "white",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center py-8 px-4">
                <div
                  className={cn(
                    "w-full max-w-[800px] rounded-lg bg-editor-canvas p-10",
                    editorStyles.canvasPage,
                  )}
                  style={{
                    transform: `scale(${canvasScale})`,
                    transformOrigin: "top center",
                  }}
                >
                  {sections.length === 0 && !isPreviewMode && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-sm border border-primary/10">
                        <LayoutGrid className="h-10 w-10 text-primary/60" />
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-3">
                        Start Building Your Form
                      </h3>
                      <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
                        Create professional agreement forms by adding sections and dragging blocks from the library. 
                        Choose your layout and customize every detail.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => addSection(1)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90",
                            editorStyles.hoverLift,
                          )}
                        >
                          <LayoutGrid className="h-4 w-4" /> Single Column
                        </button>
                        <button
                          onClick={() => addSection(2)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm transition-all duration-200 hover:bg-secondary/80",
                            editorStyles.hoverLift,
                          )}
                        >
                          <Columns2 className="h-4 w-4" /> Two Columns
                        </button>
                        <button
                          onClick={() => addSection(3)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm transition-all duration-200 hover:bg-secondary/80",
                            editorStyles.hoverLift,
                          )}
                        >
                          <Columns3 className="h-4 w-4" /> Three Columns
                        </button>
                      </div>
                      <div className="mt-6 text-xs text-muted-foreground">
                        💡 Tip: You can also drag layout sections from the left panel
                      </div>
                    </div>
                  )}

                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sections.map((section, index) => (
                      <SectionContainer
                        key={section.id}
                        section={section}
                        index={index}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}
          </div>

          {!isPreviewMode && <InspectorPanel />}

          {/* Enhanced DragOverlay for smooth dragging experience */}
          <DragOverlay
            dropAnimation={{
              duration: 300,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeBlock ? (
              <div
                className={cn(
                  "rounded-lg border-2 border-primary/50 bg-card opacity-90 shadow-2xl backdrop-blur-sm",
                  editorStyles.dragOverlay,
                )}
              >
                <BlockRenderer block={activeBlock} />
              </div>
            ) : activeSectionCols ? (
              <div
                className={cn(
                  "w-[280px] rounded-lg border-2 border-primary/50 bg-card p-4 opacity-90 shadow-2xl backdrop-blur-sm",
                  editorStyles.dragOverlay,
                )}
              >
                <div
                  className={`grid ${
                    activeSectionCols === 1
                      ? "grid-cols-1"
                      : activeSectionCols === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  } gap-3`}
                >
                  {Array.from({ length: activeSectionCols }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-14 rounded-md border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center"
                    >
                      <div className="w-8 h-1 bg-primary/30 rounded-full"></div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground text-center font-medium">
                  New Section · {activeSectionCols} Column{activeSectionCols > 1 ? 's' : ''}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

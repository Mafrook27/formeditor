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
  type DragCancelEvent,
  type DragOverEvent,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEditor } from "./EditorContext";
import { TopToolbar } from "./toolbar/TopToolbar";
import { BlockLibrary } from "./toolbar/BlockLibrary";
import { InspectorPanel } from "./inspector/InspectorPanel";
import { SectionContainer } from "./sections/SectionContainer";
import { BlockRenderer } from "./blocks/BlockRenderer";
import {
  getDefaultBlockProps,
  type BlockType,
  type EditorBlock,
} from "./editorConfig";
import { exportToHTML } from "./export/exportToHTML";
import { Plus, Columns2, Columns3, LayoutGrid } from "lucide-react";

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
    findBlock,
  } = useEditor();
  const { sections, isPreviewMode, zoom } = state;
  const [activeId, setActiveId] = useState<string | null>(null);
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
        distance: 8, // Increased to prevent accidental drags
        delay: 100, // Small delay to distinguish clicks from drags
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setDragging(true);
      setActiveId(event.active.id as string);

      // Store the active block data for DragOverlay
      const activeData = event.active.data.current;
      if (activeData?.type === "block") {
        setActiveBlock(activeData.block);
      } else if (activeData?.type === "library-block") {
        // Use full default props so BlockRenderer never receives an incomplete block
        setActiveBlock(getDefaultBlockProps(activeData.blockType as BlockType));
      } else if (activeData?.type === "library-section") {
        setActiveSectionCols(activeData.columns as 1 | 2 | 3);
      }
    },
    [setDragging],
  );

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      setDragging(false);
      setActiveId(null);
      setActiveBlock(null);
      setActiveSectionCols(null);
    },
    [setDragging],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragging(false);
      setActiveId(null);
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
        } else if (overData?.type === "block") {
          // Drop on existing block - find its location
          const targetBlock = overData.block;
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
      if (activeData?.type === "block" && overData) {
        const activeBlock = activeData.block;
        const activeSectionId = activeData.sectionId;
        const activeColumnIndex = activeData.columnIndex;

        if (overData.type === "column") {
          // Move to a column
          moveBlock(activeBlock.id, overData.sectionId, overData.columnIndex);
        } else if (overData.type === "block") {
          const overBlock = overData.block;
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
            className="flex-1 overflow-auto editor-scrollbar bg-editor-bg"
            role="region"
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
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectBlock(null);
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
                  className="w-full max-w-[800px] bg-editor-canvas rounded-lg canvas-page p-10"
                  style={{
                    transform: `scale(${canvasScale})`,
                    transformOrigin: "top center",
                  }}
                >
                  {sections.length === 0 && !isPreviewMode && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-heading font-semibold text-foreground mb-2">
                        Start Building Your Form
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        Add a section from the left panel, then drag blocks into
                        it to build your agreement form.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addSection(1)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90"
                          style={{
                            transitionProperty: "opacity",
                            transitionDuration: "var(--transition-fast)",
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" /> 1 Column
                        </button>
                        <button
                          onClick={() => addSection(2)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          style={{
                            transitionProperty: "background-color",
                            transitionDuration: "var(--transition-fast)",
                          }}
                        >
                          <Columns2 className="h-3.5 w-3.5" /> 2 Columns
                        </button>
                        <button
                          onClick={() => addSection(3)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          style={{
                            transitionProperty: "background-color",
                            transitionDuration: "var(--transition-fast)",
                          }}
                        >
                          <Columns3 className="h-3.5 w-3.5" /> 3 Columns
                        </button>
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

          {/* DragOverlay for smooth dragging experience */}
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeBlock ? (
              <div className="opacity-80 shadow-2xl rounded-md bg-card border-2 border-primary">
                <BlockRenderer block={activeBlock} />
              </div>
            ) : activeSectionCols ? (
              <div className="opacity-80 shadow-2xl rounded-md bg-card border-2 border-primary p-3 w-[260px]">
                <div
                  className={`grid ${
                    activeSectionCols === 1
                      ? "grid-cols-1"
                      : activeSectionCols === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                  } gap-2`}
                >
                  {Array.from({ length: activeSectionCols }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 rounded border border-dashed border-primary/50 bg-primary/5"
                    />
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground text-center">
                  New Section · {activeSectionCols} Columns
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

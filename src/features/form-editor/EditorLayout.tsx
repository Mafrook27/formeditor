import React, { useCallback, useState } from 'react';
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
  type Active,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEditor } from './EditorContext';
import { TopToolbar } from './toolbar/TopToolbar';
import { BlockLibrary } from './toolbar/BlockLibrary';
import { InspectorPanel } from './inspector/InspectorPanel';
import { SectionContainer } from './sections/SectionContainer';
import { BlockRenderer } from './blocks/BlockRenderer';
import { getDefaultBlockProps, type BlockType } from './editorConfig';
import { Plus, Columns2, Columns3, LayoutGrid } from 'lucide-react';

export function EditorLayout() {
  const { state, addBlock, moveBlock, reorderBlocks, setDragging, selectBlock, addSection } = useEditor();
  const { sections, isPreviewMode, zoom } = state;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 8, // Slightly increased to prevent accidental drags
      } 
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragging(true);
    setActiveId(event.active.id as string);
  }, [setDragging]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDragging(false);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Dropping from library
    if (activeData?.type === 'library-block') {
      const blockType = activeData.blockType as BlockType;
      // Determine target column
      if (overData?.type === 'column') {
        addBlock(blockType, overData.sectionId, overData.columnIndex);
      } else if (overData?.type === 'block') {
        // Drop on existing block - find its location
        const targetBlock = overData.block;
        for (const section of sections) {
          for (let ci = 0; ci < section.blocks.length; ci++) {
            const idx = section.blocks[ci].findIndex(b => b.id === targetBlock.id);
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
    if (activeData?.type === 'block' && overData) {
      const activeBlock = activeData.block;
      const activeSectionId = activeData.sectionId;
      const activeColumnIndex = activeData.columnIndex;

      if (overData.type === 'column') {
        // Move to a column
        moveBlock(activeBlock.id, overData.sectionId, overData.columnIndex);
      } else if (overData.type === 'block') {
        const overBlock = overData.block;
        const overSectionId = overData.sectionId;
        const overColumnIndex = overData.columnIndex;

        if (activeSectionId === overSectionId && activeColumnIndex === overColumnIndex) {
          // Same column - reorder
          const col = sections.find(s => s.id === activeSectionId)?.blocks[activeColumnIndex] || [];
          const oldIndex = col.findIndex(b => b.id === activeBlock.id);
          const newIndex = col.findIndex(b => b.id === overBlock.id);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            reorderBlocks(activeSectionId, activeColumnIndex, oldIndex, newIndex);
          }
        } else {
          // Different column - move
          const targetCol = sections.find(s => s.id === overSectionId)?.blocks[overColumnIndex] || [];
          const toIndex = targetCol.findIndex(b => b.id === overBlock.id);
          moveBlock(activeBlock.id, overSectionId, overColumnIndex, toIndex !== -1 ? toIndex : undefined);
        }
      }
    }
  }, [sections, addBlock, moveBlock, reorderBlocks, setDragging]);

  const canvasScale = zoom / 100;

  return (
    <div className="flex flex-col h-screen bg-editor-bg">
      <TopToolbar />
      <div className="flex flex-1 overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {!isPreviewMode && <BlockLibrary />}

          {/* Canvas */}
          <div className="flex-1 overflow-auto editor-scrollbar bg-editor-bg" onClick={() => selectBlock(null)}>
            <div className="flex justify-center py-8 px-4">
              <div
                className="w-full max-w-[800px] bg-editor-canvas rounded-lg canvas-page p-10"
                style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top center' }}
              >
                {sections.length === 0 && !isPreviewMode && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-heading font-semibold text-foreground mb-2">Start Building Your Form</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                      Add a section from the left panel, then drag blocks into it to build your agreement form.
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => addSection(1)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90" style={{ transitionProperty: 'opacity', transitionDuration: 'var(--transition-fast)' }}>
                        <Plus className="h-3.5 w-3.5" /> 1 Column
                      </button>
                      <button onClick={() => addSection(2)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80" style={{ transitionProperty: 'background-color', transitionDuration: 'var(--transition-fast)' }}>
                        <Columns2 className="h-3.5 w-3.5" /> 2 Columns
                      </button>
                      <button onClick={() => addSection(3)} className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80" style={{ transitionProperty: 'background-color', transitionDuration: 'var(--transition-fast)' }}>
                        <Columns3 className="h-3.5 w-3.5" /> 3 Columns
                      </button>
                    </div>
                  </div>
                )}

                {sections.map((section, index) => (
                  <SectionContainer key={section.id} section={section} index={index} />
                ))}
              </div>
            </div>
          </div>

          {!isPreviewMode && <InspectorPanel />}
        </DndContext>
      </div>
    </div>
  );
}

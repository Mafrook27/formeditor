import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BlockWrapper } from '../blocks/BlockWrapper';
import { BlockRenderer } from '../blocks/BlockRenderer';
import { useEditor } from '../EditorContext';
import type { EditorSection, EditorBlock } from '../editorConfig';
import { Plus, Trash2, Columns2, Columns3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface SectionColumnProps {
  section: EditorSection;
  columnIndex: number;
  blocks: EditorBlock[];
}

const SectionColumn = memo(function SectionColumn({ section, columnIndex, blocks }: SectionColumnProps) {
  const { state } = useEditor();
  const isPreview = state.isPreviewMode;
  const droppableId = `${section.id}:${columnIndex}`;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: 'column', sectionId: section.id, columnIndex },
    disabled: isPreview,
  });

  const blockIds = blocks.map(b => b.id);

  return (
    <SortableContext items={blockIds} strategy={verticalListSortingStrategy} id={droppableId}>
      <div
        ref={setNodeRef}
        className={`min-h-[48px] p-2 rounded-sm ${
          isOver && !isPreview ? 'dropzone-indicator' : ''
        } ${!isPreview && blocks.length === 0 ? 'border border-dashed border-editor-border/50' : ''}`}
        style={{ transitionProperty: 'background-color, border-color', transitionDuration: 'var(--transition-fast)' }}
      >
        {blocks.length === 0 && !isPreview && (
          <div className="flex items-center justify-center h-12 text-xs text-muted-foreground">Drop blocks here</div>
        )}
        {blocks.map((block) => (
          <BlockWrapper key={block.id} block={block} sectionId={section.id} columnIndex={columnIndex}>
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

export const SectionContainer = memo(function SectionContainer({ section, index }: SectionContainerProps) {
  const { state, removeSection, selectSection, addSection } = useEditor();
  const isPreview = state.isPreviewMode;
  const isSelected = state.selectedSectionId === section.id;

  const gridCols: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

  if (isPreview) {
    return (
      <div className={`grid ${gridCols[section.columns] || 'grid-cols-1'} gap-6 mb-6`}>
        {section.blocks.map((col, ci) => (
          <SectionColumn key={`${section.id}-${ci}`} section={section} columnIndex={ci} blocks={col} />
        ))}
      </div>
    );
  }

  return (
    <div className="group/section relative mb-4">
      {/* Section header */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-t-md border border-b-0 cursor-pointer ${
          isSelected ? 'bg-editor-selected-bg border-editor-selected/30' : 'bg-muted/30 border-editor-border/50 hover:bg-muted/50'
        }`}
        style={{ transitionProperty: 'background-color, border-color', transitionDuration: 'var(--transition-fast)' }}
        onClick={() => selectSection(section.id)}
      >
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Section · {section.columns} {section.columns === 1 ? 'Column' : 'Columns'}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100" style={{ transitionProperty: 'opacity', transitionDuration: 'var(--transition-fast)' }}>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Remove section</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid ${gridCols[section.columns] || 'grid-cols-1'} gap-4 p-3 border rounded-b-md ${
        isSelected ? 'border-editor-selected/30' : 'border-editor-border/50'
      }`}>
        {section.blocks.map((col, ci) => (
          <SectionColumn key={`${section.id}-${ci}`} section={section} columnIndex={ci} blocks={col} />
        ))}
      </div>

      {/* Add section between */}
      <div className="flex items-center justify-center py-1 opacity-0 group-hover/section:opacity-100" style={{ transitionProperty: 'opacity', transitionDuration: 'var(--transition-fast)' }}>
        <div className="flex items-center gap-1 bg-card border border-border rounded-full px-2 py-0.5 shadow-sm">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground" style={{ transitionProperty: 'background-color, color', transitionDuration: 'var(--transition-fast)' }} onClick={() => addSection(1, index + 1)}>
                  <Plus className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">1 Column</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground" style={{ transitionProperty: 'background-color, color', transitionDuration: 'var(--transition-fast)' }} onClick={() => addSection(2, index + 1)}>
                  <Columns2 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">2 Columns</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground" style={{ transitionProperty: 'background-color, color', transitionDuration: 'var(--transition-fast)' }} onClick={() => addSection(3, index + 1)}>
                  <Columns3 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">3 Columns</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
});

import React, { memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor } from '../EditorContext';
import type { EditorBlock } from '../editorConfig';
import { GripVertical, Copy, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface BlockWrapperProps {
  block: EditorBlock;
  sectionId: string;
  columnIndex: number;
  children: React.ReactNode;
}

export const BlockWrapper = memo(function BlockWrapper({ block, sectionId, columnIndex, children }: BlockWrapperProps) {
  const { state, selectBlock, removeBlock, duplicateBlock, updateBlockWithHistory } = useEditor();
  const isSelected = state.selectedBlockId === block.id;
  const isPreview = state.isPreviewMode;
  const [isHovered, setIsHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: 'block', block, sectionId, columnIndex },
    disabled: isPreview || block.locked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
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
    cursor: isDragging ? 'grabbing' : 'default',
  };

  if (isPreview) {
    return (
      <div style={{
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
      }}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-sm border-2 ${
        isSelected 
          ? 'block-selected border-primary' 
          : isHovered 
            ? 'block-hover border-primary/30' 
            : 'border-dashed border-gray-300/40'
      } ${isDragging ? 'z-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
      onKeyDown={(e) => { 
        // Don't prevent space/enter if user is editing inside the block
        const target = e.target as HTMLElement;
        if (target !== e.currentTarget && (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return; // Let the editable element handle the key
        }
        if (e.key === 'Enter' || e.key === ' ') { 
          e.preventDefault(); 
          e.stopPropagation(); 
          selectBlock(block.id); 
        } 
      }}
    >
      {/* Drag handle */}
      {(isHovered || isSelected) && !block.locked && (
        <div className="absolute -left-8 top-0 flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100" style={{ transitionProperty: 'opacity', transitionDuration: 'var(--transition-fast)' }}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-0.5 rounded-sm hover:bg-secondary cursor-grab active:cursor-grabbing text-editor-handle hover:text-foreground"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">Drag to reorder</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Selected actions bar */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex items-center gap-1 bg-card border border-border rounded-md shadow-sm px-1 py-0.5 animate-fade-in z-10">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Duplicate</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); updateBlockWithHistory(block.id, { locked: !block.locked }); }}>
                  {block.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">{block.locked ? 'Unlock' : 'Lock'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Lock indicator */}
      {block.locked && (
        <div className="absolute -right-2 -top-2 bg-warning rounded-full p-0.5 shadow-sm z-10">
          <Lock className="h-3 w-3 text-warning-foreground" />
        </div>
      )}

      {children}
    </div>
  );
});

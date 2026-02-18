import React, { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BLOCK_LIBRARY, BLOCK_CATEGORIES, type BlockLibraryItem } from '../editorConfig';
import { useEditor } from '../EditorContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Columns2, Columns3, LayoutGrid } from 'lucide-react';
import {
  Heading, AlignLeft, Minus, Image, TextCursorInput, FileText,
  ChevronDown, CircleDot, CheckSquare, Square, Calendar, Upload, PenTool,
  Table2, List, MousePointerClick,
  type LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Heading, AlignLeft, Minus, Image, TextCursorInput, FileText,
  ChevronDown, CircleDot, CheckSquare, Square, Calendar, Upload, PenTool,
  Table2, List, MousePointerClick
};

const DraggableBlock = memo(function DraggableBlock({ item }: { item: BlockLibraryItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${item.type}`,
    data: { type: 'library-block', blockType: item.type },
  });

  const Icon = iconMap[item.icon] || Heading;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-grab active:cursor-grabbing border border-transparent hover:bg-editor-hover hover:border-editor-border/50 ${isDragging ? 'opacity-50' : ''}`}
      style={{ transitionProperty: 'background-color, border-color', transitionDuration: 'var(--transition-fast)' }}
    >
      <div className="flex items-center justify-center h-7 w-7 rounded-md bg-secondary text-secondary-foreground flex-shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-medium text-foreground">{item.label}</span>
    </div>
  );
});

export function BlockLibrary() {
  const { addSection, state } = useEditor();
  const isPreview = state.isPreviewMode;

  if (isPreview) return null;

  const contentBlocks = BLOCK_LIBRARY.filter(b => b.category === BLOCK_CATEGORIES.CONTENT);
  const formBlocks = BLOCK_LIBRARY.filter(b => b.category === BLOCK_CATEGORIES.FORM);

  return (
    <div className="w-60 bg-editor-sidebar border-r border-editor-border flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocks</h2>
      </div>
      <ScrollArea className="flex-1 px-2 editor-scrollbar">
        {/* Sections */}
        <div className="mb-4">
          <h3 className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Layout Sections</h3>
          <div className="space-y-0.5">
            {[
              { cols: 1 as const, icon: LayoutGrid, label: '1 Column' },
              { cols: 2 as const, icon: Columns2, label: '2 Columns' },
              { cols: 3 as const, icon: Columns3, label: '3 Columns' },
            ].map(({ cols, icon: SIcon, label }) => (
              <button
                key={cols}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md hover:bg-editor-hover text-left"
                style={{ transitionProperty: 'background-color', transitionDuration: 'var(--transition-fast)' }}
                onClick={() => addSection(cols)}
              >
                <div className="flex items-center justify-center h-7 w-7 rounded-md bg-secondary text-secondary-foreground flex-shrink-0">
                  <SIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="mb-4">
          <h3 className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</h3>
          <div className="space-y-0.5">
            {contentBlocks.map(item => <DraggableBlock key={item.type} item={item} />)}
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="mb-4">
          <h3 className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Form Fields</h3>
          <div className="space-y-0.5">
            {formBlocks.map(item => <DraggableBlock key={item.type} item={item} />)}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

import React, { memo, useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import {
  BLOCK_LIBRARY,
  BLOCK_CATEGORIES,
  type BlockLibraryItem,
} from "../editorConfig";
import { useEditor } from "../EditorContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Columns2, Columns3, LayoutGrid, Search } from "lucide-react";
import {
  Heading,
  AlignLeft,
  Minus,
  Image,
  TextCursorInput,
  FileText,
  ChevronDown,
  CircleDot,
  CheckSquare,
  Square,
  Calendar,
  Upload,
  PenTool,
  Table2,
  List,
  MousePointerClick,
  Link,
  type LucideIcon,
} from "lucide-react";
import editorStyles from "../editor.module.css";

const iconMap: Record<string, LucideIcon> = {
  Heading,
  AlignLeft,
  Link,
  Minus,
  Image,
  TextCursorInput,
  FileText,
  ChevronDown,
  CircleDot,
  CheckSquare,
  Square,
  Calendar,
  Upload,
  PenTool,
  Table2,
  List,
  MousePointerClick,
};

const DraggableBlock = memo(function DraggableBlock({
  item,
}: {
  item: BlockLibraryItem;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${item.type}`,
    data: { type: "library-block", blockType: item.type },
  });

  const Icon = iconMap[item.icon] || Heading;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex cursor-grab items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-editor-border/50 hover:bg-editor-hover hover:shadow-sm active:cursor-grabbing",
        editorStyles.hoverLift,
        isDragging && "scale-95 opacity-50",
      )}
    >
      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground flex-shrink-0 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:text-primary transition-all duration-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-foreground block truncate">
          {item.label}
        </span>
        <span className="text-[10px] text-muted-foreground capitalize">
          {item.category}
        </span>
      </div>
    </div>
  );
});

const DraggableSection = memo(function DraggableSection({
  cols,
  label,
  icon: SIcon,
  onClick,
}: {
  cols: 1 | 2 | 3;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:section:${cols}`,
    data: { type: "library-section", columns: cols },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex w-full cursor-grab items-center gap-2.5 rounded-md px-3 py-2 text-left hover:bg-editor-hover active:cursor-grabbing",
        editorStyles.hoverLift,
        isDragging && "opacity-50",
      )}
      style={{
        transitionProperty: "background-color",
        transitionDuration: "var(--transition-fast)",
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-center h-7 w-7 rounded-md bg-secondary text-secondary-foreground flex-shrink-0">
        <SIcon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
});

export function BlockLibrary() {
  const { addSection, state } = useEditor();
  const isPreview = state.isPreviewMode;
  const [searchTerm, setSearchTerm] = useState("");

  if (isPreview) return null;

  const filteredBlocks = useMemo(() => {
    if (!searchTerm) return BLOCK_LIBRARY;
    
    return BLOCK_LIBRARY.filter(block =>
      block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const contentBlocks = filteredBlocks.filter(
    (b) => b.category === BLOCK_CATEGORIES.CONTENT,
  );
  const formBlocks = filteredBlocks.filter(
    (b) => b.category === BLOCK_CATEGORIES.FORM,
  );

  return (
    <div className="w-[17.5rem] min-w-[17.5rem] bg-editor-sidebar/95 border-r border-editor-border flex flex-col h-full backdrop-blur-sm">
      <div className="px-4 pt-5 pb-4 border-b border-editor-border/50">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Block Library
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Drag & Drop to Canvas
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50 border-editor-border/50 focus:border-primary/50"
          />
        </div>
      </div>
      
      <ScrollArea className={cn("flex-1 px-3 py-3", editorStyles.scrollArea)}>
        {/* Sections */}
        <div className="mb-5">
          <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Layouts
          </h3>
          <div className="space-y-1">
            {[
              { cols: 1 as const, icon: LayoutGrid, label: "Single Column" },
              { cols: 2 as const, icon: Columns2, label: "Two Columns" },
              { cols: 3 as const, icon: Columns3, label: "Three Columns" },
            ].map(({ cols, icon: SIcon, label }) => (
              <DraggableSection
                key={cols}
                cols={cols}
                icon={SIcon}
                label={label}
                onClick={() => addSection(cols)}
              />
            ))}
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Content Blocks */}
        {contentBlocks.length > 0 && (
          <div className="mb-5">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Content Elements
            </h3>
            <div className="space-y-1">
              {contentBlocks.map((item) => (
                <DraggableBlock key={item.type} item={item} />
              ))}
            </div>
          </div>
        )}

        {contentBlocks.length > 0 && formBlocks.length > 0 && (
          <Separator className="mb-5" />
        )}

        {/* Form Blocks */}
        {formBlocks.length > 0 && (
          <div className="mb-5">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Form Fields
            </h3>
            <div className="space-y-1">
              {formBlocks.map((item) => (
                <DraggableBlock key={item.type} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {searchTerm && filteredBlocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">No blocks found</p>
            <p className="text-xs text-muted-foreground/70">
              Try a different search term
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

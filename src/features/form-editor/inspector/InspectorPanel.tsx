import React, { memo, useState } from "react";
import { useEditor } from "../EditorContext";
import {
  BLOCK_TYPES,
  type EditorBlock,
  type EditorSection,
} from "../editorConfig";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Palette,
  Layout,
  Type,
  Settings,
} from "lucide-react";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerOutput,
} from "@/shared/components/ui/color-picker";
import {
  PlaceholderDropdown,
  usePlaceholderTrigger,
  insertPlaceholderIntoText,
} from "../plugins";
import { ConfirmDialog } from "../components";
import { toast } from "sonner";
import editorStyles from "../editor.module.css";

type UpdateFn = (updates: Partial<EditorBlock>) => void;

const CollapsibleSection = memo(function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  hasChanges = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  hasChanges?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-lg border border-editor-border/70 bg-background/90 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.4)] backdrop-blur-sm"
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg px-4 py-3.5 text-left hover:bg-white transition-colors duration-150 group">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm font-semibold text-foreground">{title}</span>
            {hasChanges && (
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-editor-border/60 px-4 pb-4">
        <div className="space-y-4 pt-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

const TypographySection = memo(function TypographySection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const isTextBlock = (
    [
      BLOCK_TYPES.HEADING,
      BLOCK_TYPES.PARAGRAPH,
      BLOCK_TYPES.HYPERLINK,
    ] as string[]
  ).includes(block.type);
  if (!isTextBlock) return null;
  const b = block as any;

  const hasTypographyChanges = b.fontSize !== 14 || b.fontWeight !== 400 || b.textAlign !== "left" || b.lineHeight !== 1.6 || b.color;

  return (
    <CollapsibleSection 
      title="Typography" 
      icon={Type} 
      hasChanges={hasTypographyChanges}
    >
      {block.type === BLOCK_TYPES.HEADING && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Heading Level</Label>
          <Select
            value={b.level || "h1"}
            onValueChange={(v) => onUpdate({ level: v } as any)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1 - Main Title</SelectItem>
              <SelectItem value="h2">H2 - Section</SelectItem>
              <SelectItem value="h3">H3 - Subsection</SelectItem>
              <SelectItem value="h4">H4 - Minor Heading</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Font Size</Label>
          <div className="relative">
            <Input
              type="number"
              value={b.fontSize}
              onChange={(e) =>
                onUpdate({ fontSize: parseInt(e.target.value) || 14 } as any)
              }
              className="h-9 text-xs pr-8"
              min={10}
              max={72}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              px
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Font Weight</Label>
          <Select
            value={String(b.fontWeight)}
            onValueChange={(v) => onUpdate({ fontWeight: parseInt(v) } as any)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">Light (300)</SelectItem>
              <SelectItem value="400">Regular (400)</SelectItem>
              <SelectItem value="500">Medium (500)</SelectItem>
              <SelectItem value="600">Semibold (600)</SelectItem>
              <SelectItem value="700">Bold (700)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Text Alignment</Label>
        <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
          {(
            [
              { v: "left", I: AlignLeft, label: "Left" },
              { v: "center", I: AlignCenter, label: "Center" },
              { v: "right", I: AlignRight, label: "Right" },
              { v: "justify", I: AlignJustify, label: "Justify" },
            ] as const
          ).map(({ v, I: Icon, label }) => (
            <button
              key={v}
              title={label}
              className={`flex-1 flex items-center justify-center h-8 rounded-md text-xs transition-all duration-150 ${
                b.textAlign === v 
                  ? "bg-card shadow-sm text-foreground border border-border" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              onClick={() => onUpdate({ textAlign: v } as any)}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Line Height</Label>
          <span className="text-xs text-muted-foreground font-mono">
            {b.lineHeight}
          </span>
        </div>
        <Slider
          value={[b.lineHeight * 10]}
          onValueChange={([v]) => onUpdate({ lineHeight: v / 10 } as any)}
          min={10}
          max={25}
          step={1}
          className="py-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Tight</span>
          <span>Normal</span>
          <span>Loose</span>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Text Color</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors">
              <span className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border border-input shadow-sm"
                  style={{ backgroundColor: b.color || "#1e293b" }}
                />
                <span>{b.color || "Default"}</span>
              </span>
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <ColorPicker
              value={b.color || "#1e293b"}
              onChange={(color) => onUpdate({ color } as any)}
            >
              <ColorPickerSelection className="h-32 rounded-lg mb-3" />
              <ColorPickerHue className="mb-2" />
              <ColorPickerAlpha className="mb-3" />
              <div className="flex items-center gap-2">
                <ColorPickerOutput />
                <ColorPickerFormat />
              </div>
            </ColorPicker>
          </PopoverContent>
        </Popover>
      </div>
    </CollapsibleSection>
  );
});

const LayoutSection = memo(function LayoutSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const hasLayoutChanges = block.width !== 100 || block.marginTop !== 0 || block.marginBottom !== 8 || 
    block.marginLeft !== 0 || block.marginRight !== 0 || block.paddingX !== 0 || block.paddingY !== 0;

  return (
    <CollapsibleSection 
      title="Layout & Spacing" 
      icon={Layout} 
      hasChanges={hasLayoutChanges}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Width</Label>
          <span className="text-xs text-muted-foreground font-mono">
            {block.width}%
          </span>
        </div>
        <Slider
          value={[block.width]}
          onValueChange={([v]) => onUpdate({ width: v })}
          min={25}
          max={100}
          step={5}
          className="py-1"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border-2 border-dashed border-muted-foreground/50"></div>
          <Label className="text-xs font-medium">Margin (Outside spacing)</Label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Top</Label>
            <div className="relative">
              <Input
                type="number"
                value={block.marginTop || 0}
                onChange={(e) =>
                  onUpdate({ marginTop: parseInt(e.target.value) || 0 })
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={96}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bottom</Label>
            <div className="relative">
              <Input
                type="number"
                value={block.marginBottom || 0}
                onChange={(e) =>
                  onUpdate({ marginBottom: parseInt(e.target.value) || 0 })
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={96}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Left</Label>
            <div className="relative">
              <Input
                type="number"
                value={block.marginLeft || 0}
                onChange={(e) =>
                  onUpdate({ marginLeft: parseInt(e.target.value) || 0 })
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={96}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Right</Label>
            <div className="relative">
              <Input
                type="number"
                value={block.marginRight || 0}
                onChange={(e) =>
                  onUpdate({ marginRight: parseInt(e.target.value) || 0 })
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={96}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted-foreground/20 border border-muted-foreground/50"></div>
          <Label className="text-xs font-medium">Padding (Inside spacing)</Label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Horizontal (X)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={block.paddingX || 0}
                onChange={(e) =>
                  onUpdate({ paddingX: parseInt(e.target.value) || 0 })
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={64}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Vertical (Y)
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={block.paddingY || 0}
                onChange={(e) =>
                  onUpdate({ paddingY: parseInt(e.target.value) || 0 })
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={64}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
});

const OptionItem = memo(function OptionItem({
  opt,
  index,
  updateOption,
  removeOption,
  disableRemove,
}: {
  opt: string;
  index: number;
  updateOption: (idx: number, val: string) => void;
  removeOption: (idx: number) => void;
  disableRemove: boolean;
}) {
  const optionInputRef = React.useRef<HTMLInputElement>(null);
  const handleOptionPlaceholderInsert = React.useCallback(
    (placeholder: string, position: number) => {
      const newValue = insertPlaceholderIntoText(opt, placeholder, position);
      updateOption(index, newValue);
    },
    [opt, index, updateOption],
  );

  const optionPlaceholderTrigger = usePlaceholderTrigger({
    onInsert: handleOptionPlaceholderInsert,
  });

  return (
    <div>
      <div className="flex items-center gap-1">
        <Input
          ref={optionInputRef}
          value={opt}
          onChange={(e) => updateOption(index, e.target.value)}
          onKeyDown={(e) =>
            optionInputRef.current &&
            optionPlaceholderTrigger.handleKeyDown(e, optionInputRef.current)
          }
          className="h-7 text-xs flex-1"
          placeholder="Type @ for placeholders"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0"
          onClick={() => removeOption(index)}
          disabled={disableRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <PlaceholderDropdown
        isOpen={optionPlaceholderTrigger.isOpen}
        onClose={optionPlaceholderTrigger.close}
        onSelect={optionPlaceholderTrigger.handleSelect}
        position={optionPlaceholderTrigger.position}
        searchTerm={optionPlaceholderTrigger.searchTerm}
      />
    </div>
  );
});

const VisualSection = memo(function VisualSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const b = block as any;
  const hasVisualChanges = b.backgroundColor || b.textColor || b.fontFamily || 
    b.blockBorderWidth || b.blockBorderColor || b.blockBorderStyle !== "none" || b.blockBorderRadius;

  return (
    <CollapsibleSection 
      title="Visual Style" 
      icon={Palette} 
      hasChanges={hasVisualChanges}
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Background Color</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors">
              <span className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border border-input shadow-sm"
                  style={{
                    backgroundColor: b.backgroundColor || "transparent",
                  }}
                />
                <span>{b.backgroundColor || "None"}</span>
              </span>
              {b.backgroundColor && (
                <button
                  className="text-muted-foreground hover:text-foreground ml-2 p-0.5 rounded hover:bg-secondary/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ backgroundColor: undefined } as any);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <ColorPicker
              value={b.backgroundColor || "#ffffff"}
              onChange={(color) => onUpdate({ backgroundColor: color } as any)}
            >
              <ColorPickerSelection className="h-32 rounded-lg mb-3" />
              <ColorPickerHue className="mb-2" />
              <ColorPickerAlpha className="mb-3" />
              <div className="flex items-center gap-2">
                <ColorPickerOutput />
                <ColorPickerFormat />
              </div>
            </ColorPicker>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Text Color Override</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors">
              <span className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border border-input shadow-sm"
                  style={{ backgroundColor: b.textColor || "transparent" }}
                />
                <span>{b.textColor || "Inherit"}</span>
              </span>
              {b.textColor && (
                <button
                  className="text-muted-foreground hover:text-foreground ml-2 p-0.5 rounded hover:bg-secondary/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ textColor: undefined } as any);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <ColorPicker
              value={b.textColor || "#1e293b"}
              onChange={(color) => onUpdate({ textColor: color } as any)}
            >
              <ColorPickerSelection className="h-32 rounded-lg mb-3" />
              <ColorPickerHue className="mb-2" />
              <ColorPickerAlpha className="mb-3" />
              <div className="flex items-center gap-2">
                <ColorPickerOutput />
                <ColorPickerFormat />
              </div>
            </ColorPicker>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Font Family</Label>
        <Select
          value={b.fontFamily || "__default"}
          onValueChange={(v) =>
            onUpdate({ fontFamily: v === "__default" ? undefined : v } as any)
          }
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__default">System Default</SelectItem>
            <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
            <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
            <SelectItem value="'Arial', sans-serif">Arial</SelectItem>
            <SelectItem value="'Georgia', serif">Georgia</SelectItem>
            <SelectItem value="'Times New Roman', serif">
              Times New Roman
            </SelectItem>
            <SelectItem value="'Courier New', monospace">
              Courier New
            </SelectItem>
            <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        <Label className="text-xs font-medium">Border & Effects</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <div className="relative">
              <Input
                type="number"
                value={b.blockBorderWidth || 0}
                onChange={(e) =>
                  onUpdate({
                    blockBorderWidth: parseInt(e.target.value) || 0,
                  } as any)
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={16}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Radius</Label>
            <div className="relative">
              <Input
                type="number"
                value={b.blockBorderRadius || 0}
                onChange={(e) =>
                  onUpdate({
                    blockBorderRadius: parseInt(e.target.value) || 0,
                  } as any)
                }
                className="h-9 text-xs pr-8"
                min={0}
                max={32}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                px
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Style</Label>
          <Select
            value={b.blockBorderStyle || "solid"}
            onValueChange={(v) => onUpdate({ blockBorderStyle: v } as any)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Line</SelectItem>
              <SelectItem value="dashed">Dashed Line</SelectItem>
              <SelectItem value="dotted">Dotted Line</SelectItem>
              <SelectItem value="none">No Border</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Border Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors">
                <span className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-input shadow-sm"
                    style={{ backgroundColor: b.blockBorderColor || "#e2e8f0" }}
                  />
                  <span>{b.blockBorderColor || "Default"}</span>
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <ColorPicker
                value={b.blockBorderColor || "#e2e8f0"}
                onChange={(color) =>
                  onUpdate({ blockBorderColor: color } as any)
                }
              >
                <ColorPickerSelection className="h-32 rounded-lg mb-3" />
                <ColorPickerHue className="mb-2" />
                <ColorPickerAlpha className="mb-3" />
                <div className="flex items-center gap-2">
                  <ColorPickerOutput />
                  <ColorPickerFormat />
                </div>
              </ColorPicker>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </CollapsibleSection>
  );
});

const FieldSettingsSection = memo(function FieldSettingsSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const isFormBlock = (
    [
      BLOCK_TYPES.TEXT_INPUT,
      BLOCK_TYPES.TEXTAREA,
      BLOCK_TYPES.DROPDOWN,
      BLOCK_TYPES.RADIO_GROUP,
      BLOCK_TYPES.CHECKBOX_GROUP,
      BLOCK_TYPES.SINGLE_CHECKBOX,
      BLOCK_TYPES.DATE_PICKER,
      BLOCK_TYPES.SIGNATURE,
    ] as string[]
  ).includes(block.type);
  
  if (!isFormBlock) return null;
  
  const b = block as any;
  const hasFieldChanges = b.required || b.validationType !== "none" || b.maxLength || 
    (b.options && b.options.length > 3) || b.layout !== "vertical";

  const labelInputRef = React.useRef<HTMLInputElement>(null);
  const handleLabelPlaceholderInsert = React.useCallback(
    (placeholder: string, position: number) => {
      const newValue = insertPlaceholderIntoText(
        b.label || "",
        placeholder,
        position,
      );
      onUpdate({ label: newValue } as any);
    },
    [b.label, onUpdate],
  );

  const labelPlaceholderTrigger = usePlaceholderTrigger({
    onInsert: handleLabelPlaceholderInsert,
  });

  const hasOptions = (
    [
      BLOCK_TYPES.DROPDOWN,
      BLOCK_TYPES.RADIO_GROUP,
      BLOCK_TYPES.CHECKBOX_GROUP,
    ] as string[]
  ).includes(block.type);
  const hasPlaceholder = (
    [BLOCK_TYPES.TEXT_INPUT, BLOCK_TYPES.TEXTAREA] as string[]
  ).includes(block.type);
  const hasValidation = block.type === BLOCK_TYPES.TEXT_INPUT;
  const hasRows = block.type === BLOCK_TYPES.TEXTAREA;
  const hasLayout = (
    [BLOCK_TYPES.RADIO_GROUP, BLOCK_TYPES.CHECKBOX_GROUP] as string[]
  ).includes(block.type);
  const hasMaxLength = (
    [BLOCK_TYPES.TEXT_INPUT, BLOCK_TYPES.TEXTAREA] as string[]
  ).includes(block.type);

  const addOption = () =>
    onUpdate({
      options: [...(b.options || []), `Option ${(b.options || []).length + 1}`],
    } as any);
  const removeOption = (idx: number) => {
    const opts = [...(b.options || [])];
    opts.splice(idx, 1);
    onUpdate({ options: opts } as any);
  };
  const updateOption = (idx: number, val: string) => {
    const opts = [...(b.options || [])];
    opts[idx] = val;
    onUpdate({ options: opts } as any);
  };

  return (
    <CollapsibleSection 
      title="Field Settings" 
      icon={Settings} 
      hasChanges={hasFieldChanges}
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Field Label</Label>
        <Input
          ref={labelInputRef}
          value={b.label || ""}
          onChange={(e) => onUpdate({ label: e.target.value } as any)}
          onKeyDown={(e) =>
            labelInputRef.current &&
            labelPlaceholderTrigger.handleKeyDown(e, labelInputRef.current)
          }
          className="h-9 text-xs"
          placeholder="Enter field label..."
        />
        <p className="text-xs text-muted-foreground">
          💡 Type @ to insert dynamic placeholders
        </p>
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Field Name (for forms)</Label>
        <Input
          value={b.fieldName || ""}
          onChange={(e) => onUpdate({ fieldName: e.target.value } as any)}
          className="h-9 text-xs font-mono"
          placeholder="field_name"
        />
      </div>
      
      {hasPlaceholder && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Placeholder Text</Label>
          <Input
            value={b.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value } as any)}
            className="h-9 text-xs"
            placeholder="Enter placeholder..."
          />
        </div>
      )}
      
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium">Required Field</Label>
          {b.required && (
            <span className="text-xs text-destructive">*</span>
          )}
        </div>
        <Switch
          checked={b.required || false}
          onCheckedChange={(checked) => onUpdate({ required: checked } as any)}
        />
      </div>
      
      {b.helpText !== undefined && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Help Text</Label>
          <Input
            value={b.helpText || ""}
            onChange={(e) => onUpdate({ helpText: e.target.value } as any)}
            className="h-9 text-xs"
            placeholder="Additional guidance for users..."
          />
        </div>
      )}
      
      {hasValidation && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Input Validation</Label>
          <Select
            value={b.validationType || "none"}
            onValueChange={(v) => onUpdate({ validationType: v } as any)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No validation</SelectItem>
              <SelectItem value="email">Email address</SelectItem>
              <SelectItem value="number">Numbers only</SelectItem>
              <SelectItem value="phone">Phone number</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {hasMaxLength && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Character Limit</Label>
          <Input
            type="number"
            value={b.maxLength || ""}
            onChange={(e) => onUpdate({ maxLength: e.target.value } as any)}
            placeholder="No limit"
            className="h-9 text-xs"
            min={1}
          />
        </div>
      )}
      
      {hasRows && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Text Area Rows</Label>
          <Input
            type="number"
            value={b.rows || 4}
            onChange={(e) =>
              onUpdate({ rows: parseInt(e.target.value) || 4 } as any)
            }
            className="h-9 text-xs"
            min={2}
            max={20}
          />
        </div>
      )}
      
      {hasLayout && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Option Layout</Label>
          <Select
            value={b.layout || "vertical"}
            onValueChange={(v) => onUpdate({ layout: v } as any)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical (stacked)</SelectItem>
              <SelectItem value="horizontal">Horizontal (inline)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {hasOptions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Options</Label>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 px-2"
              onClick={addOption}
            >
              <Plus className="h-3 w-3" /> Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {(b.options || []).map((opt: string, i: number) => (
              <OptionItem
                key={i}
                opt={opt}
                index={i}
                updateOption={updateOption}
                removeOption={removeOption}
                disableRemove={(b.options || []).length <= 1}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Type @ in options to insert placeholders
          </p>
        </div>
      )}
      
      <PlaceholderDropdown
        isOpen={labelPlaceholderTrigger.isOpen}
        onClose={labelPlaceholderTrigger.close}
        onSelect={labelPlaceholderTrigger.handleSelect}
        position={labelPlaceholderTrigger.position}
        searchTerm={labelPlaceholderTrigger.searchTerm}
      />
    </CollapsibleSection>
  );
});

const HeadingContentSection = memo(function HeadingContentSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const b = block as any;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handlePlaceholderInsert = React.useCallback(
    (placeholder: string, position: number) => {
      const newValue = insertPlaceholderIntoText(
        b.content || "",
        placeholder,
        position,
      );
      onUpdate({ content: newValue } as any);
    },
    [b.content, onUpdate],
  );
  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Content
      </h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Heading Text</Label>
        <Input
          ref={inputRef}
          value={b.content || ""}
          onChange={(e) => onUpdate({ content: e.target.value } as any)}
          onKeyDown={(e) =>
            inputRef.current &&
            placeholderTrigger.handleKeyDown(e, inputRef.current)
          }
          placeholder="Type @ for placeholders"
          className="h-8 text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          💡 Type @ to insert placeholders
        </p>
      </div>
      <PlaceholderDropdown
        isOpen={placeholderTrigger.isOpen}
        onClose={placeholderTrigger.close}
        onSelect={placeholderTrigger.handleSelect}
        position={placeholderTrigger.position}
        searchTerm={placeholderTrigger.searchTerm}
      />
    </div>
  );
});

const ParagraphContentSection = memo(function ParagraphContentSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const b = block as any;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const handlePlaceholderInsert = React.useCallback(
    (placeholder: string, position: number) => {
      const newValue = insertPlaceholderIntoText(
        b.content || "",
        placeholder,
        position,
      );
      onUpdate({ content: newValue } as any);
    },
    [b.content, onUpdate],
  );
  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Content
      </h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Paragraph Text</Label>
        <textarea
          ref={textareaRef}
          value={b.content || ""}
          onChange={(e) => onUpdate({ content: e.target.value } as any)}
          onKeyDown={(e) =>
            textareaRef.current &&
            placeholderTrigger.handleKeyDown(e, textareaRef.current)
          }
          rows={5}
          placeholder="Type @ for placeholders"
          className="w-full px-3 py-2 text-xs bg-card border border-input rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <p className="text-[11px] text-muted-foreground">
          💡 Type @ to insert placeholders
        </p>
      </div>
      <PlaceholderDropdown
        isOpen={placeholderTrigger.isOpen}
        onClose={placeholderTrigger.close}
        onSelect={placeholderTrigger.handleSelect}
        position={placeholderTrigger.position}
        searchTerm={placeholderTrigger.searchTerm}
      />
    </div>
  );
});

const HyperlinkContentSection = memo(function HyperlinkContentSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const b = block as any;
  const textInputRef = React.useRef<HTMLInputElement>(null);
  const handleTextPlaceholderInsert = React.useCallback(
    (placeholder: string, position: number) => {
      const newValue = insertPlaceholderIntoText(
        b.text || "",
        placeholder,
        position,
      );
      onUpdate({ text: newValue } as any);
    },
    [b.text, onUpdate],
  );
  const textPlaceholderTrigger = usePlaceholderTrigger({
    onInsert: handleTextPlaceholderInsert,
  });

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Hyperlink Settings
      </h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Link Text</Label>
        <Input
          ref={textInputRef}
          value={b.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value } as any)}
          onKeyDown={(e) =>
            textInputRef.current &&
            textPlaceholderTrigger.handleKeyDown(e, textInputRef.current)
          }
          className="h-8 text-xs"
          placeholder="Click here (Type @ for placeholders)"
        />
        <p className="text-[11px] text-muted-foreground">
          💡 Type @ to insert placeholders
        </p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">URL</Label>
        <Input
          value={b.url || ""}
          onChange={(e) => onUpdate({ url: e.target.value } as any)}
          className="h-8 text-xs font-mono"
          placeholder="https://example.com"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Open in New Tab</Label>
        <Switch
          checked={b.openInNewTab !== false}
          onCheckedChange={(checked) =>
            onUpdate({ openInNewTab: checked } as any)
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Underline</Label>
        <Switch
          checked={b.underline !== false}
          onCheckedChange={(checked) => onUpdate({ underline: checked } as any)}
        />
      </div>
      <PlaceholderDropdown
        isOpen={textPlaceholderTrigger.isOpen}
        onClose={textPlaceholderTrigger.close}
        onSelect={textPlaceholderTrigger.handleSelect}
        position={textPlaceholderTrigger.position}
        searchTerm={textPlaceholderTrigger.searchTerm}
      />
    </div>
  );
});

const TableContentSection = memo(function TableContentSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const b = block as any;
  const [editingCellContent, setEditingCellContent] = React.useState("");
  const [selectedCell, setSelectedCell] = React.useState<{
    row: number;
    col: number;
  } | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const handlePlaceholderInsert = React.useCallback(
    (placeholder: string, position: number) => {
      const newValue = insertPlaceholderIntoText(
        editingCellContent,
        placeholder,
        position,
      );
      setEditingCellContent(newValue);
      if (selectedCell && b.rows) {
        const newRows = b.rows.map((row: string[], ri: number) =>
          row.map((cell: string, ci: number) =>
            ri === selectedCell.row && ci === selectedCell.col
              ? newValue
              : cell,
          ),
        );
        onUpdate({ rows: newRows } as any);
      }
    },
    [editingCellContent, selectedCell, b.rows, onUpdate],
  );
  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });
  React.useEffect(() => {
    if (b.rows && b.rows.length > 0) {
      const firstRow = b.rows[0] || [];
      setEditingCellContent(firstRow[0] || "");
      setSelectedCell({ row: 0, col: 0 });
    }
  }, [b.rows, block.id]);

  const updateCellContent = (content: string) => {
    if (!selectedCell || !b.rows) return;
    const newRows = b.rows.map((row: string[], ri: number) =>
      row.map((cell: string, ci: number) =>
        ri === selectedCell.row && ci === selectedCell.col ? content : cell,
      ),
    );
    onUpdate({ rows: newRows } as any);
  };

  const getCellLabel = () => {
    if (!selectedCell || !b.rows) return "";
    const isHeader = b.headerRow && selectedCell.row === 0;
    const rowLabel = isHeader
      ? "Header"
      : `Row ${selectedCell.row + (b.headerRow ? 0 : 1)}`;
    return `${rowLabel}, Column ${selectedCell.col + 1}`;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Table Settings
      </h4>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Header Row</Label>
        <Switch
          checked={b.headerRow || false}
          onCheckedChange={(checked) => onUpdate({ headerRow: checked } as any)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Striped Rows</Label>
        <Switch
          checked={b.stripedRows || false}
          onCheckedChange={(checked) =>
            onUpdate({ stripedRows: checked } as any)
          }
        />
      </div>

      {b.rows && b.rows[0] && b.rows[0].length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Column Alignment</Label>
          <div className="space-y-1">
            {(b.rows[0] as string[]).map((_: string, ci: number) => {
              const currentAlign = (b.columnAlignments || [])[ci] || "left";
              return (
                <div key={ci} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Col {ci + 1}
                  </span>
                  <div className="flex border rounded overflow-hidden">
                    {(
                      [
                        { value: "left", Icon: AlignLeft },
                        { value: "center", Icon: AlignCenter },
                        { value: "right", Icon: AlignRight },
                      ] as const
                    ).map(({ value, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          const aligns: string[] = [
                            ...(b.columnAlignments ||
                              Array(b.rows[0].length).fill("left")),
                          ];
                          aligns[ci] = value;
                          onUpdate({ columnAlignments: aligns } as any);
                        }}
                        className={`p-1 transition-colors ${
                          currentAlign === value
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                        title={value}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator className="my-3" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Cell Content Editor</Label>
          {selectedCell && b.rows && (
            <span className="text-[11px] text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
              {getCellLabel()}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Edit cell content below. Click cells in the table or use navigation
          buttons.
        </p>

        {selectedCell && b.rows && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                disabled={selectedCell.row === 0}
                onClick={() => {
                  const newCell = {
                    row: selectedCell.row - 1,
                    col: selectedCell.col,
                  };
                  setSelectedCell(newCell);
                  setEditingCellContent(
                    b.rows[newCell.row]?.[newCell.col] || "",
                  );
                }}
              >
                ↑ Row
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                disabled={selectedCell.row >= b.rows.length - 1}
                onClick={() => {
                  const newCell = {
                    row: selectedCell.row + 1,
                    col: selectedCell.col,
                  };
                  setSelectedCell(newCell);
                  setEditingCellContent(
                    b.rows[newCell.row]?.[newCell.col] || "",
                  );
                }}
              >
                ↓ Row
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                disabled={selectedCell.col === 0}
                onClick={() => {
                  const newCell = {
                    row: selectedCell.row,
                    col: selectedCell.col - 1,
                  };
                  setSelectedCell(newCell);
                  setEditingCellContent(
                    b.rows[newCell.row]?.[newCell.col] || "",
                  );
                }}
              >
                ← Col
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                disabled={selectedCell.col >= (b.rows[0]?.length || 0) - 1}
                onClick={() => {
                  const newCell = {
                    row: selectedCell.row,
                    col: selectedCell.col + 1,
                  };
                  setSelectedCell(newCell);
                  setEditingCellContent(
                    b.rows[newCell.row]?.[newCell.col] || "",
                  );
                }}
              >
                → Col
              </Button>
            </div>

            <textarea
              ref={textareaRef}
              value={editingCellContent}
              onChange={(e) => {
                setEditingCellContent(e.target.value);
                updateCellContent(e.target.value);
              }}
              onKeyDown={(e) => {
                if (textareaRef.current) {
                  placeholderTrigger.handleKeyDown(e, textareaRef.current);
                }
              }}
              rows={6}
              placeholder="Enter cell content... Type @ to insert placeholders"
              className="w-full px-3 py-2 text-xs bg-card border border-input rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />

            <div className="bg-muted/50 rounded-md p-2 space-y-1">
              <p className="text-[11px] text-muted-foreground">
                💡 <strong>Tip:</strong> Type @ to insert placeholders like
                @CustomerEmail
              </p>
              <p className="text-[11px] text-muted-foreground">
                📍 <strong>Position:</strong> {getCellLabel()} of{" "}
                {b.rows.length} rows × {b.rows[0]?.length || 0} columns
              </p>
            </div>
          </div>
        )}
      </div>

      <PlaceholderDropdown
        isOpen={placeholderTrigger.isOpen}
        onClose={placeholderTrigger.close}
        onSelect={placeholderTrigger.handleSelect}
        position={placeholderTrigger.position}
        searchTerm={placeholderTrigger.searchTerm}
      />
    </div>
  );
});

const ListContentSection = memo(function ListContentSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  const b = block as any;
  const [editingItemContent, setEditingItemContent] = React.useState("");
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (b.items && b.items.length > 0) {
      setEditingItemContent(b.items[0] || "");
      setSelectedItemIndex(0);
    }
  }, [b.items, block.id]);

  const updateItemContent = React.useCallback(
    (content: string) => {
      if (!b.items) return;
      const newItems = b.items.map((item: string, i: number) =>
        i === selectedItemIndex ? content : item,
      );
      onUpdate({ items: newItems } as any);
    },
    [b.items, onUpdate, selectedItemIndex],
  );

  const handleListItemPlaceholderInsert = React.useCallback(
    (placeholder: string, position: number) => {
      const currentText = editingItemContent || "";
      const newValue = insertPlaceholderIntoText(
        currentText,
        placeholder,
        position,
      );
      setEditingItemContent(newValue);
      updateItemContent(newValue);

      let atStart = position;
      for (let i = position; i >= 0; i--) {
        if (currentText.substring(i, i + 3) === "PH@") {
          atStart = i;
          break;
        } else if (currentText[i] === "@") {
          atStart = i;
          break;
        }
      }
      const cursorAfterInsert = atStart + placeholder.length + 1;

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          try {
            const pos = Math.min(
              cursorAfterInsert,
              textareaRef.current.value.length,
            );
            textareaRef.current.setSelectionRange(pos, pos);
          } catch {
            /* ignore selection errors */
          }
          textareaRef.current.focus();
        }
      });
    },
    [editingItemContent, updateItemContent],
  );

  const listItemPlaceholderTrigger = usePlaceholderTrigger({
    onInsert: handleListItemPlaceholderInsert,
  });

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        List Settings
      </h4>
      <div className="space-y-1.5">
        <Label className="text-xs">List Type</Label>
        <Select
          value={b.listType || "unordered"}
          onValueChange={(v) => onUpdate({ listType: v } as any)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unordered">Bulleted List</SelectItem>
            <SelectItem value="ordered">Numbered List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-3" />

      <div className="space-y-2">
        <Label className="text-xs">Item Content Editor</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Click items in the list to edit. Press Ctrl+Enter to add new items.
        </p>
        {b.items && b.items.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Editing: Item {selectedItemIndex + 1} of {b.items.length}
              </Label>
              <div className="flex gap-1">
                {selectedItemIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      const newIndex = selectedItemIndex - 1;
                      setSelectedItemIndex(newIndex);
                      setEditingItemContent(b.items[newIndex] || "");
                    }}
                  >
                    ← Prev
                  </Button>
                )}
                {selectedItemIndex < b.items.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      const newIndex = selectedItemIndex + 1;
                      setSelectedItemIndex(newIndex);
                      setEditingItemContent(b.items[newIndex] || "");
                    }}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={editingItemContent}
              onChange={(e) => {
                setEditingItemContent(e.target.value);
                updateItemContent(e.target.value);
              }}
              onKeyDown={(e) => {
                if (textareaRef.current) {
                  listItemPlaceholderTrigger.handleKeyDown(
                    e,
                    textareaRef.current,
                  );
                }
              }}
              rows={4}
              placeholder="Enter list item content... Type @ for placeholders"
              className="w-full px-3 py-2 text-xs bg-card border border-input rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground">
              ðŸ’¡ Type @ to insert placeholders in list items
            </p>
          </div>
        )}
      </div>

      <PlaceholderDropdown
        isOpen={listItemPlaceholderTrigger.isOpen}
        onClose={listItemPlaceholderTrigger.close}
        onSelect={listItemPlaceholderTrigger.handleSelect}
        position={listItemPlaceholderTrigger.position}
        searchTerm={listItemPlaceholderTrigger.searchTerm}
      />
    </div>
  );
});

const ContentSection = memo(function ContentSection({
  block,
  onUpdate,
}: {
  block: EditorBlock;
  onUpdate: UpdateFn;
}) {
  if (block.type === BLOCK_TYPES.HEADING)
    return <HeadingContentSection block={block} onUpdate={onUpdate} />;
  if (block.type === BLOCK_TYPES.PARAGRAPH)
    return <ParagraphContentSection block={block} onUpdate={onUpdate} />;
  if (block.type === BLOCK_TYPES.HYPERLINK)
    return <HyperlinkContentSection block={block} onUpdate={onUpdate} />;
  if (block.type === BLOCK_TYPES.TABLE)
    return <TableContentSection block={block} onUpdate={onUpdate} />;
  if (block.type === BLOCK_TYPES.LIST)
    return <ListContentSection block={block} onUpdate={onUpdate} />;
  const b = block as any;
  if (block.type === BLOCK_TYPES.DIVIDER) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Divider Settings
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Thickness</Label>
            <Input
              type="number"
              value={b.thickness || 1}
              onChange={(e) =>
                onUpdate({ thickness: parseInt(e.target.value) || 1 } as any)
              }
              className="h-8 text-xs"
              min={1}
              max={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Style</Label>
            <Select
              value={b.style || "solid"}
              onValueChange={(v) => onUpdate({ style: v } as any)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground">
                <span className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-input"
                    style={{ backgroundColor: b.color || "#e2e8f0" }}
                  />
                  <span>{b.color || "Default"}</span>
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <ColorPicker
                value={b.color || "#e2e8f0"}
                onChange={(color) => onUpdate({ color } as any)}
              >
                <ColorPickerSelection className="h-32 rounded-lg mb-3" />
                <ColorPickerHue className="mb-2" />
                <ColorPickerAlpha className="mb-3" />
                <div className="flex items-center gap-2">
                  <ColorPickerOutput />
                  <ColorPickerFormat />
                </div>
              </ColorPicker>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }
  if (block.type === BLOCK_TYPES.IMAGE) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Image Settings
        </h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Alt Text</Label>
          <Input
            value={b.alt || ""}
            onChange={(e) => onUpdate({ alt: e.target.value } as any)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Alignment</Label>
          <Select
            value={b.alignment || "center"}
            onValueChange={(v) => onUpdate({ alignment: v } as any)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Border Radius: {b.borderRadius}px</Label>
          <Slider
            value={[b.borderRadius || 0]}
            onValueChange={([v]) => onUpdate({ borderRadius: v } as any)}
            min={0}
            max={32}
            className="py-1"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Max Height</Label>
          <Input
            type="number"
            value={b.maxHeight || 300}
            onChange={(e) =>
              onUpdate({ maxHeight: parseInt(e.target.value) || 300 } as any)
            }
            className="h-8 text-xs"
            min={50}
            max={800}
          />
        </div>
      </div>
    );
  }
  if (block.type === BLOCK_TYPES.BUTTON) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Button Settings
        </h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Button Text</Label>
          <Input
            value={b.label || ""}
            onChange={(e) => onUpdate({ label: e.target.value } as any)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Button Type</Label>
          <Select
            value={b.buttonType || "submit"}
            onValueChange={(v) => onUpdate({ buttonType: v } as any)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submit">Submit</SelectItem>
              <SelectItem value="button">Button</SelectItem>
              <SelectItem value="reset">Reset</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Variant</Label>
          <Select
            value={b.variant || "primary"}
            onValueChange={(v) => onUpdate({ variant: v } as any)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  return null;
});

export const InspectorPanel = memo(function InspectorPanel() {
  const {
    state,
    getSelectedBlock,
    getSelectedSection,
    updateBlockWithHistory,
    updateSectionWithHistory,
    removeBlock,
    duplicateBlock,
  } = useEditor();
  const isPreview = state.isPreviewMode;
  const block = getSelectedBlock();
  const section = getSelectedSection();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = React.useCallback(() => {
    if (block) {
      removeBlock(block.id);
      setShowDeleteConfirm(false);
      toast.success("Block deleted", {
        description: "The block has been removed from your form.",
      });
    }
  }, [block, removeBlock]);

  const handleDuplicate = React.useCallback(() => {
    if (block) {
      duplicateBlock(block.id);
      toast.success("Block duplicated", {
        description: "A copy of the block has been created.",
      });
    }
  }, [block, duplicateBlock]);

  if (isPreview) return null;

  if (!block && !section) {
    return (
      <div className="w-[25rem] min-w-[25rem] bg-editor-sidebar/95 border-l border-editor-border flex flex-col h-full shadow-[-12px_0_32px_-30px_rgba(15,23,42,0.3)] backdrop-blur-sm">
        <div className="px-5 pt-5 pb-4 border-b border-editor-border/50">
          <h2 className="text-sm font-semibold text-foreground">
            Inspector
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            No selection
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm rounded-xl border border-editor-border/70 bg-background/90 px-6 py-8 text-center shadow-[0_18px_42px_-34px_rgba(15,23,42,0.4)]">
            <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-white to-secondary/80 border border-editor-border/70 flex items-center justify-center mx-auto shadow-sm">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                Select a block to edit
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click on any block in the canvas to view and modify its properties here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section && !block) {
    const onUpdateSection = (updates: Partial<EditorSection>) =>
      updateSectionWithHistory(section.id, updates);

    return (
      <div className="w-[25rem] min-w-[25rem] bg-editor-sidebar/95 border-l border-editor-border flex flex-col h-full shadow-[-12px_0_32px_-30px_rgba(15,23,42,0.3)] backdrop-blur-sm">
        <div className="px-5 pt-5 pb-4 border-b border-editor-border/50">
          <h2 className="text-sm font-semibold text-foreground">
            Inspector
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Section layout</p>
        </div>
        <ScrollArea className={cn("flex-1", editorStyles.scrollArea)}>
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="mx-4 mt-4 grid h-auto grid-cols-2 rounded-lg border border-editor-border/70 bg-background/80 p-1 shadow-sm">
              <TabsTrigger
                value="layout"
                className="text-xs h-9 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Layout
              </TabsTrigger>
              <TabsTrigger
                value="style"
                className="text-xs h-9 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                Style
              </TabsTrigger>
            </TabsList>
            <TabsContent value="layout" className="px-5 py-5 space-y-5">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Section Layout
                </h4>
                <div className="space-y-1.5">
                  <Label className="text-xs">Column Gap (px)</Label>
                  <Input
                    type="number"
                    value={section.columnGap ?? 24}
                    onChange={(e) =>
                      onUpdateSection({
                        columnGap: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-8 text-xs"
                    min={0}
                    max={96}
                  />
                </div>
                <Separator className="my-3" />
                <div className="space-y-3">
                  <Label className="text-xs font-medium">Padding (px)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Top
                      </Label>
                      <Input
                        type="number"
                        value={section.paddingTop ?? 12}
                        onChange={(e) =>
                          onUpdateSection({
                            paddingTop: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                        min={0}
                        max={120}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Right
                      </Label>
                      <Input
                        type="number"
                        value={section.paddingRight ?? 12}
                        onChange={(e) =>
                          onUpdateSection({
                            paddingRight: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                        min={0}
                        max={120}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Bottom
                      </Label>
                      <Input
                        type="number"
                        value={section.paddingBottom ?? 12}
                        onChange={(e) =>
                          onUpdateSection({
                            paddingBottom: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                        min={0}
                        max={120}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Left
                      </Label>
                      <Input
                        type="number"
                        value={section.paddingLeft ?? 12}
                        onChange={(e) =>
                          onUpdateSection({
                            paddingLeft: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                        min={0}
                        max={120}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="style" className="px-5 py-5 space-y-5">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Section Style
                </h4>
                <div className="space-y-1.5">
                  <Label className="text-xs">Background Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground">
                        <span className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded border border-input"
                            style={{
                              backgroundColor:
                                section.backgroundColor || "transparent",
                            }}
                          />
                          <span>{section.backgroundColor || "None"}</span>
                        </span>
                        {section.backgroundColor && (
                          <span
                            className="text-muted-foreground hover:text-foreground ml-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateSection({ backgroundColor: undefined });
                            }}
                          >
                            ×
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <ColorPicker
                        value={section.backgroundColor || "#ffffff"}
                        onChange={(color) =>
                          onUpdateSection({ backgroundColor: color as string })
                        }
                      >
                        <ColorPickerSelection className="h-32 rounded-lg mb-3" />
                        <ColorPickerHue className="mb-2" />
                        <ColorPickerAlpha className="mb-3" />
                        <div className="flex items-center gap-2">
                          <ColorPickerOutput />
                          <ColorPickerFormat />
                        </div>
                      </ColorPicker>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Text Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground">
                        <span className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded border border-input"
                            style={{
                              backgroundColor: section.textColor || "#1e293b",
                            }}
                          />
                          <span>{section.textColor || "inherit"}</span>
                        </span>
                        {section.textColor && (
                          <span
                            className="text-muted-foreground hover:text-foreground ml-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateSection({ textColor: undefined });
                            }}
                          >
                            ×
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <ColorPicker
                        value={section.textColor || "#1e293b"}
                        onChange={(color) =>
                          onUpdateSection({ textColor: color as string })
                        }
                      >
                        <ColorPickerSelection className="h-32 rounded-lg mb-3" />
                        <ColorPickerHue className="mb-2" />
                        <ColorPickerAlpha className="mb-3" />
                        <div className="flex items-center gap-2">
                          <ColorPickerOutput />
                          <ColorPickerFormat />
                        </div>
                      </ColorPicker>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    );
  }

  // TypeScript flow analysis can't narrow block to non-null after the
  // section && !block early-return above, so we add an explicit guard.
  if (!block) return null;

  const onUpdate: UpdateFn = (updates) =>
    updateBlockWithHistory(block.id, updates);
  const blockTypeLabel = block.type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="w-[25rem] min-w-[25rem] bg-editor-sidebar/95 border-l border-editor-border flex flex-col h-full shadow-[-12px_0_32px_-30px_rgba(15,23,42,0.3)] backdrop-blur-sm">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-editor-border/50">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Inspector
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {blockTypeLabel}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md hover:bg-secondary/80 transition-colors"
            onClick={handleDuplicate}
            title="Duplicate block"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md hover:bg-secondary/80 transition-colors"
            onClick={() => onUpdate({ locked: !block.locked })}
            title={block.locked ? "Unlock block" : "Lock block"}
          >
            {block.locked ? (
              <Lock className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete block"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className={cn("flex-1", editorStyles.scrollArea)}>
        <div className="p-4 space-y-3">
          <ContentSection block={block} onUpdate={onUpdate} />
          <FieldSettingsSection block={block} onUpdate={onUpdate} />
          <LayoutSection block={block} onUpdate={onUpdate} />
          <TypographySection block={block} onUpdate={onUpdate} />
          <VisualSection block={block} onUpdate={onUpdate} />
        </div>
      </ScrollArea>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Block"
        description="Are you sure you want to delete this block? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
});

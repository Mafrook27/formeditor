import React, { memo } from 'react';
import { useEditor } from '../EditorContext';
import { BLOCK_TYPES, type EditorBlock } from '../editorConfig';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Copy, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, AlignJustify, Plus, X } from 'lucide-react';
import { ColorPicker, ColorPickerSelection, ColorPickerHue, ColorPickerAlpha, ColorPickerFormat, ColorPickerOutput } from '@/shared/components/ui/color-picker';

type UpdateFn = (updates: Partial<EditorBlock>) => void;

const TypographySection = memo(function TypographySection({ block, onUpdate }: { block: EditorBlock; onUpdate: UpdateFn }) {
  const isTextBlock = ([BLOCK_TYPES.HEADING, BLOCK_TYPES.PARAGRAPH] as string[]).includes(block.type);
  if (!isTextBlock) return null;
  const b = block as any;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h4>
      {block.type === BLOCK_TYPES.HEADING && (
        <div className="space-y-1.5">
          <Label className="text-xs">Level</Label>
          <Select value={b.level} onValueChange={(v) => onUpdate({ level: v } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1</SelectItem>
              <SelectItem value="h2">H2</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
              <SelectItem value="h4">H4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Font Size</Label>
          <Input type="number" value={b.fontSize} onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 14 } as any)} className="h-8 text-xs" min={10} max={72} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Font Weight</Label>
          <Select value={String(b.fontWeight)} onValueChange={(v) => onUpdate({ fontWeight: parseInt(v) } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="300">Light</SelectItem>
              <SelectItem value="400">Regular</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semibold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Alignment</Label>
        <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
          {([{ v: 'left', I: AlignLeft }, { v: 'center', I: AlignCenter }, { v: 'right', I: AlignRight }, { v: 'justify', I: AlignJustify }] as const).map(({ v, I: Icon }) => (
            <button key={v} className={`flex-1 flex items-center justify-center h-7 rounded-sm text-xs ${b.textAlign === v ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              style={{ transitionProperty: 'background-color, color, box-shadow', transitionDuration: 'var(--transition-fast)' }}
              onClick={() => onUpdate({ textAlign: v } as any)}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Line Height: {b.lineHeight}</Label>
        <Slider value={[b.lineHeight * 10]} onValueChange={([v]) => onUpdate({ lineHeight: v / 10 } as any)} min={10} max={25} step={1} className="py-1" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Text Color</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs flex items-center justify-between hover:bg-accent hover:text-accent-foreground">
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-input" style={{ backgroundColor: b.color || '#1e293b' }} />
                <span>{b.color || 'inherit'}</span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <ColorPicker value={b.color || '#1e293b'} onChange={(color) => onUpdate({ color } as any)}>
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
});

const LayoutSection = memo(function LayoutSection({ block, onUpdate }: { block: EditorBlock; onUpdate: UpdateFn }) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layout</h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Width: {block.width}%</Label>
        <Slider value={[block.width]} onValueChange={([v]) => onUpdate({ width: v })} min={25} max={100} step={5} className="py-1" />
      </div>
      
      <Separator className="my-3" />
      
      <div className="space-y-3">
        <Label className="text-xs font-medium">Margin</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Top</Label>
            <Input type="number" value={block.marginTop || 0} onChange={(e) => onUpdate({ marginTop: parseInt(e.target.value) || 0 })} className="h-8 text-xs" min={0} max={96} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bottom</Label>
            <Input type="number" value={block.marginBottom || 0} onChange={(e) => onUpdate({ marginBottom: parseInt(e.target.value) || 0 })} className="h-8 text-xs" min={0} max={96} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Left</Label>
            <Input type="number" value={block.marginLeft || 0} onChange={(e) => onUpdate({ marginLeft: parseInt(e.target.value) || 0 })} className="h-8 text-xs" min={0} max={96} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Right</Label>
            <Input type="number" value={block.marginRight || 0} onChange={(e) => onUpdate({ marginRight: parseInt(e.target.value) || 0 })} className="h-8 text-xs" min={0} max={96} />
          </div>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div className="space-y-3">
        <Label className="text-xs font-medium">Padding</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Horizontal (X)</Label>
            <Input type="number" value={block.paddingX || 0} onChange={(e) => onUpdate({ paddingX: parseInt(e.target.value) || 0 })} className="h-8 text-xs" min={0} max={64} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Vertical (Y)</Label>
            <Input type="number" value={block.paddingY || 0} onChange={(e) => onUpdate({ paddingY: parseInt(e.target.value) || 0 })} className="h-8 text-xs" min={0} max={64} />
          </div>
        </div>
      </div>
    </div>
  );
});

const FieldSettingsSection = memo(function FieldSettingsSection({ block, onUpdate }: { block: EditorBlock; onUpdate: UpdateFn }) {
  const isFormBlock = ([BLOCK_TYPES.TEXT_INPUT, BLOCK_TYPES.TEXTAREA, BLOCK_TYPES.DROPDOWN, BLOCK_TYPES.RADIO_GROUP, BLOCK_TYPES.CHECKBOX_GROUP, BLOCK_TYPES.SINGLE_CHECKBOX, BLOCK_TYPES.DATE_PICKER, BLOCK_TYPES.FILE_UPLOAD, BLOCK_TYPES.SIGNATURE] as string[]).includes(block.type);
  if (!isFormBlock) return null;
  const b = block as any;
  const hasOptions = ([BLOCK_TYPES.DROPDOWN, BLOCK_TYPES.RADIO_GROUP, BLOCK_TYPES.CHECKBOX_GROUP] as string[]).includes(block.type);
  const hasPlaceholder = ([BLOCK_TYPES.TEXT_INPUT, BLOCK_TYPES.TEXTAREA] as string[]).includes(block.type);
  const hasValidation = block.type === BLOCK_TYPES.TEXT_INPUT;
  const hasRows = block.type === BLOCK_TYPES.TEXTAREA;
  const hasLayout = ([BLOCK_TYPES.RADIO_GROUP, BLOCK_TYPES.CHECKBOX_GROUP] as string[]).includes(block.type);
  const hasMaxLength = ([BLOCK_TYPES.TEXT_INPUT, BLOCK_TYPES.TEXTAREA] as string[]).includes(block.type);

  const addOption = () => onUpdate({ options: [...(b.options || []), `Option ${(b.options || []).length + 1}`] } as any);
  const removeOption = (idx: number) => { const opts = [...(b.options || [])]; opts.splice(idx, 1); onUpdate({ options: opts } as any); };
  const updateOption = (idx: number, val: string) => { const opts = [...(b.options || [])]; opts[idx] = val; onUpdate({ options: opts } as any); };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Field Settings</h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Label</Label>
        <Input value={b.label || ''} onChange={(e) => onUpdate({ label: e.target.value } as any)} className="h-8 text-xs" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Field Name</Label>
        <Input value={b.fieldName || ''} onChange={(e) => onUpdate({ fieldName: e.target.value } as any)} className="h-8 text-xs font-mono" />
      </div>
      {hasPlaceholder && (
        <div className="space-y-1.5">
          <Label className="text-xs">Placeholder</Label>
          <Input value={b.placeholder || ''} onChange={(e) => onUpdate({ placeholder: e.target.value } as any)} className="h-8 text-xs" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Required</Label>
        <Switch checked={b.required || false} onCheckedChange={(checked) => onUpdate({ required: checked } as any)} />
      </div>
      {b.helpText !== undefined && (
        <div className="space-y-1.5">
          <Label className="text-xs">Help Text</Label>
          <Input value={b.helpText || ''} onChange={(e) => onUpdate({ helpText: e.target.value } as any)} className="h-8 text-xs" />
        </div>
      )}
      {hasValidation && (
        <div className="space-y-1.5">
          <Label className="text-xs">Validation</Label>
          <Select value={b.validationType || 'none'} onValueChange={(v) => onUpdate({ validationType: v } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {hasMaxLength && (
        <div className="space-y-1.5">
          <Label className="text-xs">Max Length</Label>
          <Input type="number" value={b.maxLength || ''} onChange={(e) => onUpdate({ maxLength: e.target.value } as any)} placeholder="No limit" className="h-8 text-xs" />
        </div>
      )}
      {hasRows && (
        <div className="space-y-1.5">
          <Label className="text-xs">Rows</Label>
          <Input type="number" value={b.rows || 4} onChange={(e) => onUpdate({ rows: parseInt(e.target.value) || 4 } as any)} className="h-8 text-xs" min={2} max={20} />
        </div>
      )}
      {hasLayout && (
        <div className="space-y-1.5">
          <Label className="text-xs">Layout</Label>
          <Select value={b.layout || 'vertical'} onValueChange={(v) => onUpdate({ layout: v } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="horizontal">Horizontal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {hasOptions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Options</Label>
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={addOption}><Plus className="h-3 w-3" /> Add</Button>
          </div>
          <div className="space-y-1">
            {(b.options || []).map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-1">
                <Input value={opt} onChange={(e) => updateOption(i, e.target.value)} className="h-7 text-xs flex-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0" onClick={() => removeOption(i)} disabled={(b.options || []).length <= 1}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const ContentSection = memo(function ContentSection({ block, onUpdate }: { block: EditorBlock; onUpdate: UpdateFn }) {
  const b = block as any;
  if (block.type === BLOCK_TYPES.HEADING) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Heading Text</Label>
          <Input value={b.content || ''} onChange={(e) => onUpdate({ content: e.target.value } as any)} className="h-8 text-xs" />
        </div>
      </div>
    );
  }
  if (block.type === BLOCK_TYPES.PARAGRAPH) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Paragraph Text</Label>
          <textarea value={b.content || ''} onChange={(e) => onUpdate({ content: e.target.value } as any)} rows={5}
            className="w-full px-3 py-2 text-xs bg-card border border-input rounded-md resize-y focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
    );
  }
  if (block.type === BLOCK_TYPES.DIVIDER) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Divider Settings</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Thickness</Label>
            <Input type="number" value={b.thickness || 1} onChange={(e) => onUpdate({ thickness: parseInt(e.target.value) || 1 } as any)} className="h-8 text-xs" min={1} max={8} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Style</Label>
            <Select value={b.style || 'solid'} onValueChange={(v) => onUpdate({ style: v } as any)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                  <div className="h-4 w-4 rounded border border-input" style={{ backgroundColor: b.color || '#e2e8f0' }} />
                  <span>{b.color || 'Default'}</span>
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <ColorPicker value={b.color || '#e2e8f0'} onChange={(color) => onUpdate({ color } as any)}>
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
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Image Settings</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Alt Text</Label>
          <Input value={b.alt || ''} onChange={(e) => onUpdate({ alt: e.target.value } as any)} className="h-8 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Alignment</Label>
          <Select value={b.alignment || 'center'} onValueChange={(v) => onUpdate({ alignment: v } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Border Radius: {b.borderRadius}px</Label>
          <Slider value={[b.borderRadius || 0]} onValueChange={([v]) => onUpdate({ borderRadius: v } as any)} min={0} max={32} className="py-1" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Max Height</Label>
          <Input type="number" value={b.maxHeight || 300} onChange={(e) => onUpdate({ maxHeight: parseInt(e.target.value) || 300 } as any)} className="h-8 text-xs" min={50} max={800} />
        </div>
      </div>
    );
  }
  if (block.type === BLOCK_TYPES.TABLE) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Table Settings</h4>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Header Row</Label>
          <Switch checked={b.headerRow || false} onCheckedChange={(checked) => onUpdate({ headerRow: checked } as any)} />
        </div>
        <p className="text-xs text-muted-foreground">Click cells in the table to edit content. Use buttons below the table to add/remove rows and columns.</p>
      </div>
    );
  }
  if (block.type === BLOCK_TYPES.LIST) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">List Settings</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">List Type</Label>
          <Select value={b.listType || 'unordered'} onValueChange={(v) => onUpdate({ listType: v } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unordered">Bulleted List</SelectItem>
              <SelectItem value="ordered">Numbered List</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">Click items in the list to edit. Press Enter to add new items.</p>
      </div>
    );
  }
  if (block.type === BLOCK_TYPES.BUTTON) {
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Button Settings</h4>
        <div className="space-y-1.5">
          <Label className="text-xs">Button Text</Label>
          <Input value={b.label || ''} onChange={(e) => onUpdate({ label: e.target.value } as any)} className="h-8 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Button Type</Label>
          <Select value={b.buttonType || 'submit'} onValueChange={(v) => onUpdate({ buttonType: v } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="submit">Submit</SelectItem>
              <SelectItem value="button">Button</SelectItem>
              <SelectItem value="reset">Reset</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Variant</Label>
          <Select value={b.variant || 'primary'} onValueChange={(v) => onUpdate({ variant: v } as any)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
  const { state, getSelectedBlock, updateBlockWithHistory, removeBlock, duplicateBlock } = useEditor();
  const isPreview = state.isPreviewMode;
  const block = getSelectedBlock();

  if (isPreview) return null;

  if (!block) {
    return (
      <div className="w-72 bg-editor-sidebar border-l border-editor-border flex flex-col h-full">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inspector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">Select a block on the canvas to view and edit its properties.</p>
        </div>
      </div>
    );
  }

  const onUpdate: UpdateFn = (updates) => updateBlockWithHistory(block.id, updates);
  const blockTypeLabel = block.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="w-72 bg-editor-sidebar border-l border-editor-border flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inspector</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{blockTypeLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateBlock(block.id)}><Copy className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onUpdate({ locked: !block.locked })}>
            {block.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeBlock(block.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <ScrollArea className="flex-1 editor-scrollbar">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-editor-border bg-transparent px-4 h-9">
            <TabsTrigger value="general" className="text-xs h-7 px-2.5 rounded-sm data-[state=active]:bg-secondary">General</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs h-7 px-2.5 rounded-sm data-[state=active]:bg-secondary">Layout</TabsTrigger>
            <TabsTrigger value="style" className="text-xs h-7 px-2.5 rounded-sm data-[state=active]:bg-secondary">Style</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="px-4 py-3 space-y-5">
            <ContentSection block={block} onUpdate={onUpdate} />
            <FieldSettingsSection block={block} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="layout" className="px-4 py-3 space-y-5">
            <LayoutSection block={block} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="style" className="px-4 py-3 space-y-5">
            <TypographySection block={block} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
});

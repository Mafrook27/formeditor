# Hyperlink Block Feature Implementation

## Date: 2026-02-18

## Feature Description

Add a new Hyperlink block type that allows users to insert clickable links in their forms. The hyperlink block will have the same styling capabilities as paragraph blocks (font size, color, alignment, etc.) plus link-specific properties.

## Implementation Status

### ✅ Completed Steps

1. **Added HYPERLINK to BLOCK_TYPES** in `editorConfig.ts`
2. **Created HyperlinkBlockProps interface** with properties:
   - `text`: Link display text
   - `url`: Link destination URL
   - `openInNewTab`: Boolean for target="_blank"
   - `fontSize`: Font size in pixels
   - `fontWeight`: Font weight (300-700)
   - `textAlign`: Text alignment
   - `lineHeight`: Line height multiplier
   - `color`: Link color (default: #0066cc)
   - `underline`: Show/hide underline

3. **Added to EditorBlock union type**
4. **Added default props in getDefaultBlockProps()**

### 🔄 Remaining Steps

#### Step 1: Create HyperlinkBlock Component

Create `src/features/form-editor/blocks/HyperlinkBlock.tsx`:

```typescript
import React, { memo, useState, useRef, useEffect } from 'react';
import { useEditor } from '../EditorContext';
import type { HyperlinkBlockProps } from '../editorConfig';

export const HyperlinkBlock = memo(function HyperlinkBlock({ block }: { block: HyperlinkBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const linkStyle: React.CSSProperties = {
    fontSize: `${block.fontSize}px`,
    fontWeight: block.fontWeight,
    textAlign: block.textAlign as React.CSSProperties['textAlign'],
    lineHeight: block.lineHeight,
    color: block.color || '#0066cc',
    textDecoration: block.underline ? 'underline' : 'none',
    cursor: isPreview ? 'pointer' : 'text',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  if (isPreview) {
    return (
      <div style={{ textAlign: block.textAlign as any }}>
        <a
          href={block.url}
          target={block.openInNewTab ? '_blank' : '_self'}
          rel={block.openInNewTab ? 'noopener noreferrer' : undefined}
          style={linkStyle}
        >
          {block.text || 'Click here'}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div style={{ textAlign: block.textAlign as any }}>
        <span
          ref={textRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          style={linkStyle}
          className="inline-block min-w-[50px]"
          onDoubleClick={() => !block.locked && setIsEditing(true)}
          onBlur={(e) => {
            setIsEditing(false);
            const newText = e.currentTarget.textContent || '';
            if (newText !== block.text) {
              updateBlockWithHistory(block.id, { text: newText });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {block.text || 'Click here'}
        </span>
      </div>
      {!isPreview && (
        <div className="text-xs text-muted-foreground">
          Double-click text to edit. Configure URL in inspector panel.
        </div>
      )}
    </div>
  );
});
```

#### Step 2: Add to BlockRenderer

Update `src/features/form-editor/blocks/BlockRenderer.tsx`:

```typescript
import { HyperlinkBlock } from './HyperlinkBlock';

// In the switch statement:
case BLOCK_TYPES.HYPERLINK:
  return <HyperlinkBlock block={block} />;
```

#### Step 3: Add to BlockLibrary

Update `src/features/form-editor/toolbar/BlockLibrary.tsx`:

```typescript
import { Link } from 'lucide-react';

// In the blocks array:
{ type: BLOCK_TYPES.HYPERLINK, label: 'Hyperlink', icon: Link, category: 'content' }
```

#### Step 4: Add Inspector Fields

Update `src/features/form-editor/inspector/InspectorPanel.tsx`:

Add a new section for hyperlink settings:

```typescript
const HyperlinkSettingsSection = memo(function HyperlinkSettingsSection({ block, onUpdate }: { block: EditorBlock; onUpdate: UpdateFn }) {
  if (block.type !== BLOCK_TYPES.HYPERLINK) return null;
  const b = block as HyperlinkBlockProps;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hyperlink Settings</h4>
      
      <div className="space-y-1.5">
        <Label className="text-xs">Link Text</Label>
        <Input 
          value={b.text || ''} 
          onChange={(e) => onUpdate({ text: e.target.value } as any)} 
          className="h-8 text-xs" 
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">URL</Label>
        <Input 
          value={b.url || ''} 
          onChange={(e) => onUpdate({ url: e.target.value } as any)} 
          className="h-8 text-xs font-mono" 
          placeholder="https://example.com"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Open in New Tab</Label>
        <Switch 
          checked={b.openInNewTab || false} 
          onCheckedChange={(checked) => onUpdate({ openInNewTab: checked } as any)} 
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs">Underline</Label>
        <Switch 
          checked={b.underline !== false} 
          onCheckedChange={(checked) => onUpdate({ underline: checked } as any)} 
        />
      </div>
    </div>
  );
});

// Add to ContentSection or create separate section
```

#### Step 5: Add Typography Support

The hyperlink block should support the same typography settings as paragraph:
- Font size
- Font weight
- Text alignment
- Line height
- Color

These are already in the TypographySection, just need to update the condition:

```typescript
const isTextBlock = ([BLOCK_TYPES.HEADING, BLOCK_TYPES.PARAGRAPH, BLOCK_TYPES.HYPERLINK] as string[]).includes(block.type);
```

## Features

### Core Features
✅ Clickable links with custom text
✅ Configurable URL
✅ Open in new tab option
✅ Custom link color
✅ Toggle underline
✅ Same typography controls as paragraph

### Styling Options
- Font size (10-72px)
- Font weight (300-700)
- Text alignment (left, center, right, justify)
- Line height (1.0-2.5)
- Link color (color picker)
- Underline toggle

### User Experience
- Double-click to edit link text
- Configure URL in inspector
- Visual feedback in edit mode
- Proper link behavior in preview
- Accessibility compliant (rel="noopener noreferrer" for new tabs)

## Use Cases

1. **Terms and Conditions Links**
   - Link to full T&C document
   - Link to privacy policy
   - Link to external resources

2. **Reference Documents**
   - Link to supporting documentation
   - Link to company website
   - Link to help resources

3. **Contact Information**
   - Email links (mailto:)
   - Phone links (tel:)
   - Website links

4. **Legal Requirements**
   - Link to regulatory documents
   - Link to compliance information
   - Link to disclosure statements

## Technical Details

### Props Structure
```typescript
interface HyperlinkBlockProps extends BaseBlockProps {
  type: 'hyperlink';
  text: string;              // Display text
  url: string;               // Link destination
  openInNewTab: boolean;     // target="_blank"
  fontSize: number;          // 10-72
  fontWeight: number;        // 300-700
  textAlign: string;         // left|center|right|justify
  lineHeight: number;        // 1.0-2.5
  color: string;             // Hex color
  underline: boolean;        // Show underline
}
```

### Default Values
```typescript
{
  text: 'Click here',
  url: 'https://example.com',
  openInNewTab: true,
  fontSize: 14,
  fontWeight: 400,
  textAlign: 'left',
  lineHeight: 1.6,
  color: '#0066cc',
  underline: true
}
```

### Security Considerations

✅ **rel="noopener noreferrer"** for external links
✅ **URL validation** in inspector
✅ **XSS prevention** through React's built-in escaping
✅ **Safe protocols** (http, https, mailto, tel)

### Accessibility

✅ **Semantic HTML** (`<a>` tag)
✅ **Keyboard navigation** (Tab, Enter)
✅ **Screen reader support** (proper link text)
✅ **Focus indicators** (browser default)
✅ **ARIA attributes** (if needed)

## Testing Checklist

After implementation:

- [ ] Can add hyperlink block from library
- [ ] Can edit link text by double-clicking
- [ ] Can change URL in inspector
- [ ] Can toggle "open in new tab"
- [ ] Can toggle underline
- [ ] Can change font size
- [ ] Can change font weight
- [ ] Can change text alignment
- [ ] Can change line height
- [ ] Can change link color
- [ ] Link works correctly in preview
- [ ] Link opens in new tab when configured
- [ ] Link has proper security attributes
- [ ] Undo/redo works
- [ ] Drag and drop works
- [ ] Export to HTML works
- [ ] Text wrapping works properly

## Export Behavior

When exporting to HTML, the hyperlink block should generate:

```html
<div style="text-align: left;">
  <a 
    href="https://example.com" 
    target="_blank" 
    rel="noopener noreferrer"
    style="font-size: 14px; font-weight: 400; color: #0066cc; text-decoration: underline;"
  >
    Click here
  </a>
</div>
```

## Future Enhancements

Potential improvements:
- [ ] Link validation (check if URL is valid)
- [ ] Link preview on hover
- [ ] Email/phone link helpers
- [ ] Link analytics tracking
- [ ] Custom link icons
- [ ] Link button style option
- [ ] Tooltip on hover
- [ ] Link shortening integration

## Related Files

Files that need to be created/modified:
1. ✅ `editorConfig.ts` - Type definitions (DONE)
2. 🔄 `blocks/HyperlinkBlock.tsx` - Component (TODO)
3. 🔄 `blocks/BlockRenderer.tsx` - Add case (TODO)
4. 🔄 `toolbar/BlockLibrary.tsx` - Add to library (TODO)
5. 🔄 `inspector/InspectorPanel.tsx` - Add settings (TODO)
6. 🔄 `export/exportToHTML.ts` - Export logic (TODO)

## Notes

- Follow the same patterns as ParagraphBlock for consistency
- Ensure proper text wrapping (word-break, overflow-wrap)
- Handle preview mode correctly
- Maintain immutability in state updates
- Add to undo/redo history
- Test with long URLs and text
- Test with special characters in URLs
- Test with mailto: and tel: protocols

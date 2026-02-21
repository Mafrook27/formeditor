import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../EditorContext';
import { PlaceholderDropdown, usePlaceholderTrigger, insertPlaceholderIntoText } from '../plugins/PlaceholderPlugin';
import { containsPlaceholders } from '../parser/MarkParser';
import type { ParagraphBlockProps } from '../editorConfig';
import styles from '../editor.module.css';

function extractText(el: HTMLElement): string {
  return (el.innerText || '').replace(/\u00a0/g, ' ');
}

const ParagraphContent = memo(function ParagraphContent({ content, isPreview }: { content: string; isPreview: boolean }) {
  if (!content) return isPreview ? null : <span className="text-muted-foreground/50">Click to add text...</span>;

  if (containsPlaceholders(content)) {
    const parts = content.split(/(PH@[\w]+|@[\w]+)/g);
    let charOffset = 0;
    return (
      <>
        {parts.map((part) => {
          const key = `${charOffset}`;
          charOffset += part.length || 1;
          if (part.match(/^(PH@[\w]+|@[\w]+)$/)) {
            return (
              <span
                key={key}
                className="bg-primary/10 text-primary font-medium px-1 rounded"
                style={{ backgroundColor: '#b3d4fc', color: '#000', padding: '0 2px' }}
              >
                {part}
              </span>
            );
          }
          return <React.Fragment key={key}>{part}</React.Fragment>;
        })}
      </>
    );
  }

  return <>{content}</>;
});

export const ParagraphBlock = memo(function ParagraphBlock({ block }: { block: ParagraphBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const isSelectingPlaceholderRef = useRef(false);

  const handlePlaceholderInsert = useCallback((placeholder: string, position: number) => {
    if (!editRef.current) return;
    isSelectingPlaceholderRef.current = true;
    const currentText = extractText(editRef.current);
    const newContent = insertPlaceholderIntoText(currentText, placeholder, position);
    
    // Update state first
    updateBlockWithHistory(block.id, { content: newContent });
    
    // Then handle cursor position after React updates
    setTimeout(() => {
      if (editRef.current) {
        editRef.current.focus();
        isSelectingPlaceholderRef.current = false;
      }
    }, 50); // Increased delay to let React finish updating
  }, [block.id, updateBlockWithHistory]);

  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });

  useEffect(() => {
    if (isEditing && editRef.current) editRef.current.focus();
  }, [isEditing]);

  const paraStyle: React.CSSProperties = {
    fontSize: `${block.fontSize}px`,
    fontWeight: block.fontWeight,
    textAlign: block.textAlign as React.CSSProperties['textAlign'],
    lineHeight: block.lineHeight,
    color: block.color || 'inherit',
    outline: 'none',
    cursor: isPreview ? 'default' : 'text',
  };

  if (isPreview) {
    return <p className={styles.canvasBlock} style={paraStyle}><ParagraphContent content={block.content} isPreview={isPreview} /></p>;
  }

  return (
    <>
      <div
        ref={editRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        style={paraStyle}
        className={`min-h-[1.5em] ${styles.canvasBlock}`}
        role="textbox"
        tabIndex={0}
        onDoubleClick={() => !block.locked && setIsEditing(true)}
        onBlur={(e) => {
          if (isSelectingPlaceholderRef.current) return;
          setIsEditing(false);
          placeholderTrigger.close();
          const newContent = extractText(e.currentTarget);
          if (newContent !== block.content) {
            updateBlockWithHistory(block.id, { content: newContent });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { 
            e.preventDefault(); 
            e.currentTarget.blur(); 
          }
          // Don't prevent space key - let it work naturally
          if (editRef.current) {
            placeholderTrigger.handleKeyDown(e as any, editRef.current);
          }
        }}
      >
        <ParagraphContent content={block.content} isPreview={isPreview} />
      </div>

      <PlaceholderDropdown
        isOpen={placeholderTrigger.isOpen}
        onClose={placeholderTrigger.close}
        onSelect={placeholderTrigger.handleSelect}
        position={placeholderTrigger.position}
        searchTerm={placeholderTrigger.searchTerm}
      />
    </>
  );
});

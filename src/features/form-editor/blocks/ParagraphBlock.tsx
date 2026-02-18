import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../EditorContext';
import { PlaceholderDropdown, usePlaceholderTrigger, insertPlaceholderIntoText } from '../plugins/PlaceholderPlugin';
import { containsPlaceholders } from '../parser/MarkParser';
import type { ParagraphBlockProps } from '../editorConfig';

export const ParagraphBlock = memo(function ParagraphBlock({ block }: { block: ParagraphBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const isSelectingPlaceholderRef = useRef(false);
  
  const handlePlaceholderInsert = useCallback((placeholder: string, position: number) => {
    if (!editRef.current) return;
    
    isSelectingPlaceholderRef.current = true;
    
    const currentText = editRef.current.textContent || '';
    const newContent = insertPlaceholderIntoText(currentText, placeholder, position);
    
    // Update the block content
    updateBlockWithHistory(block.id, { content: newContent });
    
    // Set cursor position after the inserted placeholder
    setTimeout(() => {
      if (editRef.current) {
        editRef.current.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Calculate new cursor position (after placeholder + space)
        const newCursorPos = position + placeholder.length + 1;
        
        // Find the text node and set cursor
        const textNode = editRef.current.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const safePos = Math.min(newCursorPos, textNode.textContent?.length || 0);
          range.setStart(textNode, safePos);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        isSelectingPlaceholderRef.current = false;
      }
    }, 0);
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
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };
  
  // Render content with placeholder highlighting
  const renderContent = () => {
    const content = block.content;
    if (!content) return isPreview ? '' : <span className="text-muted-foreground/50">Click to add text...</span>;
    
    // Check for placeholders and highlight them (both @Name and PH@Name formats)
    if (containsPlaceholders(content)) {
      const parts = content.split(/(PH@[\w]+|@[\w]+)/g);
      return parts.map((part, idx) => {
        if (part.match(/^(PH@[\w]+|@[\w]+)$/)) {
          return (
            <span 
              key={idx} 
              className="bg-primary/10 text-primary font-medium px-1 rounded"
              style={{ backgroundColor: '#b3d4fc', color: '#000', padding: '0 2px' }}
            >
              {part}
            </span>
          );
        }
        return part;
      });
    }
    
    return content;
  };

  if (isPreview) {
    return <p style={paraStyle}>{renderContent()}</p>;
  }

  return (
    <>
      <div
        ref={editRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        style={paraStyle}
        className="min-h-[1.5em]"
        onDoubleClick={() => !block.locked && setIsEditing(true)}
        onBlur={(e) => {
          // Don't blur if we're selecting a placeholder
          if (isSelectingPlaceholderRef.current) {
            return;
          }
          
          setIsEditing(false);
          placeholderTrigger.close();
          const newContent = e.currentTarget.textContent || '';
          if (newContent !== block.content) {
            updateBlockWithHistory(block.id, { content: newContent });
          }
        }}
        onKeyDown={(e) => {
          if (editRef.current) {
            placeholderTrigger.handleKeyDown(e as any, editRef.current);
          }
        }}
      >
        {renderContent()}
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

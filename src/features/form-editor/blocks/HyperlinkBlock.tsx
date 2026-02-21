import React, { memo, useState, useRef } from 'react';
import { useEditor } from '../EditorContext';
import type { HyperlinkBlockProps } from '../editorConfig';
import styles from '../editor.module.css';

export const HyperlinkBlock = memo(function HyperlinkBlock({ block }: { block: HyperlinkBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  const linkStyle: React.CSSProperties = {
    fontSize: `${block.fontSize}px`,
    fontWeight: block.fontWeight,
    lineHeight: block.lineHeight,
    color: block.color || '#0066cc',
    textDecoration: block.underline ? 'underline' : 'none',
    cursor: isPreview ? 'pointer' : 'text',
    display: 'inline-block',
  };

  const containerStyle: React.CSSProperties = {
    textAlign: block.textAlign as React.CSSProperties['textAlign'],
  };

  if (isPreview) {
    return (
      <div style={containerStyle}>
        <a
          href={block.url || '#'}
          target={block.openInNewTab ? '_blank' : '_self'}
          rel={block.openInNewTab ? 'noopener noreferrer' : undefined}
          className={styles.canvasBlock}
          style={linkStyle}
        >
          {block.text || 'Click here'}
        </a>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <span
        ref={textRef}
        contentEditable={isEditing && !block.locked}
        suppressContentEditableWarning
        style={linkStyle}
        className={`min-w-[50px] outline-none ${styles.canvasBlock}`}
        onDoubleClick={() => !block.locked && setIsEditing(true)}
        onBlur={(e) => {
          setIsEditing(false);
          const newText = (e.currentTarget.innerText || '').replace(/\u00a0/g, ' ');
          if (newText !== block.text) {
            updateBlockWithHistory(block.id, { text: newText });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          }
          // Don't prevent space key - let it work naturally
        }}
      >
        {block.text || 'Click here'}
      </span>
      {!isEditing && (
        <span className="ml-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          (Double-click to edit)
        </span>
      )}
    </div>
  );
});

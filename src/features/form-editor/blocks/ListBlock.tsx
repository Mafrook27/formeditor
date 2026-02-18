import React, { memo, useState, useRef, useEffect } from 'react';
import { useEditor } from '../EditorContext';
import { Button } from '@/components/ui/button';
import { Plus, X, GripVertical } from 'lucide-react';
import type { ListBlockProps } from '../editorConfig';

export const ListBlock = memo(function ListBlock({ block }: { block: ListBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex]);
  
  const updateItem = (idx: number, value: string) => {
    const newItems = block.items.map((item, i) => (i === idx ? value : item));
    updateBlockWithHistory(block.id, { items: newItems });
  };
  
  const addItem = () => {
    updateBlockWithHistory(block.id, { items: [...block.items, ''] });
    setEditingIndex(block.items.length);
  };
  
  const removeItem = (idx: number) => {
    if (block.items.length <= 1) return;
    const newItems = block.items.filter((_, i) => i !== idx);
    updateBlockWithHistory(block.id, { items: newItems });
    if (editingIndex === idx) setEditingIndex(null);
  };
  
  const toggleListType = () => {
    updateBlockWithHistory(block.id, { 
      listType: block.listType === 'ordered' ? 'unordered' : 'ordered' 
    });
  };
  
  const handleItemClick = (idx: number) => {
    if (!isPreview && !block.locked) {
      setEditingIndex(idx);
    }
  };
  
  const handleBlur = () => {
    setEditingIndex(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    } else if (e.key === 'Backspace' && block.items[idx] === '' && block.items.length > 1) {
      e.preventDefault();
      removeItem(idx);
      if (idx > 0) setEditingIndex(idx - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < block.items.length - 1) setEditingIndex(idx + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) setEditingIndex(idx - 1);
    }
  };
  
  const ListTag = block.listType === 'ordered' ? 'ol' : 'ul';
  
  return (
    <div className="space-y-2">
      <ListTag className={`${block.listType === 'ordered' ? 'list-decimal' : 'list-disc'} ml-5 space-y-1`}>
        {block.items.map((item, idx) => (
          <li key={idx} className="text-sm">
            {editingIndex === idx ? (
              <input
                ref={inputRef}
                type="text"
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-full bg-transparent border-0 outline-none ring-0 focus:ring-2 focus:ring-primary rounded px-1 -mx-1"
              />
            ) : (
              <span 
                className={`${!isPreview && !block.locked ? 'cursor-text hover:bg-primary/5 px-1 -mx-1 rounded block' : ''}`}
                onClick={() => handleItemClick(idx)}
              >
                {item || (isPreview ? '' : <span className="text-muted-foreground/50">Click to edit</span>)}
              </span>
            )}
          </li>
        ))}
      </ListTag>
      
      {!isPreview && !block.locked && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addItem}>
            <Plus className="h-3 w-3" /> Item
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={toggleListType}>
            {block.listType === 'ordered' ? 'Numbered' : 'Bulleted'}
          </Button>
          {block.items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={() => removeItem(block.items.length - 1)}
            >
              <X className="h-3 w-3" /> Remove Last
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

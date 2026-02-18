// Table Block - Full cell editing with same text engine as paragraphs
// Supports placeholders (@Name and PH@Name formats)

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../EditorContext';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { containsPlaceholders } from '../parser/MarkParser';
import { PlaceholderDropdown, usePlaceholderTrigger, insertPlaceholderIntoText } from '../plugins/PlaceholderPlugin';
import type { TableBlockProps } from '../editorConfig';

export const TableBlock = memo(function TableBlock({ block }: { block: TableBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValue, setCellValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Placeholder support for cells
  const handlePlaceholderInsert = useCallback((placeholder: string, position: number) => {
    if (editingCell) {
      const newValue = insertPlaceholderIntoText(cellValue, placeholder, position);
      setCellValue(newValue);
    }
  }, [editingCell, cellValue]);
  
  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });
  
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);
  
  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = block.rows.map((row, ri) =>
      row.map((cell, ci) => (ri === rowIdx && ci === colIdx ? value : cell))
    );
    updateBlockWithHistory(block.id, { rows: newRows });
  };
  
  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if (!isPreview && !block.locked) {
      const currentValue = block.rows[rowIdx]?.[colIdx] || '';
      setCellValue(currentValue);
      setEditingCell({ row: rowIdx, col: colIdx });
    }
  };
  
  const handleCellBlur = () => {
    if (editingCell) {
      updateCell(editingCell.row, editingCell.col, cellValue);
      setEditingCell(null);
      placeholderTrigger.close();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editingCell) return;
    
    // Handle placeholder trigger
    if (inputRef.current) {
      placeholderTrigger.handleKeyDown(e as any, inputRef.current);
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellBlur();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Save current cell
      updateCell(editingCell.row, editingCell.col, cellValue);
      
      // Move to next cell
      const nextCol = editingCell.col + 1;
      const colCount = block.rows[0]?.length || 0;
      
      if (nextCol < colCount) {
        const nextValue = block.rows[editingCell.row]?.[nextCol] || '';
        setCellValue(nextValue);
        setEditingCell({ row: editingCell.row, col: nextCol });
      } else if (editingCell.row + 1 < block.rows.length) {
        const nextValue = block.rows[editingCell.row + 1]?.[0] || '';
        setCellValue(nextValue);
        setEditingCell({ row: editingCell.row + 1, col: 0 });
      } else {
        setEditingCell(null);
        placeholderTrigger.close();
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      placeholderTrigger.close();
    }
  };
  
  const addRow = () => {
    const colCount = block.rows[0]?.length || 3;
    const newRow = Array(colCount).fill('');
    updateBlockWithHistory(block.id, { rows: [...block.rows, newRow] });
  };
  
  const removeRow = (idx: number) => {
    if (block.rows.length <= 1) return;
    const newRows = block.rows.filter((_, i) => i !== idx);
    updateBlockWithHistory(block.id, { rows: newRows });
  };
  
  const addColumn = () => {
    const newRows = block.rows.map((row, idx) => 
      [...row, idx === 0 && block.headerRow ? 'Header' : '']
    );
    updateBlockWithHistory(block.id, { rows: newRows });
  };
  
  const removeColumn = (colIdx: number) => {
    if ((block.rows[0]?.length || 0) <= 1) return;
    const newRows = block.rows.map(row => row.filter((_, ci) => ci !== colIdx));
    updateBlockWithHistory(block.id, { rows: newRows });
  };
  
  // Render cell content with placeholder highlighting
  const renderCellContent = (content: string, isHeader: boolean) => {
    if (!content) {
      if (isPreview) return null;
      return <span className="text-muted-foreground/50 text-xs">Click to edit</span>;
    }
    
    // Highlight placeholders (both @Name and PH@Name formats)
    if (containsPlaceholders(content)) {
      const parts = content.split(/(PH@[\w]+|@[\w]+)/g);
      return (
        <>
          {parts.map((part, idx) => {
            if (part.match(/^(PH@[\w]+|@[\w]+)$/)) {
              return (
                <span 
                  key={idx} 
                  className="bg-primary/10 text-primary font-medium px-0.5 rounded"
                  style={{ backgroundColor: '#b3d4fc', color: '#000', padding: '0 2px' }}
                >
                  {part}
                </span>
              );
            }
            return part;
          })}
        </>
      );
    }
    
    return content;
  };
  
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" data-testid="table-block">
          {block.rows.map((row, rowIdx) => {
            const isHeader = block.headerRow && rowIdx === 0;
            const Tag = isHeader ? 'th' : 'td';
            
            // Use proper thead/tbody structure
            if (isHeader) {
              return (
                <thead key={rowIdx}>
                  <tr className="bg-muted/50">
                    {row.map((cell, colIdx) => (
                      <Tag
                        key={colIdx}
                        className={`border border-border p-2 font-semibold text-left ${
                          editingCell?.row === rowIdx && editingCell?.col === colIdx ? 'p-0' : ''
                        }`}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                      >
                        {editingCell?.row === rowIdx && editingCell?.col === colIdx ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={cellValue}
                            onChange={(e) => setCellValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full p-2 bg-background border-0 outline-none ring-2 ring-primary font-semibold"
                          />
                        ) : (
                          <span className={!isPreview && !block.locked ? 'cursor-text hover:bg-primary/5 block px-1 -mx-1 rounded' : ''}>
                            {renderCellContent(cell, true)}
                          </span>
                        )}
                      </Tag>
                    ))}
                    {!isPreview && !block.locked && (
                      <td className="border border-border p-1 w-8 bg-muted/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeRow(rowIdx)}
                          disabled={block.rows.length <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </td>
                    )}
                  </tr>
                </thead>
              );
            }
            
            // Body rows
            return (
              <tbody key={rowIdx}>
                <tr className={rowIdx % 2 === 1 ? 'bg-muted/20' : ''}>
                  {row.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={`border border-border p-2 ${
                        editingCell?.row === rowIdx && editingCell?.col === colIdx ? 'p-0' : ''
                      }`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                    >
                      {editingCell?.row === rowIdx && editingCell?.col === colIdx ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={handleKeyDown}
                          className="w-full p-2 bg-background border-0 outline-none ring-2 ring-primary"
                        />
                      ) : (
                        <span className={!isPreview && !block.locked ? 'cursor-text hover:bg-primary/5 block px-1 -mx-1 rounded' : ''}>
                          {renderCellContent(cell, false)}
                        </span>
                      )}
                    </td>
                  ))}
                  {!isPreview && !block.locked && (
                    <td className="border border-border p-1 w-8">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeRow(rowIdx)}
                        disabled={block.rows.length <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </td>
                  )}
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>
      
      {/* Table controls */}
      {!isPreview && !block.locked && (
        <div className="flex items-center gap-2 justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs gap-1" 
            onClick={addRow}
            data-testid="add-row-btn"
          >
            <Plus className="h-3 w-3" /> Row
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs gap-1" 
            onClick={addColumn}
            data-testid="add-column-btn"
          >
            <Plus className="h-3 w-3" /> Column
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => removeColumn(block.rows[0].length - 1)}
            disabled={(block.rows[0]?.length || 0) <= 1}
            data-testid="remove-column-btn"
          >
            <Minus className="h-3 w-3" /> Column
          </Button>
        </div>
      )}
      
      {/* Placeholder dropdown */}
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

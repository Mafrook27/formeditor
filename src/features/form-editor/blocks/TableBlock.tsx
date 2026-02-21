import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../EditorContext';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { containsPlaceholders } from '../parser/MarkParser';
import { PlaceholderDropdown, usePlaceholderTrigger, insertPlaceholderIntoText } from '../plugins/PlaceholderPlugin';
import type { TableBlockProps } from '../editorConfig';
import editorStyles from '../editor.module.css';

const CellContent = memo(function CellContent({ content, isPreview }: { content: string; isPreview: boolean }) {
  if (!content) {
    if (isPreview) return null;
    return <span className="text-muted-foreground/50 text-xs">Click to edit</span>;
  }

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
                className="bg-primary/10 text-primary font-medium px-0.5 rounded"
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

const MIN_COL_WIDTH = 5;
const MIN_ROW_HEIGHT = 24;

function getColumnWidths(block: TableBlockProps): number[] {
  const colCount = block.rows?.[0]?.length || 1;
  if (block.columnWidths && block.columnWidths.length === colCount) {
    return block.columnWidths;
  }
  return Array(colCount).fill(100 / colCount);
}

function getRowHeights(block: TableBlockProps): (number | undefined)[] {
  const rowCount = block.rows?.length || 1;
  if (block.rowHeights && block.rowHeights.length === rowCount) {
    return block.rowHeights;
  }
  return Array(rowCount).fill(undefined);
}

export const TableBlock = memo(function TableBlock({ block }: { block: TableBlockProps }) {
  const { state, updateBlockWithHistory } = useEditor();
  const isPreview = state.isPreviewMode;
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValue, setCellValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);

  const rows = block.rows || [['Header 1', 'Header 2', 'Header 3'], ['Cell 1', 'Cell 2', 'Cell 3']];

  const colWidths = getColumnWidths(block);
  const rowHeights = getRowHeights(block);
  const [localWidths, setLocalWidths] = useState<number[] | null>(null);
  const [localRowHeights, setLocalRowHeights] = useState<(number | undefined)[] | null>(null);
  const activeWidths = localWidths || colWidths;
  const activeRowHeights = localRowHeights || rowHeights;

  const colResizeState = useRef<{
    colIdx: number;
    startX: number;
    startWidths: number[];
    tableWidth: number;
  } | null>(null);

  const rowResizeState = useRef<{
    rowIdx: number;
    startY: number;
    startHeight: number;
  } | null>(null);

  const rowIdCounter = useRef(0);
  const rowIds = useRef<string[]>([]);
  while (rowIds.current.length < rows.length) {
    rowIds.current.push(`r${rowIdCounter.current++}`);
  }
  if (rowIds.current.length > rows.length) {
    rowIds.current.length = rows.length;
  }

  const colIdCounter = useRef(0);
  const colIds = useRef<string[]>([]);
  const colCount = rows[0]?.length || 0;
  while (colIds.current.length < colCount) {
    colIds.current.push(`c${colIdCounter.current++}`);
  }
  if (colIds.current.length > colCount) {
    colIds.current.length = colCount;
  }

  const handlePlaceholderInsert = useCallback((placeholder: string, position: number) => {
    if (editingCell) {
      const newValue = insertPlaceholderIntoText(cellValue, placeholder, position);
      setCellValue(newValue);
    }
  }, [editingCell, cellValue]);

  const placeholderTrigger = usePlaceholderTrigger({
    onInsert: handlePlaceholderInsert,
  });

  const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, []);

  const handleCellValueChange = useCallback((value: string, textarea: HTMLTextAreaElement) => {
    setCellValue(value);
    autoResizeTextarea(textarea);
  }, [autoResizeTextarea]);

  useEffect(() => {
    if (editingCell && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      autoResizeTextarea(textareaRef.current);
    }
  }, [editingCell, autoResizeTextarea]);

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = rows.map((row, ri) =>
      row.map((cell, ci) => (ri === rowIdx && ci === colIdx ? value : cell))
    );
    updateBlockWithHistory(block.id, { rows: newRows });
  };

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if (!isPreview && !block.locked) {
      const currentValue = rows[rowIdx]?.[colIdx] || '';
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

    if (textareaRef.current) {
      placeholderTrigger.handleKeyDown(e as any, textareaRef.current);
    }

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCellBlur();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      updateCell(editingCell.row, editingCell.col, cellValue);

      const nextCol = editingCell.col + 1;
      const cc = rows[0]?.length || 0;

      if (nextCol < cc) {
        const nextValue = rows[editingCell.row]?.[nextCol] || '';
        setCellValue(nextValue);
        setEditingCell({ row: editingCell.row, col: nextCol });
      } else if (editingCell.row + 1 < rows.length) {
        const nextValue = rows[editingCell.row + 1]?.[0] || '';
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

  const localWidthsRef = useRef(localWidths);
  localWidthsRef.current = localWidths;

  const localRowHeightsRef = useRef(localRowHeights);
  localRowHeightsRef.current = localRowHeights;

  const handleColResizeStart = useCallback((colIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tableRef.current) return;

    const tableWidth = tableRef.current.getBoundingClientRect().width;
    colResizeState.current = {
      colIdx,
      startX: e.clientX,
      startWidths: [...colWidths],
      tableWidth,
    };
    setResizingCol(colIdx);

    const onMouseMove = (ev: MouseEvent) => {
      const rs = colResizeState.current;
      if (!rs) return;
      const deltaPx = ev.clientX - rs.startX;
      const deltaPct = (deltaPx / rs.tableWidth) * 100;

      const newWidths = [...rs.startWidths];
      const leftW = rs.startWidths[rs.colIdx] + deltaPct;
      const rightW = rs.startWidths[rs.colIdx + 1] - deltaPct;

      if (leftW < MIN_COL_WIDTH || rightW < MIN_COL_WIDTH) return;

      newWidths[rs.colIdx] = leftW;
      newWidths[rs.colIdx + 1] = rightW;
      setLocalWidths(newWidths);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const finalWidths = localWidthsRef.current;
      if (finalWidths) {
        const rounded = finalWidths.map(w => Math.round(w * 100) / 100);
        updateBlockWithHistory(block.id, { columnWidths: rounded });
      }
      setLocalWidths(null);
      setResizingCol(null);
      colResizeState.current = null;
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [colWidths, block.id, updateBlockWithHistory]);

  const handleRowResizeStart = useCallback((rowIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tableRef.current) return;

    const trElements = tableRef.current.querySelectorAll('tr');
    const tr = trElements[rowIdx];
    if (!tr) return;

    const currentHeight = tr.getBoundingClientRect().height;
    rowResizeState.current = {
      rowIdx,
      startY: e.clientY,
      startHeight: currentHeight,
    };
    setResizingRow(rowIdx);

    const currentHeights = [...(localRowHeightsRef.current || rowHeights)];

    const onMouseMove = (ev: MouseEvent) => {
      const rs = rowResizeState.current;
      if (!rs) return;
      const deltaY = ev.clientY - rs.startY;
      const newHeight = Math.max(MIN_ROW_HEIGHT, rs.startHeight + deltaY);

      const newHeights = [...currentHeights];
      newHeights[rs.rowIdx] = Math.round(newHeight);
      setLocalRowHeights(newHeights);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const finalHeights = localRowHeightsRef.current;
      if (finalHeights) {
        updateBlockWithHistory(block.id, { rowHeights: finalHeights.map(h => h || 0) });
      }
      setLocalRowHeights(null);
      setResizingRow(null);
      rowResizeState.current = null;
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [rowHeights, block.id, updateBlockWithHistory]);

  const addRow = () => {
    const cc = rows[0]?.length || 3;
    const newRow = Array(cc).fill('');
    const newHeights = block.rowHeights ? [...block.rowHeights, 0] : undefined;
    updateBlockWithHistory(block.id, { rows: [...rows, newRow], ...(newHeights ? { rowHeights: newHeights } : {}) });
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    rowIds.current.splice(idx, 1);
    const newRows = rows.filter((_, i) => i !== idx);
    const newHeights = block.rowHeights ? block.rowHeights.filter((_, i) => i !== idx) : undefined;
    updateBlockWithHistory(block.id, { rows: newRows, ...(newHeights ? { rowHeights: newHeights } : {}) });
  };

  const addColumn = () => {
    const newRows = rows.map((row, idx) =>
      [...row, idx === 0 && block.headerRow ? 'Header' : '']
    );
    const equalWidth = 100 / (colWidths.length + 1);
    const normalized = Array(colWidths.length + 1).fill(equalWidth);
    updateBlockWithHistory(block.id, { rows: newRows, columnWidths: normalized });
  };

  const removeColumn = (colIdx: number) => {
    if ((rows[0]?.length || 0) <= 1) return;
    colIds.current.splice(colIdx, 1);
    const newRows = rows.map(row => row.filter((_, ci) => ci !== colIdx));
    const newWidths = colWidths.filter((_, ci) => ci !== colIdx);
    const total = newWidths.reduce((s, w) => s + w, 0);
    const normalized = newWidths.map(w => (w / total) * 100);
    updateBlockWithHistory(block.id, { rows: newRows, columnWidths: normalized });
  };

  const isEditable = !isPreview && !block.locked;

  const renderResizeHandle = (type: 'col' | 'row', idx: number) => {
    if (type === 'col') {
      const isActive = resizingCol === idx;
      return (
        <div
          onMouseDown={(e) => handleColResizeStart(idx, e)}
          style={{
            position: 'absolute',
            top: 0,
            right: -3,
            width: 7,
            height: '100%',
            cursor: 'col-resize',
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 2,
              width: isActive ? 3 : 2,
              height: '100%',
              backgroundColor: isActive ? '#3b82f6' : 'transparent',
              borderRadius: 1,
              transition: isActive ? 'none' : 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { if (resizingCol === null) (e.currentTarget as HTMLElement).style.backgroundColor = '#3b82f6'; }}
            onMouseLeave={(e) => { if (resizingCol === null) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          />
        </div>
      );
    }
    const isActive = resizingRow === idx;
    return (
      <div
        onMouseDown={(e) => handleRowResizeStart(idx, e)}
        style={{
          position: 'absolute',
          left: 0,
          bottom: -3,
          width: '100%',
          height: 7,
          cursor: 'row-resize',
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 2,
            height: isActive ? 3 : 2,
            width: '100%',
            backgroundColor: isActive ? '#3b82f6' : 'transparent',
            borderRadius: 1,
            transition: isActive ? 'none' : 'background-color 0.15s',
          }}
          onMouseEnter={(e) => { if (resizingRow === null) (e.currentTarget as HTMLElement).style.backgroundColor = '#3b82f6'; }}
          onMouseLeave={(e) => { if (resizingRow === null) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-2" style={{ minWidth: 0 }}>
      <div style={{ minWidth: 0, width: '100%', display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <table
            ref={tableRef}
            className="w-full border-collapse text-sm"
            data-testid="table-block"
            style={{
              tableLayout: 'fixed',
              width: '100%',
              minWidth: 0,
            }}
          >
            <colgroup>
              {activeWidths.map((w, i) => (
                <col key={colIds.current[i] || i} style={{ width: `${w}%` }} />
              ))}
            </colgroup>
            {rows.map((row, rowIdx) => {
              const isHeader = block.headerRow && rowIdx === 0;
              const Wrapper = isHeader ? 'thead' : 'tbody';
              const rh = activeRowHeights[rowIdx];
              const isFirstRow = rowIdx === 0;
              const canResizeRow = isEditable && rowIdx < rows.length - 1;

              return (
                <Wrapper key={rowIds.current[rowIdx]}>
                  <tr
                    className={isHeader ? 'bg-muted/50' : rowIdx % 2 === 1 ? 'bg-muted/20' : ''}
                    style={{ height: rh && rh > 0 ? `${rh}px` : undefined }}
                  >
                    {row.map((cell, ci) => {
                      const isCellEditing = editingCell?.row === rowIdx && editingCell?.col === ci;
                      const canResizeCol = isEditable && isFirstRow && ci < row.length - 1;
                      const showRowHandle = canResizeRow && ci === 0;
                      const needsRelative = isEditable && (canResizeCol || showRowHandle);
                      const Tag = isHeader ? 'th' : 'td';
                      return (
                        <Tag
                          key={colIds.current[ci]}
                          className={`border border-border p-2 ${isHeader ? 'font-semibold text-left' : ''} ${isCellEditing ? 'p-0' : ''} ${editorStyles.canvasCell}`}
                          onClick={() => handleCellClick(rowIdx, ci)}
                          style={{
                            minWidth: 0,
                            position: needsRelative ? 'relative' : undefined,
                            verticalAlign: 'top',
                          }}
                        >
                          {isCellEditing ? (
                            <textarea
                              ref={textareaRef}
                              value={cellValue}
                              onChange={(e) => handleCellValueChange(e.target.value, e.target)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleKeyDown}
                              className={`w-full p-2 bg-background border-0 outline-none ring-2 ring-primary resize-none${isHeader ? ' font-semibold' : ''}`}
                              style={{
                                minHeight: '2.5rem',
                                overflow: 'hidden',
                              }}
                            />
                          ) : (
                            <span
                              className={`${isEditable ? 'cursor-text hover:bg-primary/5 block px-1 -mx-1 rounded' : ''} ${editorStyles.canvasCell}`}
                            >
                              <CellContent content={cell} isPreview={isPreview} />
                            </span>
                          )}
                          {canResizeCol && renderResizeHandle('col', ci)}
                          {showRowHandle && renderResizeHandle('row', rowIdx)}
                        </Tag>
                      );
                    })}
                  </tr>
                </Wrapper>
              );
            })}
          </table>
        </div>

        {isEditable && (
          <div style={{ width: 28, flexShrink: 0 }}>
            {rows.map((_, rowIdx) => {
              const isHeader = block.headerRow && rowIdx === 0;
              const rh = activeRowHeights[rowIdx];
              return (
                <div
                  key={rowIds.current[rowIdx]}
                  className={`flex items-start justify-center border-b border-border ${isHeader ? 'bg-muted/50' : ''}`}
                  style={{ minHeight: rh && rh > 0 ? rh : 36 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive mt-1"
                    onClick={() => removeRow(rowIdx)}
                    disabled={rows.length <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isEditable && (
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
            onClick={() => removeColumn(rows[0].length - 1)}
            disabled={(rows[0]?.length || 0) <= 1}
            data-testid="remove-column-btn"
          >
            <Minus className="h-3 w-3" /> Column
          </Button>
        </div>
      )}

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

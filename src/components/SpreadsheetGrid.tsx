import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sheet, CellCoord, CellRange, SelectionState } from '../types/spreadsheet';
import { cellKey, colToLetter, formatCellValue, parseRange } from '../utils/cellUtils';
import { Copy, Scissors, Clipboard, Plus, Trash2, ArrowUpDown, AlignLeft } from 'lucide-react';

interface SpreadsheetGridProps {
  sheet: Sheet;
  selection: SelectionState;
  onSelectCell: (coord: CellCoord, expandRange?: boolean) => void;
  onRangeSelect: (range: CellRange) => void;
  onUpdateCell: (coord: CellCoord, rawValue: string) => void;
  onResizeCol: (col: number, width: number) => void;
  onInsertRow: (position: 'above' | 'below') => void;
  onDeleteRow: () => void;
  onInsertCol: (position: 'left' | 'right') => void;
  onDeleteCol: () => void;
}

const DEFAULT_COL_WIDTH = 110;
const DEFAULT_ROW_HEIGHT = 28;

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  sheet,
  selection,
  onSelectCell,
  onRangeSelect,
  onUpdateCell,
  onResizeCol,
  onInsertRow,
  onDeleteRow,
  onInsertCol,
  onDeleteCol,
}) => {
  const [editingCell, setEditingCell] = useState<CellCoord | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState<CellCoord | null>(null);

  // Column resizing state
  const [resizingCol, setResizingCol] = useState<{ col: number; startX: number; startWidth: number } | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; coord: CellCoord } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Column widths map
  const getColWidth = (c: number) => sheet.colWidths?.[c] || DEFAULT_COL_WIDTH;

  // Active range normalization
  const effectiveRange = selection.range || {
    startRow: selection.activeCell.row,
    startCol: selection.activeCell.col,
    endRow: selection.activeCell.row,
    endCol: selection.activeCell.col,
  };

  const isCellSelected = (r: number, c: number) => {
    return (
      r >= effectiveRange.startRow &&
      r <= effectiveRange.endRow &&
      c >= effectiveRange.startCol &&
      c <= effectiveRange.endCol
    );
  };

  const isCellActive = (r: number, c: number) => {
    return r === selection.activeCell.row && c === selection.activeCell.col;
  };

  // Start inline editing
  const startEditing = useCallback(
    (coord: CellCoord, initialVal?: string) => {
      setEditingCell(coord);
      const cell = sheet.data[cellKey(coord.row, coord.col)];
      const val = initialVal !== undefined ? initialVal : cell?.raw ?? '';
      setEditValue(val);
      setTimeout(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }, 20);
    },
    [sheet.data]
  );

  const commitEdit = useCallback(() => {
    if (editingCell) {
      onUpdateCell(editingCell, editValue);
      setEditingCell(null);
    }
  }, [editingCell, editValue, onUpdateCell]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside formula bar or modal
      const activeTag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        if (editingCell && e.key === 'Enter') {
          e.preventDefault();
          commitEdit();
          // Move down
          const nextRow = Math.min(sheet.rowCount - 1, selection.activeCell.row + 1);
          onSelectCell({ row: nextRow, col: selection.activeCell.col });
        } else if (editingCell && e.key === 'Tab') {
          e.preventDefault();
          commitEdit();
          // Move right
          const nextCol = Math.min(sheet.colCount - 1, selection.activeCell.col + 1);
          onSelectCell({ row: selection.activeCell.row, col: nextCol });
        } else if (editingCell && e.key === 'Escape') {
          cancelEdit();
        }
        return;
      }

      if (contextMenu) {
        setContextMenu(null);
      }

      const { row, col } = selection.activeCell;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextR = Math.max(0, row - 1);
        onSelectCell({ row: nextR, col }, e.shiftKey);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextR = Math.min(sheet.rowCount - 1, row + 1);
        onSelectCell({ row: nextR, col }, e.shiftKey);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const nextC = Math.max(0, col - 1);
        onSelectCell({ row, col: nextC }, e.shiftKey);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextC = Math.min(sheet.colCount - 1, col + 1);
        onSelectCell({ row, col: nextC }, e.shiftKey);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        startEditing({ row, col });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onUpdateCell({ row, col }, '');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Start typing directly into active cell
        startEditing({ row, col }, e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, editingCell, sheet.rowCount, sheet.colCount, commitEdit, cancelEdit, startEditing, onSelectCell, onUpdateCell, contextMenu]);

  // Column resize mouse drag
  useEffect(() => {
    if (!resizingCol) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizingCol.startX;
      const newWidth = Math.max(40, resizingCol.startWidth + diff);
      onResizeCol(resizingCol.col, newWidth);
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, onResizeCol]);

  // Range selection drag
  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button === 2) return; // Right click
    if (editingCell) {
      commitEdit();
    }
    setIsMouseDown(true);
    setDragStart({ row: r, col: c });
    if (e.shiftKey) {
      onSelectCell({ row: r, col: c }, true);
    } else {
      onSelectCell({ row: r, col: c }, false);
    }
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isMouseDown && dragStart) {
      const range: CellRange = {
        startRow: Math.min(dragStart.row, r),
        startCol: Math.min(dragStart.col, c),
        endRow: Math.max(dragStart.row, r),
        endCol: Math.max(dragStart.col, c),
      };
      onRangeSelect(range);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleContextMenu = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    onSelectCell({ row: r, col: c });
    setContextMenu({
      x: Math.min(window.innerWidth - 220, e.clientX),
      y: Math.min(window.innerHeight - 260, e.clientY),
      coord: { row: r, col: c },
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-slate-100 select-none relative focus:outline-none"
      onClick={() => contextMenu && setContextMenu(null)}
    >
      <div className="inline-block min-w-full">
        {/* Table Structure */}
        <table className="border-collapse bg-white table-fixed">
          <thead>
            {/* Top Corner & Column Headers */}
            <tr className="sticky top-0 z-10 bg-slate-200">
              {/* Corner header */}
              <th className="w-12 min-w-12 h-7 bg-slate-200 border-b border-r border-slate-300 text-center text-xs font-semibold text-slate-500 sticky left-0 z-20">
                #
              </th>
              {Array.from({ length: sheet.colCount }).map((_, c) => {
                const isColActive =
                  c >= effectiveRange.startCol && c <= effectiveRange.endCol;
                const width = getColWidth(c);
                return (
                  <th
                    key={c}
                    style={{ width, minWidth: width, maxWidth: width }}
                    className={`h-7 border-b border-r border-slate-300 text-center text-xs font-semibold relative select-none cursor-pointer transition-colors ${
                      isColActive ? 'bg-indigo-100 text-indigo-900 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    onClick={() => {
                      onRangeSelect({
                        startRow: 0,
                        startCol: c,
                        endRow: sheet.rowCount - 1,
                        endCol: c,
                      });
                    }}
                  >
                    <span>{colToLetter(c)}</span>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500 z-10"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setResizingCol({ col: c, startX: e.clientX, startWidth: width });
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: sheet.rowCount }).map((_, r) => {
              const isRowActive =
                r >= effectiveRange.startRow && r <= effectiveRange.endRow;
              return (
                <tr key={r} className="h-7" style={{ height: DEFAULT_ROW_HEIGHT }}>
                  {/* Row number header */}
                  <td
                    className={`w-12 min-w-12 border-b border-r border-slate-300 text-center text-xs font-mono font-medium sticky left-0 z-10 select-none cursor-pointer transition-colors ${
                      isRowActive ? 'bg-indigo-100 text-indigo-900 font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    onClick={() => {
                      onRangeSelect({
                        startRow: r,
                        startCol: 0,
                        endRow: r,
                        endCol: sheet.colCount - 1,
                      });
                    }}
                  >
                    {r + 1}
                  </td>

                  {/* Row cells */}
                  {Array.from({ length: sheet.colCount }).map((_, c) => {
                    const key = cellKey(r, c);
                    const cell = sheet.data[key];
                    const selected = isCellSelected(r, c);
                    const active = isCellActive(r, c);
                    const isEditing = editingCell?.row === r && editingCell?.col === c;
                    const format = cell?.format || {};
                    const displayValue = formatCellValue(cell?.computed ?? cell?.raw, format);

                    // Cell styles
                    const cellStyle: React.CSSProperties = {
                      width: getColWidth(c),
                      minWidth: getColWidth(c),
                      maxWidth: getColWidth(c),
                      fontWeight: format.bold ? 'bold' : 'normal',
                      fontStyle: format.italic ? 'italic' : 'normal',
                      textDecoration: [
                        format.underline ? 'underline' : '',
                        format.strikethrough ? 'line-through' : '',
                      ].filter(Boolean).join(' ') || undefined,
                      textAlign: format.align || (format.formatType === 'number' || format.formatType === 'currency' || format.formatType === 'percentage' ? 'right' : 'left'),
                      color: format.textColor || '#0f172a',
                      backgroundColor: selected ? (active ? '#ffffff' : '#e0e7ff') : (format.bgColor || '#ffffff'),
                    };

                    return (
                      <td
                        key={c}
                        style={cellStyle}
                        className={`border-b border-r border-slate-200 px-2 py-0 text-xs overflow-hidden text-ellipsis whitespace-nowrap relative select-none cursor-cell ${
                          active ? 'ring-2 ring-indigo-600 ring-inset z-2' : selected ? 'bg-indigo-50/70' : ''
                        }`}
                        onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                        onMouseEnter={() => handleCellMouseEnter(r, c)}
                        onDoubleClick={() => startEditing({ row: r, col: c })}
                        onContextMenu={(e) => handleContextMenu(r, c, e)}
                      >
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            className="absolute inset-0 w-full h-full px-2 py-0 text-xs font-normal bg-white border-2 border-indigo-600 focus:outline-none z-30"
                          />
                        ) : (
                          <span>{displayValue}</span>
                        )}

                        {/* Corner dot for active cell */}
                        {active && !isEditing && (
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-600 border border-white cursor-crosshair z-10" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border border-slate-200 py-1.5 w-48 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              const cell = sheet.data[cellKey(contextMenu.coord.row, contextMenu.coord.col)];
              if (cell?.raw) {
                navigator.clipboard.writeText(cell.raw);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy (Ctrl+C)</span>
          </button>

          <button
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text) {
                  onUpdateCell(contextMenu.coord, text);
                }
              } catch (e) {
                // Clipboard permission fallback
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Paste (Ctrl+V)</span>
          </button>

          <div className="h-px bg-slate-200 my-1" />

          <button
            onClick={() => {
              onInsertRow('above');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Insert row above</span>
          </button>

          <button
            onClick={() => {
              onInsertRow('below');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Insert row below</span>
          </button>

          <button
            onClick={() => {
              onInsertCol('right');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Insert column right</span>
          </button>

          <div className="h-px bg-slate-200 my-1" />

          <button
            onClick={() => {
              onDeleteRow();
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete row</span>
          </button>

          <button
            onClick={() => {
              onDeleteCol();
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete column</span>
          </button>

          <div className="h-px bg-slate-200 my-1" />

          <button
            onClick={() => {
              onUpdateCell(contextMenu.coord, '');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear content</span>
          </button>
        </div>
      )}
    </div>
  );
};

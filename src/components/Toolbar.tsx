import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  DollarSign,
  Percent,
  Hash,
  Type,
  Calendar,
  Undo2,
  Redo2,
  BarChart3,
  Search,
  Download,
  PlusSquare,
  MinusSquare,
  ArrowUpDown,
  Palette,
  PaintBucket,
  Layers,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { CellFormat, NumberFormatType } from '../types/spreadsheet';

interface ToolbarProps {
  currentFormat?: CellFormat;
  onUpdateFormat: (format: Partial<CellFormat>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onInsertRow: (position: 'above' | 'below') => void;
  onDeleteRow: () => void;
  onInsertCol: (position: 'left' | 'right') => void;
  onDeleteCol: () => void;
  onSort: (direction: 'asc' | 'desc') => void;
  onOpenChart: () => void;
  onOpenFindReplace: () => void;
  onOpenExportImport: () => void;
  onOpenTemplates: () => void;
  onClearSelection: () => void;
}

const PRESET_COLORS = [
  '#000000', '#374151', '#6b7280', '#991b1b', '#b91c1c', '#c2410c',
  '#b45309', '#15803d', '#047857', '#0e7490', '#1d4ed8', '#4338ca',
  '#6d28d9', '#a21caf', '#be185d',
];

const PRESET_BG_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#fee2e2', '#fef3c7', '#dcfce7',
  '#d1fae5', '#e0f2fe', '#dbeafe', '#ede9fe', '#fae8ff', '#ffe4e6',
];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentFormat = {},
  onUpdateFormat,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onInsertRow,
  onDeleteRow,
  onInsertCol,
  onDeleteCol,
  onSort,
  onOpenChart,
  onOpenFindReplace,
  onOpenExportImport,
  onOpenTemplates,
  onClearSelection,
}) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const toggleBold = () => onUpdateFormat({ bold: !currentFormat.bold });
  const toggleItalic = () => onUpdateFormat({ italic: !currentFormat.italic });
  const toggleUnderline = () => onUpdateFormat({ underline: !currentFormat.underline });
  const toggleStrikethrough = () => onUpdateFormat({ strikethrough: !currentFormat.strikethrough });

  const setAlign = (align: 'left' | 'center' | 'right') => onUpdateFormat({ align });

  const setNumberFormat = (formatType: NumberFormatType, currencySymbol = '$') => {
    onUpdateFormat({
      formatType,
      currencySymbol: formatType === 'currency' ? currencySymbol : undefined,
      decimals: formatType === 'text' ? undefined : (currentFormat.decimals ?? 2),
    });
  };

  const adjustDecimals = (delta: number) => {
    const current = currentFormat.decimals ?? 2;
    const next = Math.max(0, Math.min(6, current + delta));
    onUpdateFormat({ decimals: next });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-slate-700 text-sm select-none relative z-20">
      {/* Undo / Redo */}
      <div className="flex items-center space-x-0.5 pr-2 border-r border-slate-200">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Templates & Quick Actions */}
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-200">
        <button
          onClick={onOpenTemplates}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
          title="Load pre-built templates"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Templates</span>
        </button>
      </div>

      {/* Font Styles */}
      <div className="flex items-center space-x-0.5 pr-2 border-r border-slate-200">
        <button
          onClick={toggleBold}
          className={`p-1.5 rounded transition-colors ${currentFormat.bold ? 'bg-slate-300 text-slate-900 font-bold' : 'hover:bg-slate-200'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={toggleItalic}
          className={`p-1.5 rounded transition-colors ${currentFormat.italic ? 'bg-slate-300 text-slate-900' : 'hover:bg-slate-200'}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={toggleUnderline}
          className={`p-1.5 rounded transition-colors ${currentFormat.underline ? 'bg-slate-300 text-slate-900' : 'hover:bg-slate-200'}`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          onClick={toggleStrikethrough}
          className={`p-1.5 rounded transition-colors ${currentFormat.strikethrough ? 'bg-slate-300 text-slate-900' : 'hover:bg-slate-200'}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Text Color & Background Color Pickers */}
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-200 relative">
        {/* Text color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTextColorPicker(!showTextColorPicker);
              setShowBgColorPicker(false);
            }}
            className="flex items-center p-1.5 rounded hover:bg-slate-200 transition-colors"
            title="Text color"
          >
            <Palette className="w-4 h-4" />
            <div
              className="w-2.5 h-2.5 rounded-full ml-1 border border-slate-300"
              style={{ backgroundColor: currentFormat.textColor || '#000000' }}
            />
          </button>
          {showTextColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 grid grid-cols-5 gap-1.5 w-44">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onUpdateFormat({ textColor: c });
                    setShowTextColorPicker(false);
                  }}
                  className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bg color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBgColorPicker(!showBgColorPicker);
              setShowTextColorPicker(false);
            }}
            className="flex items-center p-1.5 rounded hover:bg-slate-200 transition-colors"
            title="Fill color"
          >
            <PaintBucket className="w-4 h-4" />
            <div
              className="w-2.5 h-2.5 rounded-full ml-1 border border-slate-300"
              style={{ backgroundColor: currentFormat.bgColor || '#ffffff' }}
            />
          </button>
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 grid grid-cols-4 gap-1.5 w-40">
              {PRESET_BG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onUpdateFormat({ bgColor: c });
                    setShowBgColorPicker(false);
                  }}
                  className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alignment */}
      <div className="flex items-center space-x-0.5 pr-2 border-r border-slate-200">
        <button
          onClick={() => setAlign('left')}
          className={`p-1.5 rounded transition-colors ${currentFormat.align === 'left' || !currentFormat.align ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-200'}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAlign('center')}
          className={`p-1.5 rounded transition-colors ${currentFormat.align === 'center' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-200'}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAlign('right')}
          className={`p-1.5 rounded transition-colors ${currentFormat.align === 'right' ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-200'}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {/* Number Formats */}
      <div className="flex items-center space-x-0.5 pr-2 border-r border-slate-200">
        <button
          onClick={() => setNumberFormat('currency', '$')}
          className={`p-1.5 rounded transition-colors ${currentFormat.formatType === 'currency' ? 'bg-slate-300 text-slate-900 font-semibold' : 'hover:bg-slate-200'}`}
          title="Currency ($)"
        >
          <DollarSign className="w-4 h-4" />
        </button>
        <button
          onClick={() => setNumberFormat('percentage')}
          className={`p-1.5 rounded transition-colors ${currentFormat.formatType === 'percentage' ? 'bg-slate-300 text-slate-900 font-semibold' : 'hover:bg-slate-200'}`}
          title="Percent (%)"
        >
          <Percent className="w-4 h-4" />
        </button>
        <button
          onClick={() => setNumberFormat('number')}
          className={`p-1.5 rounded transition-colors ${currentFormat.formatType === 'number' ? 'bg-slate-300 text-slate-900 font-semibold' : 'hover:bg-slate-200'}`}
          title="Number (1,234.56)"
        >
          <Hash className="w-4 h-4" />
        </button>
        <button
          onClick={() => setNumberFormat('date')}
          className={`p-1.5 rounded transition-colors ${currentFormat.formatType === 'date' ? 'bg-slate-300 text-slate-900 font-semibold' : 'hover:bg-slate-200'}`}
          title="Date format"
        >
          <Calendar className="w-4 h-4" />
        </button>
        <button
          onClick={() => setNumberFormat('text')}
          className={`p-1.5 rounded transition-colors ${currentFormat.formatType === 'text' || !currentFormat.formatType ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-200'}`}
          title="Plain Text"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Decimals +/- */}
        <div className="flex items-center ml-1 border-l border-slate-200 pl-1">
          <button
            onClick={() => adjustDecimals(-1)}
            className="px-1.5 py-0.5 text-xs font-mono font-bold hover:bg-slate-200 rounded"
            title="Decrease decimal places"
          >
            .0←
          </button>
          <button
            onClick={() => adjustDecimals(1)}
            className="px-1.5 py-0.5 text-xs font-mono font-bold hover:bg-slate-200 rounded"
            title="Increase decimal places"
          >
            →.00
          </button>
        </div>
      </div>

      {/* Row & Column insert/delete */}
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-200">
        <button
          onClick={() => onInsertRow('below')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-xs"
          title="Insert row below"
        >
          <PlusSquare className="w-4 h-4 text-emerald-600" />
          <span className="hidden xl:inline">Row</span>
        </button>
        <button
          onClick={() => onInsertCol('right')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-xs"
          title="Insert column to the right"
        >
          <PlusSquare className="w-4 h-4 text-blue-600" />
          <span className="hidden xl:inline">Col</span>
        </button>
        <button
          onClick={onDeleteRow}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
          title="Delete selected row"
        >
          <MinusSquare className="w-4 h-4 text-rose-500" />
        </button>
      </div>

      {/* Sorting */}
      <div className="flex items-center space-x-0.5 pr-2 border-r border-slate-200">
        <button
          onClick={() => onSort('asc')}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors flex items-center gap-0.5 text-xs"
          title="Sort Ascending (A-Z, 0-9)"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-medium text-xs">A→Z</span>
        </button>
        <button
          onClick={() => onSort('desc')}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors flex items-center gap-0.5 text-xs"
          title="Sort Descending (Z-A, 9-0)"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-medium text-xs">Z→A</span>
        </button>
      </div>

      {/* Chart, Find, Export & Tools */}
      <div className="flex items-center space-x-1 ml-auto">
        <button
          onClick={onOpenChart}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
          title="Visualize selected data as a Chart"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chart</span>
        </button>

        <button
          onClick={onOpenFindReplace}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
          title="Find & Replace (Ctrl+F)"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExportImport}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 transition-colors"
          title="Import / Export CSV, JSON & Markdown"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import/Export</span>
        </button>

        <button
          onClick={onClearSelection}
          className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition-colors"
          title="Clear cell contents (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

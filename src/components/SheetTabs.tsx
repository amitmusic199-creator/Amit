import React, { useState } from 'react';
import { Sheet, QuickStats } from '../types/spreadsheet';
import { Plus, MoreVertical, Copy, Trash2, Edit2 } from 'lucide-react';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddSheet: () => void;
  onRenameSheet: (id: string, newName: string) => void;
  onDuplicateSheet: (id: string) => void;
  onDeleteSheet: (id: string) => void;
  quickStats: QuickStats;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onRenameSheet,
  onDuplicateSheet,
  onDeleteSheet,
  quickStats,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuSheetId, setMenuSheetId] = useState<string | null>(null);

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
    setMenuSheetId(null);
  };

  const commitRename = (id: string) => {
    if (renameValue.trim()) {
      onRenameSheet(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-slate-200 border-t border-slate-300 px-2 py-1 text-xs select-none">
      {/* Left: Sheet Tabs & Add Button */}
      <div className="flex items-center space-x-1 overflow-x-auto py-0.5 max-w-2xl">
        <button
          onClick={onAddSheet}
          className="p-1 rounded bg-slate-300 hover:bg-slate-400 text-slate-700 transition-colors"
          title="Add Sheet"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center space-x-1">
          {sheets.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            const isEditing = renamingId === sheet.id;

            return (
              <div
                key={sheet.id}
                className={`group relative flex items-center px-3 py-1.5 rounded-t-md cursor-pointer border border-b-0 transition-colors ${
                  isActive
                    ? 'bg-white border-slate-300 font-semibold text-indigo-700 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-50 border-transparent text-slate-600'
                }`}
                onClick={() => !isEditing && onSelectSheet(sheet.id)}
                onDoubleClick={() => startRename(sheet.id, sheet.name)}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(sheet.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(sheet.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    autoFocus
                    className="w-24 px-1 py-0 text-xs border border-indigo-500 rounded bg-white text-slate-800 outline-none"
                  />
                ) : (
                  <span className="truncate max-w-[140px]">{sheet.name}</span>
                )}

                {/* Tab action button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuSheetId(menuSheetId === sheet.id ? null : sheet.id);
                  }}
                  className={`ml-1.5 p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <MoreVertical className="w-3 h-3" />
                </button>

                {/* Tab Menu Dropdown */}
                {menuSheetId === sheet.id && (
                  <div
                    className="absolute bottom-full left-0 mb-1 w-36 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 text-slate-700 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => startRename(sheet.id, sheet.name)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={() => {
                        onDuplicateSheet(sheet.id);
                        setMenuSheetId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-left"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Duplicate</span>
                    </button>
                    {sheets.length > 1 && (
                      <button
                        onClick={() => {
                          onDeleteSheet(sheet.id);
                          setMenuSheetId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Live Quick Stats */}
      <div className="flex items-center space-x-3 text-slate-600 font-mono text-[11px] py-1">
        {quickStats.count > 0 && (
          <div className="flex items-center gap-3 bg-white/70 px-2.5 py-1 rounded border border-slate-300">
            <span>
              <strong className="text-slate-800">COUNT:</strong> {quickStats.count}
            </span>
            {quickStats.numericCount > 0 && (
              <>
                <span className="text-slate-300">|</span>
                <span>
                  <strong className="text-slate-800">SUM:</strong>{' '}
                  {quickStats.sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  <strong className="text-slate-800">AVG:</strong>{' '}
                  {quickStats.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                {quickStats.min !== null && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span>
                      <strong className="text-slate-800">MIN:</strong>{' '}
                      {quickStats.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </>
                )}
                {quickStats.max !== null && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span>
                      <strong className="text-slate-800">MAX:</strong>{' '}
                      {quickStats.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

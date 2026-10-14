import React, { useState } from 'react';
import { X, Search, Replace, ArrowRight } from 'lucide-react';
import { Sheet, CellCoord } from '../types/spreadsheet';
import { cellKey, parseCellKey } from '../utils/cellUtils';

interface FindReplaceModalProps {
  sheet: Sheet;
  onSelectCell: (coord: CellCoord) => void;
  onReplaceCell: (coord: CellCoord, newVal: string) => void;
  onReplaceAll: (search: string, replace: string, matchCase: boolean) => void;
  onClose: () => void;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  sheet,
  onSelectCell,
  onReplaceCell,
  onReplaceAll,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [currentMatchIdx, setCurrentMatchIdx] = useState<number>(-1);
  const [matches, setMatches] = useState<CellCoord[]>([]);
  const [message, setMessage] = useState<string>('');

  const findMatches = () => {
    if (!searchTerm) {
      setMatches([]);
      setMessage('');
      return;
    }

    const found: CellCoord[] = [];
    const term = matchCase ? searchTerm : searchTerm.toLowerCase();

    for (const [key, cell] of Object.entries(sheet.data)) {
      if (!cell || !cell.raw) continue;
      const rawText = matchCase ? cell.raw : cell.raw.toLowerCase();
      if (rawText.includes(term)) {
        found.push(parseCellKey(key));
      }
    }

    setMatches(found);
    if (found.length > 0) {
      setCurrentMatchIdx(0);
      onSelectCell(found[0]);
      setMessage(`Found ${found.length} match${found.length > 1 ? 'es' : ''}`);
    } else {
      setCurrentMatchIdx(-1);
      setMessage('No matches found');
    }
  };

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (currentMatchIdx + 1) % matches.length;
    setCurrentMatchIdx(nextIdx);
    onSelectCell(matches[nextIdx]);
  };

  const handleReplaceCurrent = () => {
    if (currentMatchIdx >= 0 && currentMatchIdx < matches.length) {
      const coord = matches[currentMatchIdx];
      const cell = sheet.data[cellKey(coord.row, coord.col)];
      if (cell) {
        let updated: string;
        if (matchCase) {
          updated = cell.raw.split(searchTerm).join(replaceTerm);
        } else {
          const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          updated = cell.raw.replace(regex, replaceTerm);
        }
        onReplaceCell(coord, updated);
        // Refresh matches
        findMatches();
      }
    }
  };

  const handleReplaceAllClick = () => {
    if (!searchTerm) return;
    onReplaceAll(searchTerm, replaceTerm, matchCase);
    setMessage(`Replaced all occurrences in current sheet`);
    setMatches([]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Find and Replace</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Find</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && findMatches()}
                placeholder="Search value or text..."
                autoFocus
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={findMatches}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors"
              >
                Find
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Replace with</label>
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="New value..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="matchCase"
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="matchCase" className="text-slate-600 font-medium cursor-pointer">
              Match case exactly
            </label>
          </div>

          {message && (
            <div className="text-slate-500 font-medium py-1">
              {message} {matches.length > 0 && `(${currentMatchIdx + 1} of ${matches.length})`}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200 gap-2">
          <button
            onClick={handleNext}
            disabled={matches.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReplaceCurrent}
              disabled={matches.length === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAllClick}
              disabled={!searchTerm}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Replace All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

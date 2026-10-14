import React, { useState, useEffect, useRef } from 'react';
import { FunctionSquare, HelpCircle, ChevronDown } from 'lucide-react';
import { CellCoord, CellRange } from '../types/spreadsheet';
import { coordToA1 } from '../utils/cellUtils';

interface FormulaBarProps {
  activeCoord: CellCoord;
  activeRange: CellRange | null;
  cellRawValue: string;
  onChange: (val: string) => void;
  onCommit: () => void;
}

const COMMON_FORMULAS = [
  { name: 'SUM', example: '=SUM(A1:A10)', desc: 'Adds all numbers in a range' },
  { name: 'AVERAGE', example: '=AVERAGE(B1:B10)', desc: 'Calculates the arithmetic mean' },
  { name: 'MIN', example: '=MIN(C1:C10)', desc: 'Finds minimum value in range' },
  { name: 'MAX', example: '=MAX(C1:C10)', desc: 'Finds maximum value in range' },
  { name: 'COUNT', example: '=COUNT(A1:A20)', desc: 'Counts cells with numeric values' },
  { name: 'COUNTA', example: '=COUNTA(A1:A20)', desc: 'Counts non-empty cells' },
  { name: 'IF', example: '=IF(A1>50, "Pass", "Fail")', desc: 'Conditional logical test' },
  { name: 'ROUND', example: '=ROUND(A1*1.08, 2)', desc: 'Rounds number to decimal digits' },
  { name: 'VLOOKUP', example: '=VLOOKUP("Apple", A1:C10, 2)', desc: 'Vertical key search' },
  { name: 'CONCAT', example: '=CONCAT(A1, " ", B1)', desc: 'Joins text values together' },
  { name: 'TODAY', example: '=TODAY()', desc: 'Current calendar date' },
];

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCoord,
  activeRange,
  cellRawValue,
  onChange,
  onCommit,
}) => {
  const [showFormulaMenu, setShowFormulaMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Address text
  const cellAddress = activeRange && (activeRange.startRow !== activeRange.endRow || activeRange.startCol !== activeRange.endCol)
    ? `${coordToA1({ row: activeRange.startRow, col: activeRange.startCol })}:${coordToA1({ row: activeRange.endRow, col: activeRange.endCol })}`
    : coordToA1(activeCoord);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const insertFormula = (example: string) => {
    onChange(example);
    setShowFormulaMenu(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="flex items-center px-3 py-1.5 bg-white border-b border-slate-200 text-sm gap-2 select-none">
      {/* Name box */}
      <div className="w-24 px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-center font-semibold text-slate-800 text-xs shadow-inner">
        {cellAddress}
      </div>

      {/* Function FX Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowFormulaMenu(!showFormulaMenu)}
          className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono font-bold transition-colors"
          title="Insert formula"
        >
          <span className="text-indigo-600 italic">fx</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showFormulaMenu && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Functions
            </div>
            {COMMON_FORMULAS.map((fn) => (
              <button
                key={fn.name}
                onClick={() => insertFormula(fn.example)}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex flex-col gap-0.5 transition-colors border-b border-slate-50 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-700">{fn.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">{fn.example}</span>
                </div>
                <span className="text-xs text-slate-500">{fn.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-slate-300 select-none">|</div>

      {/* Formula Input */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={cellRawValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text, numbers, or formula starting with ="
          className="w-full px-2.5 py-1 text-xs font-mono text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
        />
      </div>
    </div>
  );
};

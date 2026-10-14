import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Download } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  filename: string;
  onCopy: () => void;
  hasCopied: boolean;
  onDownload: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  filename,
  onCopy,
  hasCopied,
  onDownload,
}) => {
  const lines = code.split('\n');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* Code Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-white">{filename}</span>
          <span className="text-[11px] text-slate-500 font-mono">({lines.length} lines)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          <button
            onClick={onDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-[#0b0f19]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isComment = line.trim().startsWith('#');
              const isImport = line.trim().startsWith('import ') || line.trim().startsWith('from ');
              const isDef = line.trim().startsWith('def ') || line.trim().startsWith('class ');
              const isConst = /^[A-Z0-9_]+\s*=/.test(line.trim());

              let textColor = 'text-slate-300';
              if (isComment) textColor = 'text-slate-500 italic';
              else if (isImport) textColor = 'text-cyan-400';
              else if (isDef) textColor = 'text-indigo-400 font-semibold';
              else if (isConst) textColor = 'text-amber-300';

              return (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="w-12 select-none text-right pr-4 text-slate-600 font-mono text-[11px]">
                    {lineNum}
                  </td>
                  <td className={`pl-2 whitespace-pre font-mono ${textColor}`}>
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

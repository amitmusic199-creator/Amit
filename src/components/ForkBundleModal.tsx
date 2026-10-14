import React, { useState } from 'react';
import {
  FolderTree,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Folder,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SHARED_FILES, SharedFile } from '../data/sharedFiles';

interface ForkBundleModalProps {
  recipeCode: string;
  recipeFilename: string;
}

export const ForkBundleModal: React.FC<ForkBundleModalProps> = ({
  recipeCode,
  recipeFilename,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>(recipeFilename);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // All files in bundle
  const allFiles: { path: string; filename: string; content: string; desc: string }[] = [
    {
      path: recipeFilename,
      filename: recipeFilename,
      content: recipeCode,
      desc: 'The standalone model recipe script declaring inputs, postamble, calibration, and pipeline.',
    },
    ...SHARED_FILES.map((sf) => ({
      path: sf.path,
      filename: sf.filename,
      content: sf.content,
      desc: sf.description,
    })),
  ];

  const currentFile = allFiles.find((f) => f.path === selectedFile) || allFiles[0];

  const handleCopyCurrent = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadFile = (file: typeof currentFile) => {
    const blob = new Blob([file.content], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-6 overflow-hidden">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-5 rounded-2xl border border-slate-800 mb-6 shadow-xl shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Terminal className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white font-mono">
                axzoo fork custom-yolo-detector --script
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              When forking an Axelera recipe with <code className="text-cyan-300 font-mono">--script</code>,
              the standalone recipe and the internal <code className="text-indigo-300 font-mono">shared/</code> helper
              library are extracted together so the model builds and runs completely independent of the Model Zoo package.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                allFiles.forEach((file, idx) => {
                  setTimeout(() => handleDownloadFile(file), idx * 150);
                });
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download All Files ({allFiles.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two column file explorer */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden">
        {/* Left Column: File Tree */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider mb-2">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <span>Extracted Package Tree</span>
          </div>

          <div className="space-y-1 text-xs font-mono">
            {/* Root Recipe file */}
            <button
              onClick={() => setSelectedFile(recipeFilename)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFile === recipeFilename
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{recipeFilename}</span>
            </button>

            {/* Folder shared/ */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span>shared/</span>
              </div>

              <div className="pl-4 space-y-1 mt-1 border-l border-slate-800 ml-3">
                {SHARED_FILES.map((sf) => (
                  <button
                    key={sf.path}
                    onClick={() => setSelectedFile(sf.path)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      selectedFile === sf.path
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sf.filename}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-normal">
            <p>
              💡 No Model Zoo installation needed to build or run. Only <code className="text-slate-400 font-mono">--eval</code> needs datasets.
            </p>
          </div>
        </div>

        {/* Right Column: Active File Viewer */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white">{currentFile.path}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {currentFile.desc}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadFile(currentFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save File</span>
              </button>
            </div>
          </div>

          {/* File Content */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-[#0b0f19]">
            <table className="w-full border-collapse">
              <tbody>
                {currentFile.content.split('\n').map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="w-10 select-none text-right pr-4 text-slate-600 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="pl-2 whitespace-pre text-slate-300">
                      {line}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

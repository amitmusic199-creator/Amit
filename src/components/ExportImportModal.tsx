import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, FileText, Table, Code } from 'lucide-react';
import { Sheet } from '../types/spreadsheet';
import { sheetToCSV, sheetToJSON, sheetToMarkdown, parseCSV, matrixFrom2DArray } from '../utils/csvHelper';
import { recomputeSheetData } from '../utils/formulaEngine';

interface ExportImportModalProps {
  sheet: Sheet;
  onImportData: (data: ReturnType<typeof matrixFrom2DArray>, rowCount: number, colCount: number, newSheetName?: string) => void;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  sheet,
  onImportData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [importTarget, setImportTarget] = useState<'current' | 'new'>('current');
  const [newSheetTitle, setNewSheetTitle] = useState('Imported Sheet');

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      // fallback
    }
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = sheetToCSV(sheet);
    downloadFile(csv, `${sheet.name.toLowerCase().replace(/\s+/g, '_')}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(sheetToJSON(sheet), null, 2);
    downloadFile(json, `${sheet.name.toLowerCase().replace(/\s+/g, '_')}.json`, 'application/json');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processImport(text, file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const processImport = (text: string, title?: string) => {
    const rows = parseCSV(text);
    if (rows.length === 0) return;

    const rowCount = Math.max(30, rows.length + 5);
    const colCount = Math.max(12, Math.max(...rows.map((r) => r.length)) + 3);
    const matrix = matrixFrom2DArray(rows);
    const computed = recomputeSheetData(matrix);

    onImportData(
      computed,
      rowCount,
      colCount,
      importTarget === 'new' ? (title || newSheetTitle || 'Imported') : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">Import & Export</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV / TSV</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Export &ldquo;{sheet.name}&rdquo; in multiple formats:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Download CSV */}
                <button
                  onClick={handleExportCSV}
                  className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-center group"
                >
                  <FileText className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800">Download CSV</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Standard comma-separated</span>
                </button>

                {/* Download JSON */}
                <button
                  onClick={handleExportJSON}
                  className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group"
                >
                  <Code className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800">Download JSON</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Key-value row objects</span>
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {/* Copy Markdown Table */}
                <button
                  onClick={() => copyToClipboard(sheetToMarkdown(sheet), 'markdown')}
                  className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Copy Markdown Table</span>
                  </div>
                  {copiedType === 'markdown' ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Copy Raw CSV */}
                <button
                  onClick={() => copyToClipboard(sheetToCSV(sheet), 'csv')}
                  className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Copy Raw CSV to Clipboard</span>
                  </div>
                  {copiedType === 'csv' ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Target choice */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    checked={importTarget === 'current'}
                    onChange={() => setImportTarget('current')}
                    className="text-indigo-600"
                  />
                  <span className="text-slate-700 font-medium">Replace current sheet</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    checked={importTarget === 'new'}
                    onChange={() => setImportTarget('new')}
                    className="text-indigo-600"
                  />
                  <span className="text-slate-700 font-medium">Create new tab</span>
                </label>
              </div>

              {importTarget === 'new' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">New Tab Name</label>
                  <input
                    type="text"
                    value={newSheetTitle}
                    onChange={(e) => setNewSheetTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Upload file */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Upload File (.csv, .tsv, .txt)</label>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {/* Or paste directly */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Or Paste CSV / Tab-separated text</label>
                <textarea
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste table or CSV lines here..."
                  className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => processImport(pasteText)}
                disabled={!pasteText.trim()}
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                Parse & Import
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

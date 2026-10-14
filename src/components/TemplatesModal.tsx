import React from 'react';
import { X, Sparkles, Wallet, TrendingUp, CheckSquare, FileSpreadsheet, Plus } from 'lucide-react';
import { Sheet } from '../types/spreadsheet';
import { TEMPLATES, TemplateDefinition } from '../utils/templates';

interface TemplatesModalProps {
  onLoadTemplate: (template: TemplateDefinition, mode: 'new' | 'replace') => void;
  onClose: () => void;
}

const getTemplateIcon = (iconName: string) => {
  switch (iconName) {
    case 'Wallet':
      return <Wallet className="w-5 h-5 text-blue-600" />;
    case 'TrendingUp':
      return <TrendingUp className="w-5 h-5 text-emerald-600" />;
    case 'CheckSquare':
      return <CheckSquare className="w-5 h-5 text-purple-600" />;
    default:
      return <FileSpreadsheet className="w-5 h-5 text-slate-600" />;
  }
};

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  onLoadTemplate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-800">Spreadsheet Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="border border-slate-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between bg-white group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                    {getTemplateIcon(tmpl.icon)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {tmpl.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onLoadTemplate(tmpl, 'new')}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Open as New Tab</span>
                </button>
                <button
                  onClick={() => onLoadTemplate(tmpl, 'replace')}
                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  title="Replace current active sheet"
                >
                  Use Here
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

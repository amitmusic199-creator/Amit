import React, { useState, useMemo } from 'react';
import { X, BarChart, LineChart, PieChart, TrendingUp, Download } from 'lucide-react';
import { Sheet, CellRange } from '../types/spreadsheet';
import { cellKey, colToLetter, formatCellValue } from '../utils/cellUtils';

interface ChartModalProps {
  sheet: Sheet;
  selectedRange: CellRange | null;
  onClose: () => void;
}

type ChartType = 'bar' | 'line' | 'area' | 'pie';

export const ChartModal: React.FC<ChartModalProps> = ({
  sheet,
  selectedRange,
  onClose,
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('Data Visualization');

  // Extract tabular data from selected range or default to first 12 rows, 6 cols
  const { labels, datasets } = useMemo(() => {
    let startR = 0;
    let endR = Math.min(15, sheet.rowCount - 1);
    let startC = 0;
    let endC = Math.min(5, sheet.colCount - 1);

    if (selectedRange) {
      startR = selectedRange.startRow;
      endR = selectedRange.endRow;
      startC = selectedRange.startCol;
      endC = selectedRange.endCol;
    }

    // Header row is startR if startR < endR
    const hasHeader = endR > startR;
    const headerRow = hasHeader ? startR : -1;
    const dataStartRow = hasHeader ? startR + 1 : startR;

    // First column is treated as X labels
    const extractedLabels: string[] = [];
    for (let r = dataStartRow; r <= endR; r++) {
      const cell = sheet.data[cellKey(r, startC)];
      const val = cell?.computed ?? cell?.raw ?? `Row ${r + 1}`;
      extractedLabels.push(String(val));
    }

    // Subsequent columns are series
    const extractedDatasets: { name: string; data: number[]; color: string }[] = [];
    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    for (let c = startC + 1; c <= endC; c++) {
      let seriesName = `Series ${colToLetter(c)}`;
      if (hasHeader) {
        const headerCell = sheet.data[cellKey(headerRow, c)];
        if (headerCell?.raw) seriesName = String(headerCell.raw);
      }

      const values: number[] = [];
      for (let r = dataStartRow; r <= endR; r++) {
        const cell = sheet.data[cellKey(r, c)];
        const rawNum = typeof cell?.computed === 'number' ? cell.computed : parseFloat(String(cell?.raw ?? '0'));
        values.push(isNaN(rawNum) ? 0 : rawNum);
      }

      if (values.some((v) => v !== 0)) {
        extractedDatasets.push({
          name: seriesName,
          data: values,
          color: colors[(c - startC - 1) % colors.length],
        });
      }
    }

    // Fallback if only 1 column selected
    if (extractedDatasets.length === 0) {
      const values: number[] = [];
      for (let r = dataStartRow; r <= endR; r++) {
        const cell = sheet.data[cellKey(r, startC)];
        const rawNum = typeof cell?.computed === 'number' ? cell.computed : parseFloat(String(cell?.raw ?? '0'));
        values.push(isNaN(rawNum) ? 0 : rawNum);
      }
      extractedDatasets.push({
        name: 'Values',
        data: values,
        color: colors[0],
      });
    }

    return { labels: extractedLabels, datasets: extractedDatasets };
  }, [sheet, selectedRange]);

  // Compute scale
  const allValues = datasets.flatMap((d) => d.data);
  const maxVal = Math.max(...allValues, 10);
  const minVal = Math.min(...allValues, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <BarChart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Chart Visualizer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-white border-b border-slate-100 gap-3">
          {/* Chart Type selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                chartType === 'bar' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                chartType === 'line' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                chartType === 'area' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Area</span>
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                chartType === 'pie' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Pie</span>
            </button>
          </div>

          {/* Chart Title Input */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Title:</span>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 text-slate-800"
            />
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center bg-slate-50/50 min-h-[340px]">
          <h3 className="text-base font-bold text-slate-800 mb-4">{chartTitle}</h3>

          {/* SVG Rendering */}
          {chartType === 'pie' ? (
            /* Pie Chart */
            <div className="flex flex-col md:flex-row items-center gap-8">
              <svg width="260" height="260" viewBox="-130 -130 260 260" className="overflow-visible">
                {(() => {
                  const dataSlice = datasets[0]?.data || [];
                  const total = dataSlice.reduce((a, b) => a + Math.max(0, b), 0) || 1;
                  let cumulativeAngle = 0;
                  const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e', '#6366f1'];

                  return dataSlice.map((val, idx) => {
                    const sliceAngle = (Math.max(0, val) / total) * 2 * Math.PI;
                    const startAngle = cumulativeAngle;
                    const endAngle = cumulativeAngle + sliceAngle;
                    cumulativeAngle += sliceAngle;

                    const x1 = 110 * Math.sin(startAngle);
                    const y1 = -110 * Math.cos(startAngle);
                    const x2 = 110 * Math.sin(endAngle);
                    const y2 = -110 * Math.cos(endAngle);
                    const largeArc = sliceAngle > Math.PI ? 1 : 0;

                    const path =
                      sliceAngle >= 2 * Math.PI - 0.001
                        ? 'M 0 -110 A 110 110 0 1 1 -0.01 -110 Z'
                        : `M 0 0 L ${x1} ${y1} A 110 110 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    return (
                      <path
                        key={idx}
                        d={path}
                        fill={colors[idx % colors.length]}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <title>{`${labels[idx] || `Item ${idx + 1}`}: ${val} (${Math.round((val / total) * 100)}%)`}</title>
                      </path>
                    );
                  });
                })()}
                {/* Center hole for donut look */}
                <circle cx="0" cy="0" r="45" fill="#ffffff" />
              </svg>

              {/* Legend for Pie */}
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-2">
                {(datasets[0]?.data || []).map((val, idx) => {
                  const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e', '#6366f1'];
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[idx % colors.length] }} />
                      <span className="font-medium truncate max-w-[120px]">{labels[idx] || `Item ${idx + 1}`}:</span>
                      <span className="font-mono text-slate-500">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Bar / Line / Area Chart */
            <div className="w-full max-w-2xl bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <svg width="100%" height="260" viewBox="0 0 600 260" className="overflow-visible">
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = 30 + (1 - pct) * 180;
                  const labelVal = Math.round(minVal + pct * (maxVal - minVal));
                  return (
                    <g key={i}>
                      <line x1="50" y1={y} x2="580" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x="40" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                        {labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis line */}
                <line x1="50" y1="210" x2="580" y2="210" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Bars or Lines */}
                {chartType === 'bar' && (
                  <>
                    {labels.map((lbl, lIdx) => {
                      const groupWidth = 500 / Math.max(1, labels.length);
                      const barWidth = Math.max(8, (groupWidth * 0.7) / Math.max(1, datasets.length));
                      const groupX = 60 + lIdx * groupWidth;

                      return (
                        <g key={lIdx}>
                          {datasets.map((ds, dIdx) => {
                            const val = ds.data[lIdx] ?? 0;
                            const h = Math.max(2, ((val - minVal) / (maxVal - minVal || 1)) * 180);
                            const x = groupX + dIdx * (barWidth + 2);
                            const y = 210 - h;

                            return (
                              <rect
                                key={dIdx}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={h}
                                fill={ds.color}
                                rx="3"
                                className="hover:opacity-85 transition-opacity cursor-pointer"
                              >
                                <title>{`${ds.name} - ${lbl}: ${val}`}</title>
                              </rect>
                            );
                          })}
                          {/* Label */}
                          <text
                            x={groupX + (groupWidth * 0.35)}
                            y="230"
                            textAnchor="middle"
                            className="text-[10px] fill-slate-600 font-medium truncate"
                          >
                            {lbl.length > 8 ? `${lbl.slice(0, 7)}…` : lbl}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {(chartType === 'line' || chartType === 'area') && (
                  <>
                    {datasets.map((ds, dIdx) => {
                      const stepX = 500 / Math.max(1, labels.length - 1 || 1);
                      const points = ds.data.map((val, lIdx) => {
                        const x = 60 + lIdx * stepX;
                        const y = 210 - Math.max(2, ((val - minVal) / (maxVal - minVal || 1)) * 180);
                        return { x, y, val, label: labels[lIdx] };
                      });

                      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaD = `${pathD} L ${points[points.length - 1]?.x || 560} 210 L ${points[0]?.x || 60} 210 Z`;

                      return (
                        <g key={dIdx}>
                          {chartType === 'area' && (
                            <path d={areaD} fill={ds.color} fillOpacity="0.15" />
                          )}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={ds.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {points.map((p, pIdx) => (
                            <circle
                              key={pIdx}
                              cx={p.x}
                              cy={p.y}
                              r="4"
                              fill="#ffffff"
                              stroke={ds.color}
                              strokeWidth="2"
                              className="hover:r-6 cursor-pointer"
                            >
                              <title>{`${ds.name} - ${p.label}: ${p.val}`}</title>
                            </circle>
                          ))}
                        </g>
                      );
                    })}

                    {labels.map((lbl, lIdx) => {
                      const stepX = 500 / Math.max(1, labels.length - 1 || 1);
                      const x = 60 + lIdx * stepX;
                      return (
                        <text
                          key={lIdx}
                          x={x}
                          y="230"
                          textAnchor="middle"
                          className="text-[10px] fill-slate-600 font-medium"
                        >
                          {lbl.length > 8 ? `${lbl.slice(0, 7)}…` : lbl}
                        </text>
                      );
                    })}
                  </>
                )}
              </svg>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100">
                {datasets.map((ds, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-700">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                    <span className="font-semibold">{ds.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-200 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

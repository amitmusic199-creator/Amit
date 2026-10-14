export type NumberFormatType = 'text' | 'number' | 'currency' | 'percentage' | 'date';

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: 'left' | 'center' | 'right';
  textColor?: string;
  bgColor?: string;
  formatType?: NumberFormatType;
  currencySymbol?: string;
  decimals?: number;
}

export interface CellData {
  raw: string; // The formula or entered text, e.g. "=SUM(A1:A5)" or "42" or "Groceries"
  computed?: string | number | boolean | null; // Evaluated value
  format?: CellFormat;
  comment?: string;
}

export type CellMatrix = Record<string, CellData>; // Keyed by "R,C" (0-indexed row,col)

export interface Sheet {
  id: string;
  name: string;
  data: CellMatrix;
  rowCount: number;
  colCount: number;
  colWidths?: Record<number, number>;
  rowHeights?: Record<number, number>;
}

export interface Workbook {
  id: string;
  title: string;
  sheets: Sheet[];
  activeSheetId: string;
  updatedAt: string;
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface SelectionState {
  activeCell: CellCoord;
  range: CellRange | null;
  isSelecting: boolean;
}

export interface QuickStats {
  count: number;
  numericCount: number;
  sum: number;
  average: number;
  min: number | null;
  max: number | null;
}

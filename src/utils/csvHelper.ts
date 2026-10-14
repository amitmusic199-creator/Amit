import { CellMatrix, Sheet } from '../types/spreadsheet';
import { cellKey, formatCellValue } from './cellUtils';

export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  const isTSV = text.includes('\t') && !text.includes('","');
  const delimiter = isTSV ? '\t' : ',';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal);
      lines.push(currentRow);
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentRow.length > 0 || currentVal.length > 0) {
    currentRow.push(currentVal);
    lines.push(currentRow);
  }

  return lines;
}

export function sheetToCSV(sheet: Sheet, maxR = sheet.rowCount, maxC = sheet.colCount): string {
  // Find highest row and col with data
  let lastRow = 0;
  let lastCol = 0;
  for (let r = 0; r < maxR; r++) {
    for (let c = 0; c < maxC; c++) {
      const cell = sheet.data[cellKey(r, c)];
      if (cell && cell.raw) {
        lastRow = Math.max(lastRow, r);
        lastCol = Math.max(lastCol, c);
      }
    }
  }

  const rows: string[] = [];
  for (let r = 0; r <= lastRow; r++) {
    const cols: string[] = [];
    for (let c = 0; c <= lastCol; c++) {
      const cell = sheet.data[cellKey(r, c)];
      const val = cell ? (cell.computed !== undefined ? formatCellValue(cell.computed, cell.format) : cell.raw) : '';
      // Escape if contains comma, quote, or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        cols.push(`"${val.replace(/"/g, '""')}"`);
      } else {
        cols.push(val);
      }
    }
    rows.push(cols.join(','));
  }
  return rows.join('\n');
}

export function sheetToMarkdown(sheet: Sheet): string {
  let lastRow = 0;
  let lastCol = 0;
  for (let r = 0; r < sheet.rowCount; r++) {
    for (let c = 0; c < sheet.colCount; c++) {
      const cell = sheet.data[cellKey(r, c)];
      if (cell && cell.raw) {
        lastRow = Math.max(lastRow, r);
        lastCol = Math.max(lastCol, c);
      }
    }
  }

  if (lastRow === 0 && lastCol === 0 && !sheet.data['0,0']) {
    return '_Empty sheet_';
  }

  const rows: string[] = [];
  // Header row
  const headerCols: string[] = [];
  for (let c = 0; c <= lastCol; c++) {
    const cell = sheet.data[cellKey(0, c)];
    const val = cell ? (cell.computed !== undefined ? formatCellValue(cell.computed, cell.format) : cell.raw) : '';
    headerCols.push(val || `Col ${c + 1}`);
  }
  rows.push(`| ${headerCols.join(' | ')} |`);
  rows.push(`| ${headerCols.map(() => '---').join(' | ')} |`);

  for (let r = 1; r <= lastRow; r++) {
    const cols: string[] = [];
    for (let c = 0; c <= lastCol; c++) {
      const cell = sheet.data[cellKey(r, c)];
      const val = cell ? (cell.computed !== undefined ? formatCellValue(cell.computed, cell.format) : cell.raw) : '';
      cols.push(val.replace(/\|/g, '\\|'));
    }
    rows.push(`| ${cols.join(' | ')} |`);
  }

  return rows.join('\n');
}

export function sheetToJSON(sheet: Sheet): any[] {
  let lastRow = 0;
  let lastCol = 0;
  for (let r = 0; r < sheet.rowCount; r++) {
    for (let c = 0; c < sheet.colCount; c++) {
      const cell = sheet.data[cellKey(r, c)];
      if (cell && cell.raw) {
        lastRow = Math.max(lastRow, r);
        lastCol = Math.max(lastCol, c);
      }
    }
  }

  // Row 0 as headers
  const headers: string[] = [];
  for (let c = 0; c <= lastCol; c++) {
    const cell = sheet.data[cellKey(0, c)];
    headers.push(cell?.raw ? String(cell.raw) : `Column_${c + 1}`);
  }

  const result: any[] = [];
  for (let r = 1; r <= lastRow; r++) {
    const rowObj: Record<string, any> = {};
    for (let c = 0; c <= lastCol; c++) {
      const cell = sheet.data[cellKey(r, c)];
      rowObj[headers[c]] = cell?.computed ?? cell?.raw ?? '';
    }
    result.push(rowObj);
  }
  return result;
}

export function matrixFrom2DArray(rows: string[][]): CellMatrix {
  const matrix: CellMatrix = {};
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const val = rows[r][c];
      if (val !== undefined && val !== '') {
        matrix[cellKey(r, c)] = {
          raw: val,
          computed: val.startsWith('=') ? null : isNaN(Number(val)) ? val : Number(val),
        };
      }
    }
  }
  return matrix;
}

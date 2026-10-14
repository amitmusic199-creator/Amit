import { CellCoord, CellFormat, CellRange } from '../types/spreadsheet';

export function colToLetter(colIndex: number): string {
  let letter = '';
  let temp = colIndex + 1;
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

export function letterToCol(letters: string): number {
  let col = 0;
  const upper = letters.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function coordToA1(coord: CellCoord): string {
  return `${colToLetter(coord.col)}${coord.row + 1}`;
}

export function parseA1(a1: string): CellCoord | null {
  const match = a1.trim().match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  const col = letterToCol(match[1]);
  const row = parseInt(match[2], 10) - 1;
  if (row < 0 || col < 0) return null;
  return { row, col };
}

export function parseRange(rangeStr: string): CellRange | null {
  const parts = rangeStr.split(':');
  if (parts.length === 1) {
    const coord = parseA1(parts[0]);
    if (!coord) return null;
    return {
      startRow: coord.row,
      startCol: coord.col,
      endRow: coord.row,
      endCol: coord.col,
    };
  } else if (parts.length === 2) {
    const start = parseA1(parts[0]);
    const end = parseA1(parts[1]);
    if (!start || !end) return null;
    return {
      startRow: Math.min(start.row, end.row),
      startCol: Math.min(start.col, end.col),
      endRow: Math.max(start.row, end.row),
      endCol: Math.max(start.col, end.col),
    };
  }
  return null;
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parseCellKey(key: string): CellCoord {
  const [r, c] = key.split(',').map(Number);
  return { row: r, col: c };
}

export function formatCellValue(value: any, format?: CellFormat): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';

  if (!format || !format.formatType || format.formatType === 'text') {
    return String(value);
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value);

  const decimals = format.decimals !== undefined ? format.decimals : 2;

  switch (format.formatType) {
    case 'currency': {
      const sym = format.currencySymbol || '$';
      return `${sym}${num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    }
    case 'percentage': {
      const pct = num * 100;
      return `${pct.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}%`;
    }
    case 'number': {
      return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    case 'date': {
      try {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString();
        }
      } catch {
        // fallback
      }
      return String(value);
    }
    default:
      return String(value);
  }
}

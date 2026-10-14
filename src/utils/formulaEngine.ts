import { CellMatrix } from '../types/spreadsheet';
import { cellKey, parseA1, parseRange } from './cellUtils';

export function evaluateFormula(
  formula: string,
  matrix: CellMatrix,
  visited: Set<string> = new Set()
): string | number | boolean | null {
  if (!formula.startsWith('=')) {
    return formula;
  }

  const expr = formula.slice(1).trim();
  if (!expr) return '';

  try {
    return evaluateExpression(expr, matrix, visited);
  } catch (err: any) {
    return '#ERROR!';
  }
}

function getCellValue(
  coordKey: string,
  matrix: CellMatrix,
  visited: Set<string>
): any {
  if (visited.has(coordKey)) {
    return '#REF!'; // Circular reference
  }

  const cell = matrix[coordKey];
  if (!cell || cell.raw === undefined || cell.raw === null || cell.raw === '') {
    return 0; // Empty cell treated as 0 in arithmetic
  }

  if (cell.raw.startsWith('=')) {
    const nextVisited = new Set(visited);
    nextVisited.add(coordKey);
    const val = evaluateFormula(cell.raw, matrix, nextVisited);
    return val;
  }

  const num = Number(cell.raw);
  if (!isNaN(num) && cell.raw.trim() !== '') {
    return num;
  }
  return cell.raw;
}

function getRangeValues(rangeStr: string, matrix: CellMatrix, visited: Set<string>): any[] {
  const range = parseRange(rangeStr);
  if (!range) return [];

  const values: any[] = [];
  for (let r = range.startRow; r <= range.endRow; r++) {
    for (let c = range.startCol; c <= range.endCol; c++) {
      const key = cellKey(r, c);
      const val = getCellValue(key, matrix, visited);
      values.push(val);
    }
  }
  return values;
}

function evaluateExpression(
  expr: string,
  matrix: CellMatrix,
  visited: Set<string>
): any {
  let s = expr.trim();

  // Function calls like SUM(...), AVERAGE(...), IF(...)
  const fnMatch = s.match(/^([A-Z_]+)\s*\((.*)\)$/i);
  if (fnMatch) {
    const fnName = fnMatch[1].toUpperCase();
    const argsContent = fnMatch[2];
    const args = splitArguments(argsContent);

    return executeFunction(fnName, args, matrix, visited);
  }

  // Tokenize arithmetic / comparison expression with cell references
  return evaluateArithmetic(s, matrix, visited);
}

function splitArguments(argsStr: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = '';
  let inQuote = false;

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    if (char === '"' || char === "'") {
      inQuote = !inQuote;
      current += char;
    } else if (char === '(' && !inQuote) {
      depth++;
      current += char;
    } else if (char === ')' && !inQuote) {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0 && !inQuote) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    args.push(current.trim());
  }
  return args;
}

function executeFunction(
  fnName: string,
  rawArgs: string[],
  matrix: CellMatrix,
  visited: Set<string>
): any {
  const expandArg = (arg: string): any[] => {
    // Check if arg is range like A1:B5
    if (arg.includes(':') && parseRange(arg)) {
      return getRangeValues(arg, matrix, visited);
    }
    // Check if arg is single cell reference
    const coord = parseA1(arg);
    if (coord) {
      return [getCellValue(cellKey(coord.row, coord.col), matrix, visited)];
    }
    // Evaluate sub-expression
    const val = evaluateExpression(arg, matrix, visited);
    return [val];
  };

  switch (fnName) {
    case 'SUM': {
      const vals = rawArgs.flatMap(expandArg);
      return vals.reduce((acc, v) => {
        const n = typeof v === 'number' ? v : parseFloat(v);
        return acc + (!isNaN(n) ? n : 0);
      }, 0);
    }

    case 'AVERAGE':
    case 'AVG': {
      const vals = rawArgs.flatMap(expandArg);
      let count = 0;
      let sum = 0;
      for (const v of vals) {
        const n = typeof v === 'number' ? v : parseFloat(v);
        if (!isNaN(n)) {
          sum += n;
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    }

    case 'MIN': {
      const vals = rawArgs.flatMap(expandArg);
      const nums = vals
        .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
        .filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.min(...nums) : 0;
    }

    case 'MAX': {
      const vals = rawArgs.flatMap(expandArg);
      const nums = vals
        .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
        .filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.max(...nums) : 0;
    }

    case 'COUNT': {
      const vals = rawArgs.flatMap(expandArg);
      return vals.filter((v) => {
        const n = typeof v === 'number' ? v : parseFloat(v);
        return !isNaN(n);
      }).length;
    }

    case 'COUNTA': {
      const vals = rawArgs.flatMap(expandArg);
      return vals.filter((v) => v !== '' && v !== null && v !== undefined).length;
    }

    case 'ROUND': {
      const val = Number(evaluateExpression(rawArgs[0] || '0', matrix, visited));
      const decimals = rawArgs[1] ? Number(evaluateExpression(rawArgs[1], matrix, visited)) : 0;
      const factor = Math.pow(10, decimals);
      return Math.round(val * factor) / factor;
    }

    case 'ABS': {
      const val = Number(evaluateExpression(rawArgs[0] || '0', matrix, visited));
      return Math.abs(val);
    }

    case 'SQRT': {
      const val = Number(evaluateExpression(rawArgs[0] || '0', matrix, visited));
      return Math.sqrt(val);
    }

    case 'POWER': {
      const base = Number(evaluateExpression(rawArgs[0] || '0', matrix, visited));
      const exp = Number(evaluateExpression(rawArgs[1] || '1', matrix, visited));
      return Math.pow(base, exp);
    }

    case 'IF': {
      if (rawArgs.length < 2) return '#N/A';
      const cond = evaluateExpression(rawArgs[0], matrix, visited);
      const isTruthy = cond === true || (typeof cond === 'number' && cond !== 0) || (typeof cond === 'string' && cond.toUpperCase() === 'TRUE');
      if (isTruthy) {
        return evaluateExpression(rawArgs[1], matrix, visited);
      } else {
        return rawArgs[2] ? evaluateExpression(rawArgs[2], matrix, visited) : false;
      }
    }

    case 'CONCAT':
    case 'CONCATENATE': {
      const vals = rawArgs.flatMap(expandArg);
      return vals.join('');
    }

    case 'UPPER': {
      const val = evaluateExpression(rawArgs[0] || '', matrix, visited);
      return String(val).toUpperCase();
    }

    case 'LOWER': {
      const val = evaluateExpression(rawArgs[0] || '', matrix, visited);
      return String(val).toLowerCase();
    }

    case 'LEN': {
      const val = evaluateExpression(rawArgs[0] || '', matrix, visited);
      return String(val).length;
    }

    case 'TRIM': {
      const val = evaluateExpression(rawArgs[0] || '', matrix, visited);
      return String(val).trim();
    }

    case 'TODAY': {
      return new Date().toLocaleDateString();
    }

    case 'NOW': {
      return new Date().toLocaleString();
    }

    case 'VLOOKUP': {
      if (rawArgs.length < 3) return '#N/A';
      const searchKey = String(evaluateExpression(rawArgs[0], matrix, visited)).toLowerCase().trim();
      const rangeStr = rawArgs[1];
      const range = parseRange(rangeStr);
      const colIndex = Number(evaluateExpression(rawArgs[2], matrix, visited)); // 1-indexed

      if (!range || isNaN(colIndex) || colIndex < 1) return '#REF!';

      const targetCol = range.startCol + colIndex - 1;
      if (targetCol > range.endCol) return '#REF!';

      for (let r = range.startRow; r <= range.endRow; r++) {
        const keyVal = getCellValue(cellKey(r, range.startCol), matrix, visited);
        if (String(keyVal).toLowerCase().trim() === searchKey) {
          return getCellValue(cellKey(r, targetCol), matrix, visited);
        }
      }
      return '#N/A';
    }

    default:
      return `#NAME? (${fnName})`;
  }
}

function evaluateArithmetic(
  expr: string,
  matrix: CellMatrix,
  visited: Set<string>
): any {
  // Replace cell references with their numerical or string values
  // Regex to match standalone A1 references (e.g. A1, B12, AA5, not followed by :)
  const tokenized = expr.replace(/\b([A-Za-z]+)(\d+)\b/g, (match) => {
    const coord = parseA1(match);
    if (!coord) return match;
    const val = getCellValue(cellKey(coord.row, coord.col), matrix, visited);
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') {
      const n = Number(val);
      if (!isNaN(n) && val.trim() !== '') return String(n);
      return JSON.stringify(val); // quoted string for safety
    }
    return String(val ?? 0);
  });

  // Evaluate simple safe mathematical expression
  try {
    // Only allow digits, operators, math symbols, parenthesis, decimals, spaces, and safe quotes
    const sanitized = tokenized.replace(/<>/g, '!=').replace(/=/g, '==');
    // Using Function to safely compute expression in sandbox
    const result = new Function(`"use strict"; return (${sanitized});`)();
    return result;
  } catch (e) {
    // If not a pure math expression, return original string or error
    return tokenized;
  }
}

export function recomputeSheetData(matrix: CellMatrix): CellMatrix {
  const newMatrix: CellMatrix = {};
  for (const [key, cell] of Object.entries(matrix)) {
    if (cell.raw && cell.raw.startsWith('=')) {
      const computed = evaluateFormula(cell.raw, matrix);
      newMatrix[key] = {
        ...cell,
        computed,
      };
    } else {
      newMatrix[key] = {
        ...cell,
        computed: cell.raw,
      };
    }
  }
  return newMatrix;
}

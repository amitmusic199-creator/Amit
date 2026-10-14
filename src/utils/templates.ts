import { CellMatrix, Sheet } from '../types/spreadsheet';
import { cellKey } from './cellUtils';
import { recomputeSheetData } from './formulaEngine';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  generateSheet: () => Sheet;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'budget',
    name: 'Monthly Budget & Expenses',
    description: 'Track income, housing, groceries, savings, and net balance with automatic calculations.',
    category: 'Finance',
    icon: 'Wallet',
    generateSheet: () => {
      const data: CellMatrix = {};

      // Title
      data[cellKey(0, 0)] = {
        raw: 'MONTHLY BUDGET PLANNER',
        format: { bold: true, formatType: 'text', textColor: '#1e3a8a', bgColor: '#dbeafe' },
      };

      // Header row
      const headers = ['Category', 'Item / Description', 'Budgeted ($)', 'Actual ($)', 'Variance ($)', 'Status'];
      headers.forEach((h, c) => {
        data[cellKey(2, c)] = {
          raw: h,
          format: { bold: true, align: c >= 2 ? 'right' : 'left', bgColor: '#1e293b', textColor: '#ffffff' },
        };
      });

      // Rows of data
      const items = [
        ['Income', 'Salary & Wages', '5000', '5200'],
        ['Income', 'Freelance / Side Gig', '800', '950'],
        ['Housing', 'Mortgage / Rent', '1800', '1800'],
        ['Housing', 'Electricity & Gas', '160', '145'],
        ['Housing', 'Internet & Mobile', '120', '120'],
        ['Living', 'Groceries', '600', '640'],
        ['Living', 'Dining Out & Coffee', '300', '380'],
        ['Transport', 'Car Payment & Gas', '450', '420'],
        ['Savings', 'Emergency Fund', '600', '600'],
        ['Savings', 'Retirement / Investments', '500', '500'],
      ];

      items.forEach((row, idx) => {
        const r = 3 + idx;
        data[cellKey(r, 0)] = { raw: row[0], format: { bold: idx === 0 || idx === 2 || idx === 5 || idx === 7 || idx === 8 } };
        data[cellKey(r, 1)] = { raw: row[1] };
        data[cellKey(r, 2)] = { raw: row[2], format: { formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right' } };
        data[cellKey(r, 3)] = { raw: row[3], format: { formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right' } };
        data[cellKey(r, 4)] = {
          raw: `=D${r + 1}-C${r + 1}`,
          format: { formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right' },
        };
        data[cellKey(r, 5)] = {
          raw: `=IF(E${r + 1}>=0,"On Track","Over Budget")`,
          format: { align: 'center' },
        };
      });

      // Total row
      const totalRow = 3 + items.length;
      data[cellKey(totalRow, 0)] = { raw: 'TOTAL', format: { bold: true, bgColor: '#f1f5f9' } };
      data[cellKey(totalRow, 1)] = { raw: 'Sum of all categories', format: { italic: true, bgColor: '#f1f5f9' } };
      data[cellKey(totalRow, 2)] = {
        raw: `=SUM(C4:C${totalRow})`,
        format: { bold: true, formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };
      data[cellKey(totalRow, 3)] = {
        raw: `=SUM(D4:D${totalRow})`,
        format: { bold: true, formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };
      data[cellKey(totalRow, 4)] = {
        raw: `=D${totalRow + 1}-C${totalRow + 1}`,
        format: { bold: true, formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };
      data[cellKey(totalRow, 5)] = {
        raw: `=IF(E${totalRow + 1}>=0,"Surplus","Deficit")`,
        format: { bold: true, align: 'center', bgColor: '#f1f5f9' },
      };

      const computed = recomputeSheetData(data);

      return {
        id: 'sheet_budget',
        name: 'Monthly Budget',
        rowCount: 40,
        colCount: 16,
        data: computed,
        colWidths: { 0: 130, 1: 220, 2: 120, 3: 120, 4: 120, 5: 130 },
      };
    },
  },
  {
    id: 'sales',
    name: 'Sales Pipeline & Revenue',
    description: 'Track deals, lead stages, probability, and calculated expected revenue forecast.',
    category: 'Sales',
    icon: 'TrendingUp',
    generateSheet: () => {
      const data: CellMatrix = {};

      data[cellKey(0, 0)] = {
        raw: 'Q4 SALES PIPELINE & DEALS',
        format: { bold: true, textColor: '#047857', bgColor: '#d1fae5' },
      };

      const headers = ['Account / Client', 'Product', 'Stage', 'Deal Value ($)', 'Probability', 'Weighted Forecast ($)', 'Close Target'];
      headers.forEach((h, c) => {
        data[cellKey(2, c)] = {
          raw: h,
          format: { bold: true, align: c >= 3 ? 'right' : 'left', bgColor: '#064e3b', textColor: '#ffffff' },
        };
      });

      const deals = [
        ['Acme Corp', 'Enterprise Suite', 'Proposal Sent', '45000', '0.6', '2026-11-15'],
        ['Nexus Logistics', 'Cloud Platform', 'Negotiation', '28000', '0.8', '2026-10-30'],
        ['Starlight Media', 'Starter Plan', 'Discovery', '12000', '0.3', '2026-12-01'],
        ['Apex Fintech', 'Enterprise Suite', 'Contract Review', '60000', '0.9', '2026-10-25'],
        ['Beacon Health', 'Team License', 'Qualified Lead', '18500', '0.4', '2026-11-30'],
        ['Horizon Robotics', 'Custom Add-on', 'Closed Won', '32000', '1.0', '2026-10-18'],
      ];

      deals.forEach((deal, idx) => {
        const r = 3 + idx;
        data[cellKey(r, 0)] = { raw: deal[0], format: { bold: true } };
        data[cellKey(r, 1)] = { raw: deal[1] };
        data[cellKey(r, 2)] = { raw: deal[2] };
        data[cellKey(r, 3)] = { raw: deal[3], format: { formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right' } };
        data[cellKey(r, 4)] = { raw: deal[4], format: { formatType: 'percentage', decimals: 0, align: 'right' } };
        data[cellKey(r, 5)] = {
          raw: `=D${r + 1}*E${r + 1}`,
          format: { formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right' },
        };
        data[cellKey(r, 6)] = { raw: deal[5], format: { formatType: 'date', align: 'center' } };
      });

      const totalRow = 3 + deals.length;
      data[cellKey(totalRow, 0)] = { raw: 'TOTAL PIPELINE', format: { bold: true, bgColor: '#f1f5f9' } };
      data[cellKey(totalRow, 3)] = {
        raw: `=SUM(D4:D${totalRow})`,
        format: { bold: true, formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };
      data[cellKey(totalRow, 4)] = {
        raw: `=AVERAGE(E4:E${totalRow})`,
        format: { bold: true, formatType: 'percentage', decimals: 1, align: 'right', bgColor: '#f1f5f9' },
      };
      data[cellKey(totalRow, 5)] = {
        raw: `=SUM(F4:F${totalRow})`,
        format: { bold: true, formatType: 'currency', currencySymbol: '$', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };

      const computed = recomputeSheetData(data);

      return {
        id: 'sheet_sales',
        name: 'Sales Pipeline',
        rowCount: 35,
        colCount: 14,
        data: computed,
        colWidths: { 0: 170, 1: 150, 2: 130, 3: 130, 4: 110, 5: 160, 6: 120 },
      };
    },
  },
  {
    id: 'projects',
    name: 'Project Tasks & Sprints',
    description: 'Manage deliverables, assignees, priorities, estimated vs actual hours, and variance.',
    category: 'Productivity',
    icon: 'CheckSquare',
    generateSheet: () => {
      const data: CellMatrix = {};

      data[cellKey(0, 0)] = {
        raw: 'SPRINT EXECUTION & TASK LOG',
        format: { bold: true, textColor: '#4c1d95', bgColor: '#ede9fe' },
      };

      const headers = ['Task ID', 'Task Title', 'Owner', 'Priority', 'Status', 'Est. Hours', 'Actual Hours', 'Hours Diff'];
      headers.forEach((h, c) => {
        data[cellKey(2, c)] = {
          raw: h,
          format: { bold: true, align: c >= 5 ? 'right' : 'left', bgColor: '#3b0764', textColor: '#ffffff' },
        };
      });

      const tasks = [
        ['TSK-101', 'User Authentication Flow', 'Elena', 'High', 'Done', '16', '14'],
        ['TSK-102', 'Database Indexing & Queries', 'Marcus', 'High', 'In Progress', '24', '20'],
        ['TSK-103', 'Dashboard UI Components', 'Sarah', 'Medium', 'Done', '20', '22'],
        ['TSK-104', 'Stripe Billing Webhook', 'Elena', 'Urgent', 'In Progress', '12', '15'],
        ['TSK-105', 'Automated Integration Tests', 'Alex', 'Medium', 'In Review', '18', '16'],
        ['TSK-106', 'Mobile Responsive Auditing', 'Sarah', 'Low', 'Todo', '10', '0'],
      ];

      tasks.forEach((task, idx) => {
        const r = 3 + idx;
        data[cellKey(r, 0)] = { raw: task[0], format: { bold: true } };
        data[cellKey(r, 1)] = { raw: task[1] };
        data[cellKey(r, 2)] = { raw: task[2] };
        data[cellKey(r, 3)] = { raw: task[3] };
        data[cellKey(r, 4)] = { raw: task[4] };
        data[cellKey(r, 5)] = { raw: task[5], format: { formatType: 'number', decimals: 0, align: 'right' } };
        data[cellKey(r, 6)] = { raw: task[6], format: { formatType: 'number', decimals: 0, align: 'right' } };
        data[cellKey(r, 7)] = {
          raw: `=G${r + 1}-F${r + 1}`,
          format: { formatType: 'number', decimals: 0, align: 'right' },
        };
      });

      const totalRow = 3 + tasks.length;
      data[cellKey(totalRow, 1)] = { raw: 'TOTAL HOURS', format: { bold: true, bgColor: '#f1f5f9' } };
      data[cellKey(totalRow, 5)] = {
        raw: `=SUM(F4:F${totalRow})`,
        format: { bold: true, formatType: 'number', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };
      data[cellKey(totalRow, 6)] = {
        raw: `=SUM(G4:G${totalRow})`,
        format: { bold: true, formatType: 'number', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };
      data[cellKey(totalRow, 7)] = {
        raw: `=SUM(H4:H${totalRow})`,
        format: { bold: true, formatType: 'number', decimals: 0, align: 'right', bgColor: '#f1f5f9' },
      };

      const computed = recomputeSheetData(data);

      return {
        id: 'sheet_projects',
        name: 'Sprint Tasks',
        rowCount: 35,
        colCount: 12,
        data: computed,
        colWidths: { 0: 100, 1: 240, 2: 110, 3: 100, 4: 120, 5: 110, 6: 110, 7: 110 },
      };
    },
  },
  {
    id: 'blank',
    name: 'Blank Spreadsheet',
    description: 'A clean canvas ready for your custom columns, formulas, and data.',
    category: 'General',
    icon: 'FileSpreadsheet',
    generateSheet: () => ({
      id: `sheet_${Date.now()}`,
      name: 'Sheet1',
      rowCount: 50,
      colCount: 20,
      data: {},
      colWidths: {},
    }),
  },
];

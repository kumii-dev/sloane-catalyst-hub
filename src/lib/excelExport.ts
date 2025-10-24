import { ModelOutput } from './modelEngine';

/**
 * Export financial model to Excel format
 * Note: This creates a CSV file since full Excel export requires additional libraries
 */
export function exportToExcel(modelOutput: ModelOutput, modelName: string): void {
  const csvContent = generateCSV(modelOutput);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${modelName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function generateCSV(modelOutput: ModelOutput): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`Financial Model Export - ${new Date().toLocaleString()}`);
  lines.push('');
  
  // Income Statement
  lines.push('INCOME STATEMENT');
  lines.push(['Period', ...modelOutput.periods.map(p => p.label)].join(','));
  
  const isKeys: (keyof typeof modelOutput.incomeStatement[0])[] = [
    'revenue', 'cogs', 'grossProfit', 'opex', 'ebitda', 
    'depreciation', 'ebit', 'interest', 'ebt', 'tax', 'netIncome'
  ];
  
  isKeys.forEach(key => {
    const row = [
      formatLabel(key),
      ...modelOutput.incomeStatement.map(is => formatNumber(is[key]))
    ];
    lines.push(row.join(','));
  });
  
  lines.push('');
  
  // Balance Sheet
  lines.push('BALANCE SHEET');
  lines.push(['Period', ...modelOutput.periods.map(p => p.label)].join(','));
  
  const bsKeys: (keyof typeof modelOutput.balanceSheet[0])[] = [
    'cash', 'accountsReceivable', 'inventory', 'currentAssets',
    'ppe', 'accumulatedDepreciation', 'netPPE', 'totalAssets',
    'accountsPayable', 'currentLiabilities', 'debt', 'totalLiabilities',
    'equity', 'retainedEarnings', 'totalEquity', 'totalLiabilitiesAndEquity'
  ];
  
  bsKeys.forEach(key => {
    const row = [
      formatLabel(key),
      ...modelOutput.balanceSheet.map(bs => formatNumber(bs[key]))
    ];
    lines.push(row.join(','));
  });
  
  lines.push('');
  
  // Cash Flow Statement
  lines.push('CASH FLOW STATEMENT');
  lines.push(['Period', ...modelOutput.periods.map(p => p.label)].join(','));
  
  const cfKeys: (keyof typeof modelOutput.cashFlowStatement[0])[] = [
    'netIncome', 'depreciation', 'changeInAR', 'changeInInventory', 'changeInAP',
    'cfo', 'capex', 'cfi', 'debtDrawdown', 'debtRepayment', 'equityInjection',
    'cff', 'netCashFlow', 'beginningCash', 'endingCash'
  ];
  
  cfKeys.forEach(key => {
    const row = [
      formatLabel(key),
      ...modelOutput.cashFlowStatement.map(cf => formatNumber(cf[key]))
    ];
    lines.push(row.join(','));
  });
  
  return lines.join('\n');
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatNumber(value: number): string {
  return value.toFixed(2);
}

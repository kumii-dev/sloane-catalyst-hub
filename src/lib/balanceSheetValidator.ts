import { BalanceSheet, Period } from './modelEngine';

export interface ValidationError {
  type: string;
  period: string;
  message: string;
  expected?: number;
  actual?: number;
  difference?: number;
}

export interface ValidationResult {
  hasErrors: boolean;
  errors: ValidationError[];
}

const TOLERANCE = 0.01; // Allow $0.01 difference for rounding

export function validateBalanceSheet(
  balanceSheets: BalanceSheet[],
  periods: Period[]
): ValidationResult {
  const errors: ValidationError[] = [];

  balanceSheets.forEach((bs, index) => {
    const period = periods[index];
    
    // Skip validation for annual total rows
    if (period.isAnnualTotal) return;
    
    const periodLabel = period.label;

    // 1. Assets = Liabilities + Equity
    const totalAssets = bs.totalAssets;
    const totalLiabAndEquity = bs.totalLiabilitiesAndEquity;
    const balanceDiff = Math.abs(totalAssets - totalLiabAndEquity);
    
    if (balanceDiff > TOLERANCE) {
      errors.push({
        type: 'BALANCE_SHEET_IMBALANCE',
        period: periodLabel,
        message: `Balance sheet does not balance: Assets ≠ Liabilities + Equity`,
        expected: totalAssets,
        actual: totalLiabAndEquity,
        difference: balanceDiff,
      });
    }

    // 2. Current Assets = Cash + AR + Inventory
    const calculatedCurrentAssets = bs.cash + bs.accountsReceivable + bs.inventory;
    const currentAssetsDiff = Math.abs(bs.currentAssets - calculatedCurrentAssets);
    
    if (currentAssetsDiff > TOLERANCE) {
      errors.push({
        type: 'CURRENT_ASSETS_ERROR',
        period: periodLabel,
        message: `Current Assets calculation error`,
        expected: calculatedCurrentAssets,
        actual: bs.currentAssets,
        difference: currentAssetsDiff,
      });
    }

    // 3. Net PPE = PPE - Accumulated Depreciation
    const calculatedNetPPE = bs.ppe - bs.accumulatedDepreciation;
    const netPPEDiff = Math.abs(bs.netPPE - calculatedNetPPE);
    
    if (netPPEDiff > TOLERANCE) {
      errors.push({
        type: 'PPE_ERROR',
        period: periodLabel,
        message: `Net PPE calculation error`,
        expected: calculatedNetPPE,
        actual: bs.netPPE,
        difference: netPPEDiff,
      });
    }

    // 4. Total Assets = Current Assets + Net PPE
    const calculatedTotalAssets = bs.currentAssets + bs.netPPE;
    const totalAssetsDiff = Math.abs(bs.totalAssets - calculatedTotalAssets);
    
    if (totalAssetsDiff > TOLERANCE) {
      errors.push({
        type: 'TOTAL_ASSETS_ERROR',
        period: periodLabel,
        message: `Total Assets calculation error`,
        expected: calculatedTotalAssets,
        actual: bs.totalAssets,
        difference: totalAssetsDiff,
      });
    }

    // 5. Total Liabilities = Current Liabilities + Debt
    const calculatedTotalLiab = bs.currentLiabilities + bs.debt;
    const totalLiabDiff = Math.abs(bs.totalLiabilities - calculatedTotalLiab);
    
    if (totalLiabDiff > TOLERANCE) {
      errors.push({
        type: 'TOTAL_LIABILITIES_ERROR',
        period: periodLabel,
        message: `Total Liabilities calculation error`,
        expected: calculatedTotalLiab,
        actual: bs.totalLiabilities,
        difference: totalLiabDiff,
      });
    }

    // 6. Total Equity = Equity + Retained Earnings
    const calculatedTotalEquity = bs.equity + bs.retainedEarnings;
    const totalEquityDiff = Math.abs(bs.totalEquity - calculatedTotalEquity);
    
    if (totalEquityDiff > TOLERANCE) {
      errors.push({
        type: 'TOTAL_EQUITY_ERROR',
        period: periodLabel,
        message: `Total Equity calculation error`,
        expected: calculatedTotalEquity,
        actual: bs.totalEquity,
        difference: totalEquityDiff,
      });
    }

    // 7. Negative equity warning (not an error, but a warning)
    if (bs.totalEquity < 0) {
      errors.push({
        type: 'NEGATIVE_EQUITY_WARNING',
        period: periodLabel,
        message: `Negative equity detected (company is insolvent)`,
        actual: bs.totalEquity,
      });
    }

    // 8. Negative cash warning
    if (bs.cash < 0) {
      errors.push({
        type: 'NEGATIVE_CASH_WARNING',
        period: periodLabel,
        message: `Negative cash balance (company needs financing)`,
        actual: bs.cash,
      });
    }
  });

  return {
    hasErrors: errors.length > 0,
    errors,
  };
}

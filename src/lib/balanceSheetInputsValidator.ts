import { ModelState } from '@/store/modelStore';

export interface BalanceSheetValidationIssue {
  type: 'error' | 'warning';
  message: string;
  suggestion: string;
  field?: string;
  stepIndex?: number;
  stepName?: string;
}

export interface BalanceSheetValidationResult {
  isValid: boolean;
  issues: BalanceSheetValidationIssue[];
}

export function validateBalanceSheetInputs(state: ModelState): BalanceSheetValidationResult {
  const issues: BalanceSheetValidationIssue[] = [];

  // Validate revenue drivers exist
  if (!state.revenue || state.revenue.length === 0) {
    issues.push({
      type: 'error',
      message: 'No revenue drivers defined',
      suggestion: 'Please add at least one revenue driver in the Revenue step. Without revenue, the financial model cannot be generated.',
      field: 'revenue',
      stepIndex: 2,
      stepName: 'Revenue'
    });
  }

  // Validate COGS settings
  if (!state.cogs.method) {
    issues.push({
      type: 'warning',
      message: 'COGS method not specified',
      suggestion: 'Consider specifying how Cost of Goods Sold should be calculated (e.g., as a percentage of revenue).',
      field: 'cogs'
    });
  }

  // Validate working capital makes sense
  if (state.workingCapital.DSO > 365) {
    issues.push({
      type: 'warning',
      message: 'Days Sales Outstanding (DSO) seems unusually high',
      suggestion: `DSO of ${state.workingCapital.DSO} days is over a year. Typical values are 30-90 days. Please verify this is correct.`,
      field: 'workingCapital'
    });
  }

  if (state.workingCapital.DIO > 365) {
    issues.push({
      type: 'warning',
      message: 'Days Inventory Outstanding (DIO) seems unusually high',
      suggestion: `DIO of ${state.workingCapital.DIO} days is over a year. Please verify this is correct.`,
      field: 'workingCapital'
    });
  }

  // Validate debt structure if debt exists
  if (state.debt && state.debt.length > 0) {
    state.debt.forEach((debt, index) => {
      if (!debt.principal || debt.principal <= 0) {
        issues.push({
          type: 'error',
          message: `Debt ${index + 1} has no principal amount`,
          suggestion: 'Please specify the principal amount for all debt items.',
          field: 'debt',
          stepIndex: 7,
          stepName: 'Debt'
        });
      }
      if (!debt.ratePct || debt.ratePct < 0) {
        issues.push({
          type: 'error',
          message: `Debt ${index + 1} has no interest rate`,
          suggestion: 'Please specify the interest rate for all debt items.',
          field: 'debt',
          stepIndex: 7,
          stepName: 'Debt'
        });
      }
    });
  }

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    issues
  };
}

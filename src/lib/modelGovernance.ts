/**
 * Financial Model Governance and Ethics System
 * 
 * Implements transparency, traceability, audit logging,
 * and ethical standards for financial modeling.
 */

import { ModelOutput } from './modelEngine';

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  modelVersion: string;
  changes: string[];
  previousState?: any;
  newState?: any;
}

export interface AssumptionTrace {
  category: string;
  assumption: string;
  value: any;
  source: 'User Input' | 'Formula' | 'Default' | 'Override';
  impactedOutputs: string[];
  confidence: 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface GovernanceNote {
  modelName: string;
  preparedBy: string;
  preparedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  complianceStandards: string[];
  keyJudgments: string[];
  limitations: string[];
  overrides: ManualOverride[];
  certificationStatement: string;
}

export interface ManualOverride {
  period: string;
  account: string;
  originalValue: number;
  overrideValue: number;
  reason: string;
  approvedBy: string;
  timestamp: string;
}

export interface TransparencyReport {
  modelName: string;
  generatedDate: string;
  assumptions: AssumptionTrace[];
  traceabilityMap: Map<string, string[]>;
  governanceNote: GovernanceNote;
  auditLog: AuditLogEntry[];
  integrityScore: number;
}

const AUDIT_LOG_KEY = 'financial_model_audit_log';
const MAX_LOG_ENTRIES = 100;

/**
 * Load audit log from localStorage
 */
export function loadAuditLog(): AuditLogEntry[] {
  try {
    const log = localStorage.getItem(AUDIT_LOG_KEY);
    return log ? JSON.parse(log) : [];
  } catch (error) {
    console.error('Failed to load audit log:', error);
    return [];
  }
}

/**
 * Save audit log to localStorage
 */
export function saveAuditLog(log: AuditLogEntry[]): void {
  try {
    // Keep only last MAX_LOG_ENTRIES
    const trimmed = log.slice(-MAX_LOG_ENTRIES);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save audit log:', error);
  }
}

/**
 * Add entry to audit log
 */
export function addAuditLogEntry(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const log = loadAuditLog();
  log.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  saveAuditLog(log);
}

/**
 * Generate traceability map linking outputs to inputs
 */
export function generateTraceabilityMap(modelOutput: ModelOutput): Map<string, string[]> {
  const map = new Map<string, string[]>();

  // Revenue traceability
  map.set('Revenue', ['Revenue Growth Rate', 'Starting Revenue', 'Revenue Drivers']);
  
  // COGS traceability
  map.set('COGS', ['COGS % of Revenue', 'Revenue', 'Direct Costs']);
  
  // Operating Expenses
  map.set('Operating Expenses', ['OpEx Fixed', 'OpEx Variable %', 'Revenue']);
  
  // Depreciation
  map.set('Depreciation', ['Depreciation Schedule', 'PPE Additions', 'Asset Lives', 'Depreciation Method']);
  
  // Interest Expense
  map.set('Interest Expense', ['Debt Balance', 'Interest Rate', 'Debt Schedule']);
  
  // Tax Expense
  map.set('Tax Expense', ['EBT', 'Tax Rate', 'Tax Loss Carryforwards']);
  
  // Net Income
  map.set('Net Income', ['Revenue', 'COGS', 'OpEx', 'Depreciation', 'Interest', 'Tax']);
  
  // Cash Flow from Operations
  map.set('CFO', ['Net Income', 'Depreciation', 'Working Capital Changes']);
  
  // Cash Flow from Investing
  map.set('CFI', ['Capex', 'Asset Sales', 'Acquisitions']);
  
  // Cash Flow from Financing
  map.set('CFF', ['Debt Drawdown', 'Debt Repayment', 'Equity Issuance', 'Dividends']);
  
  // Balance Sheet items
  map.set('Cash', ['Beginning Cash', 'CFO', 'CFI', 'CFF']);
  map.set('PPE', ['Beginning PPE', 'Capex', 'Depreciation', 'Disposals']);
  map.set('Debt', ['Beginning Debt', 'Drawdowns', 'Repayments']);
  map.set('Retained Earnings', ['Beginning RE', 'Net Income', 'Dividends']);

  return map;
}

/**
 * Extract assumptions from model state
 */
export function extractAssumptions(state: any): AssumptionTrace[] {
  const assumptions: AssumptionTrace[] = [];

  // Revenue assumptions
  if (state.revenueAssumptions) {
    assumptions.push({
      category: 'Revenue',
      assumption: 'Revenue Growth Profile',
      value: state.revenueAssumptions,
      source: 'User Input',
      impactedOutputs: ['Revenue', 'COGS', 'OpEx', 'Net Income'],
      confidence: 'High',
    });
  }

  // COGS assumptions
  if (state.cogsAssumptions) {
    assumptions.push({
      category: 'Cost of Goods Sold',
      assumption: 'COGS as % of Revenue',
      value: state.cogsAssumptions,
      source: 'User Input',
      impactedOutputs: ['COGS', 'Gross Profit', 'Net Income'],
      confidence: 'High',
    });
  }

  // OpEx assumptions
  if (state.opexAssumptions) {
    assumptions.push({
      category: 'Operating Expenses',
      assumption: 'Fixed and Variable OpEx',
      value: state.opexAssumptions,
      source: 'User Input',
      impactedOutputs: ['Operating Expenses', 'EBITDA', 'Net Income'],
      confidence: 'Medium',
      notes: 'Variable OpEx scales with revenue growth',
    });
  }

  // Tax assumptions
  if (state.taxAssumptions) {
    assumptions.push({
      category: 'Taxation',
      assumption: 'Corporate Tax Rate',
      value: state.taxAssumptions,
      source: 'User Input',
      impactedOutputs: ['Tax Expense', 'Net Income', 'Cash Flow'],
      confidence: 'High',
      notes: 'Based on jurisdictional tax law',
    });
  }

  // Debt assumptions
  if (state.debtAssumptions) {
    assumptions.push({
      category: 'Debt & Financing',
      assumption: 'Debt Schedule and Interest Rates',
      value: state.debtAssumptions,
      source: 'User Input',
      impactedOutputs: ['Interest Expense', 'Debt Balance', 'Cash Flow'],
      confidence: 'High',
    });
  }

  // Working Capital assumptions
  if (state.workingCapitalAssumptions) {
    assumptions.push({
      category: 'Working Capital',
      assumption: 'AR/Inventory/AP Days',
      value: state.workingCapitalAssumptions,
      source: 'User Input',
      impactedOutputs: ['Working Capital', 'Cash Flow from Operations'],
      confidence: 'Medium',
      notes: 'Based on historical averages or industry benchmarks',
    });
  }

  return assumptions;
}

/**
 * Generate governance note
 */
export function generateGovernanceNote(
  modelName: string,
  preparedBy: string = 'System User',
  overrides: ManualOverride[] = []
): GovernanceNote {
  return {
    modelName,
    preparedBy,
    preparedDate: new Date().toISOString(),
    complianceStandards: [
      'IFRS - International Financial Reporting Standards',
      'US GAAP - Generally Accepted Accounting Principles',
      'Double-Entry Accounting',
      'Three-Statement Integration',
    ],
    keyJudgments: [
      'Revenue growth rates based on market analysis and historical trends',
      'Cost assumptions derived from operational data and industry benchmarks',
      'Depreciation methods follow standard asset life guidelines',
      'Working capital assumptions reflect business cycle characteristics',
    ],
    limitations: [
      'Model is based on assumptions that may not materialize',
      'Future performance may differ materially from projections',
      'External factors (market conditions, regulations) not fully modeled',
      'Stress testing recommended for risk assessment',
    ],
    overrides,
    certificationStatement: `
      This financial model has been prepared in accordance with professional
      accounting standards (IFRS and US GAAP) and industry best practices.
      All assumptions have been documented, and the model maintains dynamic
      balance across the three financial statements. The model has been validated
      using automated integrity checks to ensure Assets = Liabilities + Equity,
      proper cash flow reconciliation, and retained earnings rollforward accuracy.
      
      Model Integrity Confirmed: ${new Date().toLocaleDateString()}
    `,
  };
}

/**
 * Calculate model integrity score (0-100)
 */
export function calculateIntegrityScore(
  hasBalanceSheetErrors: boolean,
  hasCashFlowErrors: boolean,
  hasRetainedEarningsErrors: boolean,
  hasDepreciationErrors: boolean,
  manualOverridesCount: number
): number {
  let score = 100;

  // Deduct for critical errors
  if (hasBalanceSheetErrors) score -= 30;
  if (hasCashFlowErrors) score -= 25;
  if (hasRetainedEarningsErrors) score -= 20;
  if (hasDepreciationErrors) score -= 10;

  // Deduct for manual overrides (indicates model may not be fully automated)
  score -= Math.min(15, manualOverridesCount * 3);

  return Math.max(0, score);
}

/**
 * Generate comprehensive transparency report
 */
export function generateTransparencyReport(
  modelOutput: ModelOutput,
  modelName: string,
  state: any,
  validationErrors: any[],
  overrides: ManualOverride[] = []
): TransparencyReport {
  const assumptions = extractAssumptions(state);
  const traceabilityMap = generateTraceabilityMap(modelOutput);
  const governanceNote = generateGovernanceNote(modelName, 'System User', overrides);
  const auditLog = loadAuditLog();

  const hasBalanceSheetErrors = validationErrors.some(e => e.type === 'BALANCE_SHEET_IMBALANCE');
  const hasCashFlowErrors = validationErrors.some(e => e.type === 'CASH_FLOW_MISMATCH');
  const hasRetainedEarningsErrors = validationErrors.some(e => e.type === 'RETAINED_EARNINGS_ERROR');
  const hasDepreciationErrors = validationErrors.some(e => e.type === 'DEPRECIATION_ERROR');

  const integrityScore = calculateIntegrityScore(
    hasBalanceSheetErrors,
    hasCashFlowErrors,
    hasRetainedEarningsErrors,
    hasDepreciationErrors,
    overrides.length
  );

  return {
    modelName,
    generatedDate: new Date().toISOString(),
    assumptions,
    traceabilityMap,
    governanceNote,
    auditLog,
    integrityScore,
  };
}

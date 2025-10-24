/**
 * Financial Model Knowledge Cache and Verification System
 * 
 * Implements persistent storage of verified accounting knowledge
 * with automatic revalidation and integrity checks.
 */

export interface AccountingKnowledge {
  threeStatementIntegration: string;
  transactionFlows: string;
  fundamentalEquation: string;
  supportSchedules: string;
  commonImbalances: string;
  lastVerified: string;
  version: string;
}

export interface KnowledgeCache {
  knowledge: AccountingKnowledge;
  isValid: boolean;
  daysUntilRevalidation: number;
}

const CACHE_KEY = 'financial_model_knowledge_cache';
const CACHE_VALIDITY_DAYS = 7;

/**
 * Core Accounting Principles from Referenced Textbooks
 */
const VERIFIED_KNOWLEDGE: AccountingKnowledge = {
  threeStatementIntegration: `
    The three financial statements are interconnected:
    1. Net Income from Income Statement flows to Retained Earnings on Balance Sheet
    2. Net Income is the starting point for Cash Flow Statement (CFO)
    3. Ending Cash from Cash Flow ties to Cash on Balance Sheet
    4. Depreciation appears on all three statements:
       - Income Statement: as expense
       - Cash Flow: added back in CFO
       - Balance Sheet: reduces PPE via Accumulated Depreciation
    5. Changes in Working Capital bridge income to cash
    6. Capital expenditures link Cash Flow (CFI) to Balance Sheet (PPE)
    7. Debt transactions flow through CFF and update Balance Sheet liabilities
  `,
  transactionFlows: `
    Double-entry accounting ensures every transaction has equal debits and credits:
    
    LOAN DRAWDOWN:
    - Debit: Cash (Asset ↑)
    - Credit: Long-term Debt (Liability ↑)
    
    LOAN REPAYMENT:
    - Debit: Long-term Debt (Liability ↓)
    - Credit: Cash (Asset ↓)
    
    INTEREST EXPENSE:
    - Debit: Interest Expense (Income Statement)
    - Credit: Interest Payable or Cash (Liability/Asset)
    - Impact: Reduces Net Income → Reduces Retained Earnings
    
    DEPRECIATION:
    - Debit: Depreciation Expense (Income Statement)
    - Credit: Accumulated Depreciation (Contra-Asset)
    - Impact: Reduces Net Income → Reduces Retained Earnings
    - Note: Non-cash expense, added back in CFO
    
    CAPITAL EXPENDITURE:
    - Debit: PPE (Asset ↑)
    - Credit: Cash (Asset ↓)
  `,
  fundamentalEquation: `
    Assets = Liabilities + Equity
    
    This equation must hold at all times. Any imbalance indicates:
    1. Missing transaction entry
    2. Incorrect double-entry logic
    3. Broken link between statements
    4. Manual override without corresponding adjustment
    
    Equity components:
    - Common Stock (paid-in capital)
    - Retained Earnings (cumulative net income - dividends)
    - Other Comprehensive Income
    
    Retained Earnings Rollforward:
    RE_ending = RE_beginning + Net Income - Dividends +/- Adjustments
  `,
  supportSchedules: `
    Essential support schedules ensure statement integration:
    
    1. DEPRECIATION SCHEDULE:
       - Tracks each asset's life, method, and accumulated depreciation
       - Links to Income Statement (expense) and Balance Sheet (acc. depreciation)
    
    2. DEBT SCHEDULE:
       - Opening balance + Drawdowns - Repayments = Closing balance
       - Interest calculated on average or opening balance
       - Links to Balance Sheet (debt) and Cash Flow (financing activities)
    
    3. WORKING CAPITAL SCHEDULE:
       - Tracks AR, Inventory, AP, and other current accounts
       - Changes flow to Cash Flow Statement (CFO adjustments)
    
    4. EQUITY SCHEDULE:
       - Capital injections, retained earnings rollforward
       - Dividend policy and distribution timing
  `,
  commonImbalances: `
    Common causes of model imbalance and fixes:
    
    1. RETAINED EARNINGS MISMATCH:
       Cause: Net Income not flowing correctly to Balance Sheet
       Fix: Verify RE_end = RE_begin + Net Income - Dividends
    
    2. CASH IMBALANCE:
       Cause: Cash Flow ending balance ≠ Balance Sheet cash
       Fix: Verify Beginning Cash + CFO + CFI + CFF = Ending Cash
    
    3. PPE DEPRECIATION ERROR:
       Cause: Depreciation expense not reducing PPE
       Fix: PPE_end = PPE_begin + Capex - Depreciation - Disposals
            AccDep_end = AccDep_begin + Depreciation
    
    4. DEBT SCHEDULE BREAK:
       Cause: Debt not updating with drawdowns/repayments
       Fix: Verify debt schedule links to CFF and Balance Sheet
    
    5. WORKING CAPITAL DISCONNECT:
       Cause: Changes in WC not reflected in CFO
       Fix: ΔAR, ΔInventory, ΔAP must flow to Cash Flow
    
    6. DOUBLE-ENTRY VIOLATION:
       Cause: Transaction with unequal debits and credits
       Fix: Review all accounting entries for balance
  `,
  lastVerified: new Date().toISOString(),
  version: '1.0.0',
};

/**
 * Load knowledge cache from localStorage
 */
export function loadKnowledgeCache(): KnowledgeCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const lastVerified = new Date(parsed.knowledge.lastVerified);
    const now = new Date();
    const daysSinceVerification = Math.floor((now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilRevalidation = Math.max(0, CACHE_VALIDITY_DAYS - daysSinceVerification);
    const isValid = daysSinceVerification < CACHE_VALIDITY_DAYS;

    return {
      knowledge: parsed.knowledge,
      isValid,
      daysUntilRevalidation,
    };
  } catch (error) {
    console.error('Failed to load knowledge cache:', error);
    return null;
  }
}

/**
 * Save knowledge cache to localStorage
 */
export function saveKnowledgeCache(): void {
  try {
    const cache = {
      knowledge: {
        ...VERIFIED_KNOWLEDGE,
        lastVerified: new Date().toISOString(),
      },
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save knowledge cache:', error);
  }
}

/**
 * Refresh accounting knowledge and reset cache
 */
export function refreshKnowledge(): KnowledgeCache {
  saveKnowledgeCache();
  return {
    knowledge: VERIFIED_KNOWLEDGE,
    isValid: true,
    daysUntilRevalidation: CACHE_VALIDITY_DAYS,
  };
}

/**
 * Get current knowledge (from cache or fresh)
 */
export function getAccountingKnowledge(): KnowledgeCache {
  const cached = loadKnowledgeCache();
  
  if (!cached || !cached.isValid) {
    return refreshKnowledge();
  }
  
  return cached;
}

/**
 * Verify knowledge consistency
 */
export function verifyKnowledgeIntegrity(): boolean {
  const cache = loadKnowledgeCache();
  if (!cache) return false;

  // Check that all required fields are present
  const required = [
    'threeStatementIntegration',
    'transactionFlows',
    'fundamentalEquation',
    'supportSchedules',
    'commonImbalances',
  ];

  return required.every(field => 
    cache.knowledge[field as keyof AccountingKnowledge] && 
    cache.knowledge[field as keyof AccountingKnowledge].length > 0
  );
}

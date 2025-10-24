import { ModelState, CapexDriver } from '@/store/modelStore';

export interface Period {
  year: number;
  period: number;
  label: string;
  isAnnualTotal?: boolean;
}

export interface IncomeStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest: number;
  ebt: number;
  tax: number;
  netIncome: number;
}

export interface BalanceSheet {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  currentAssets: number;
  ppe: number;
  accumulatedDepreciation: number;
  netPPE: number;
  totalAssets: number;
  accountsPayable: number;
  currentLiabilities: number;
  debt: number;
  totalLiabilities: number;
  equity: number;
  retainedEarnings: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export interface CashFlowStatement {
  netIncome: number;
  depreciation: number;
  changeInAR: number;
  changeInInventory: number;
  changeInAP: number;
  cfo: number;
  capex: number;
  totalPPEAdditions: number; // For reconciliation: includes non-cash capex
  cfi: number;
  debtDrawdown: number;
  debtRepayment: number;
  equityInjection: number;
  cff: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export interface DepreciationSchedule {
  assetName: string;
  year: number;
  amount: number;
  lifeYears: number;
  method: string;
  beginningValue: number;
  depreciation: number;
  endingValue: number;
}

export interface LiquidityRatios {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;
}

export interface BreakEvenAnalysis {
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  contributionMargin: number;
  contributionMarginPct: number;
  breakEvenRevenue: number;
  breakEvenUnits: number;
  marginOfSafety: number;
  marginOfSafetyPct: number;
}

export interface ModelOutput {
  periods: Period[];
  incomeStatement: IncomeStatement[];
  balanceSheet: BalanceSheet[];
  cashFlowStatement: CashFlowStatement[];
  depreciationSchedule: DepreciationSchedule[];
  liquidityRatios: LiquidityRatios[];
  breakEvenAnalysis: BreakEvenAnalysis[];
  frequency: 'Monthly' | 'Quarterly';
}

export function calculateModel(state: ModelState): ModelOutput {
  // Generate historical periods if available
  const historicalPeriods = state.company.hasHistoricalData && state.historicalData.length > 0
    ? generateHistoricalPeriods(state.historicalData)
    : [];
  
  // Generate forecast periods
  const forecastPeriods = generatePeriods(state.company.horizonYears, state.frequency);
  
  // Combine periods
  const allPeriods = [...historicalPeriods, ...forecastPeriods];
  
  // Initialize arrays for each statement
  const incomeStatements: IncomeStatement[] = [];
  const balanceSheets: BalanceSheet[] = [];
  const cashFlowStatements: CashFlowStatement[] = [];
  
  // Initial balance sheet values
  // ACCOUNTING PRINCIPLE: Assets = Liabilities + Equity at all times
  // Initialize from declared assets, debt, and equity in the Financing tab
  
  // Initialize assets from debt and equity allocations (proper accounting)
  // ACCOUNTING PRINCIPLE: Assets = Liabilities + Equity at all times
  let previousCash = 0;
  let previousAR = 0;
  let previousInventory = 0;
  let previousPPE = 0;
  let previousAccDep = 0;
  let previousAP = 0;
  
  // If no historical data, calculate initial assets from financing allocations
  if (historicalPeriods.length === 0) {
    const modelStartDate = new Date(state.company.startDate);
    
    // Process debt allocations before or on model start
    state.debt.forEach((d) => {
      const debtDate = new Date(d.startDate);
      if (debtDate <= modelStartDate) {
        const principal = d.principal || 0;
        if (d.useOfProceeds === 'cash' || d.useOfProceeds === 'operations') {
          previousCash += principal;
        } else if (d.useOfProceeds === 'capex') {
          previousPPE += principal;
        } else if (d.useOfProceeds === 'workingCapital') {
          // Split working capital between AR and Inventory (simplified)
          previousAR += principal * 0.5;
          previousInventory += principal * 0.5;
        }
      }
    });
    
    // Process equity allocations before or on model start
    state.equity.forEach((e) => {
      const equityDate = new Date(e.date);
      if (equityDate <= modelStartDate) {
        const amount = e.amount || 0;
        const useOfProceeds = e.useOfProceeds || 'cash';
        if (useOfProceeds === 'cash' || useOfProceeds === 'operations') {
          previousCash += amount;
        } else if (useOfProceeds === 'capex') {
          previousPPE += amount;
        } else if (useOfProceeds === 'workingCapital') {
          // Split working capital between AR and Inventory (simplified)
          previousAR += amount * 0.5;
          previousInventory += amount * 0.5;
        }
      }
    });
  }
  
  // Initialize liabilities and equity
  let previousDebt = 0;
  let previousEquity = 0;
  let previousRetainedEarnings = 0;
  
  // If no historical data, initialize debt and equity from before model start
  if (historicalPeriods.length === 0) {
    const modelStartDate = new Date(state.company.startDate);
    
    // Sum debt that started before or on model start
    state.debt.forEach((d) => {
      const debtStartDate = new Date(d.startDate);
      if (debtStartDate <= modelStartDate) {
        previousDebt += d.principal || 0;
        // If debt was raised before or on start, it should have increased cash already counted above
      }
    });
    
    // Sum equity that was contributed before or on model start
    state.equity.forEach((e) => {
      const equityDate = new Date(e.date);
      if (equityDate <= modelStartDate) {
        previousEquity += e.amount;
        // If equity was raised before or on start, it should have increased cash already counted above
      }
    });
  }

  // Track debt-funded capex additions dynamically across periods
  const debtFundedCapex: CapexDriver[] = [];
  
  // Track individual loan balances for proper interest calculation
  interface LoanBalance {
    index: number;
    balance: number;
    ratePct: number;
    tenorYears: number;
    amort: 'annuity' | 'bullet';
    startPeriod: number;
  }
  const loanBalances: LoanBalance[] = [];
  
  // Process historical periods first
  state.historicalData.forEach((histData) => {
    const period = historicalPeriods.find(p => p.label === histData.period);
    if (!period) return;

    // Calculate PPE and depreciation from detailed entries
    const ppeGross = (histData.ppe || []).reduce((sum, item) => sum + item.grossValue, 0);
    const ppeAccDep = (histData.ppe || []).reduce((sum, item) => sum + item.accumulatedDepreciation, 0);
    const ppeNet = ppeGross - ppeAccDep;
    
    // Calculate depreciation for this period (difference in accumulated depreciation)
    const depreciation = ppeAccDep - previousAccDep;

    const revenue = histData.revenue;
    const cogs = histData.cogs;
    const grossProfit = revenue - cogs;
    const opex = histData.opex;
    const ebitda = grossProfit - opex;
    const ebit = ebitda - depreciation;
    
    // Calculate interest from loan details if available
    const interest = (histData.loans || []).reduce((sum, loan) => {
      return sum + (loan.principal * loan.interestRatePct / 100 / 12); // Monthly interest
    }, 0);
    
    const ebt = ebit - interest;
    const tax = Math.max(0, ebt * (state.tax.ratePct / 100));
    const netIncome = ebt - tax;

    incomeStatements.push({
      revenue,
      cogs,
      grossProfit,
      opex,
      ebitda,
      depreciation,
      ebit,
      interest,
      ebt,
      tax,
      netIncome,
    });

    const accountsReceivable = histData.ar;
    const inventory = histData.inventory;
    const accountsPayable = histData.ap;
    const cash = histData.cash;
    const debt = histData.debt;

    const changeInAR = accountsReceivable - previousAR;
    const changeInInventory = inventory - previousInventory;
    const changeInAP = accountsPayable - previousAP;

    const cfo = netIncome + depreciation - changeInAR - changeInInventory + changeInAP;
    const cfi = -histData.capex;
    const cff = 0;
    const netCashFlow = cfo + cfi + cff;
    const endingCash = cash;

    cashFlowStatements.push({
      netIncome,
      depreciation,
      changeInAR: -changeInAR,
      changeInInventory: -changeInInventory,
      changeInAP,
      cfo,
      capex: -histData.capex,
      totalPPEAdditions: histData.capex, // For historical data, capex is the total PPE addition
      cfi,
      debtDrawdown: 0,
      debtRepayment: 0,
      equityInjection: 0,
      cff,
      netCashFlow,
      beginningCash: previousCash,
      endingCash,
    });

    const currentAssets = cash + accountsReceivable + inventory;
    const ppe = ppeGross;
    const accumulatedDepreciation = ppeAccDep;
    const netPPE = ppeNet;
    const totalAssets = currentAssets + netPPE;
    const currentLiabilities = accountsPayable;
    const totalLiabilities = currentLiabilities + debt;
    const retainedEarnings = previousRetainedEarnings + netIncome;
    const equity = histData.equity || 0;
    const totalEquity = equity + retainedEarnings;

    balanceSheets.push({
      cash,
      accountsReceivable,
      inventory,
      currentAssets,
      ppe,
      accumulatedDepreciation,
      netPPE,
      totalAssets,
      accountsPayable,
      currentLiabilities,
      debt,
      totalLiabilities,
      equity,
      retainedEarnings,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    });

    previousCash = endingCash;
    previousAR = accountsReceivable;
    previousInventory = inventory;
    previousAP = accountsPayable;
    previousDebt = debt;
    previousRetainedEarnings = retainedEarnings;
    previousPPE = ppe;
    previousAccDep = accumulatedDepreciation;
  });
  
  // Process forecast periods
  forecastPeriods.forEach((period, index) => {
    // Establish model calendar context for this period
    const monthsPerPeriod = state.frequency === 'Monthly' ? 1 : 3;
    const modelStart = new Date(state.company.startDate);
    const histOffset = historicalPeriods.length; // number of periods before forecasts start
    const addMonths = (date: Date, months: number) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return d;
    };
    const globalIndex = histOffset + index; // index across all periods
    const periodStart = addMonths(modelStart, globalIndex * monthsPerPeriod);
    const periodEnd = addMonths(modelStart, (globalIndex + 1) * monthsPerPeriod); // exclusive

    // 1) Financing activities first (to ensure correct interest + depreciation scope)
    let totalDebtDrawdown = 0;
    let capexFundedByDebt = 0; // proceeds used to purchase PPE (investing)

    state.debt.forEach((d, idx) => {
      const start = new Date(d.startDate);
      const isDrawThisPeriod = start >= periodStart && start < periodEnd;
      if (isDrawThisPeriod) {
        const drawAmt = d.principal || 0;
        totalDebtDrawdown += drawAmt;

        // Track loan balance for interest calc
        loanBalances.push({
          index: idx,
          balance: drawAmt,
          ratePct: d.ratePct,
          tenorYears: d.tenorYears,
          amort: d.amort,
          startPeriod: globalIndex,
        });

        if (d.useOfProceeds === 'capex') {
          capexFundedByDebt += drawAmt;
          if (typeof d.capexItemIndex === 'number' && state.capex[d.capexItemIndex]) {
            const baseItem = state.capex[d.capexItemIndex];
            debtFundedCapex.push({
              assetClass: `${baseItem.assetClass} (Debt-funded)`,
              amount: drawAmt,
              year: period.year,
              lifeYears: baseItem.lifeYears,
              method: baseItem.method,
            });
          } else {
            debtFundedCapex.push({
              assetClass: 'Debt-funded asset',
              amount: drawAmt,
              year: period.year,
              lifeYears: 5,
              method: 'SL',
            });
          }
        }
      }
    });
    const debtDrawdown = totalDebtDrawdown;

    // Equity injections with allocations
    let equityInjection = 0;
    let equityFundedCapex = 0;
    state.equity.forEach((e) => {
      const equityDate = new Date(e.date);
      const isInjectionThisPeriod = equityDate >= periodStart && equityDate < periodEnd;
      if (isInjectionThisPeriod) {
        const amount = e.amount || 0;
        equityInjection += amount;
        
        // Handle equity allocated to capex
        const useOfProceeds = e.useOfProceeds || 'cash';
        if (useOfProceeds === 'capex') {
          equityFundedCapex += amount;
          if (typeof e.capexItemIndex === 'number' && state.capex[e.capexItemIndex]) {
            const baseItem = state.capex[e.capexItemIndex];
            debtFundedCapex.push({
              assetClass: `${baseItem.assetClass} (Equity-funded)`,
              amount: amount,
              year: period.year,
              lifeYears: baseItem.lifeYears,
              method: baseItem.method,
            });
          } else {
            debtFundedCapex.push({
              assetClass: 'Equity-funded asset',
              amount: amount,
              year: period.year,
              lifeYears: 5,
              method: 'SL',
            });
          }
        }
      }
    });

    // 2) Operating drivers
    const revenue = calculateRevenue(state.revenue, period, state.activeScenario);
    const cogs = calculateCOGS(revenue, state.cogs, state.revenue, period, state.activeScenario);
    const opex = calculateOpex(revenue, state.opex);

    // Working capital balances for this period (derived from revenue/COGS)
    const accountsReceivable = (revenue * state.workingCapital.DSO) / (state.frequency === 'Monthly' ? 30 : 90);
    const inventory = (cogs * state.workingCapital.DIO) / (state.frequency === 'Monthly' ? 30 : 90);
    const accountsPayable = (cogs * state.workingCapital.DPO) / (state.frequency === 'Monthly' ? 30 : 90);

    // 3) Investing activities: determine capex this period
    // IMPORTANT: Base capex should only be added in the first period of the year it's scheduled
    // to avoid adding the same capex multiple times in monthly mode.
    // Debt-funded capex is added in the specific period when debt is drawn (handled above).
    const isFirstPeriodOfYear = state.frequency === 'Monthly' ? period.period === 1 : period.period === 1;
    const capexBaseThisPeriod = isFirstPeriodOfYear 
      ? state.capex
          .filter(c => c.year === period.year)
          .reduce((sum, c) => sum + c.amount, 0)
      : 0;

    // Total PPE Additions = Base Capex (first period only) + Debt-funded Capex (when drawn) + Equity-funded Capex
    // Note: capexFundedByDebt and equityFundedCapex were calculated in the financing section above
    const totalPPEAdditions = capexBaseThisPeriod + capexFundedByDebt + equityFundedCapex;

    // 4) Recompute depreciation AFTER financing-driven capex is known
    const depreciation = calculateDepreciation([...state.capex, ...debtFundedCapex], period.year, period.period, state.frequency);

    // 5) Interest now that loan balances include any draws this period
    const interest = calculateInterestFromBalances(loanBalances, state.frequency);

    // 6) Income statement now that all pieces are final
    const grossProfit = revenue - cogs;
    const ebitda = grossProfit - opex;
    const ebit = ebitda - depreciation;
    const ebt = ebit - interest;
    const tax = Math.max(0, ebt * (state.tax.ratePct / 100));
    const netIncome = ebt - tax;

    incomeStatements.push({
      revenue,
      cogs,
      grossProfit,
      opex,
      ebitda,
      depreciation,
      ebit,
      interest,
      ebt,
      tax,
      netIncome,
    });

    // 7) Cash Flow Statement
    const changeInAR = accountsReceivable - previousAR;
    const changeInInventory = inventory - previousInventory;
    const changeInAP = accountsPayable - previousAP;

    // CFO: Operating activities only
    const cfo = netIncome + depreciation - changeInAR - changeInInventory + changeInAP;

    // CFI: Only cash-paid capex reduces cash
    // ACCOUNTING PRINCIPLE: Debt/equity-funded capex are non-cash transactions
    const cfi = -capexBaseThisPeriod;

    // Debt repayment and balance updates
    const debtRepayment = calculateDebtRepaymentAndUpdateBalances(
      loanBalances,
      globalIndex,
      state.frequency
    );

    // CFF: Financing activities (debt and equity)
    // ACCOUNTING PRINCIPLE: Only cash-generating equity injections increase cash
    // Equity allocated to capex is a non-cash transaction (increases both PPE and Equity without affecting cash)
    const equityInjectionCash = equityInjection - equityFundedCapex;
    const debtDrawdownCash = debtDrawdown - capexFundedByDebt;
    const cff = debtDrawdownCash - debtRepayment + equityInjectionCash;

    const netCashFlow = cfo + cfi + cff;
    const endingCash = previousCash + netCashFlow;

    cashFlowStatements.push({
      netIncome,
      depreciation,
      changeInAR: -changeInAR,
      changeInInventory: -changeInInventory,
      changeInAP,
      cfo,
      capex: -capexBaseThisPeriod, // Only cash-paid capex
      totalPPEAdditions, // For PPE reconciliation: includes all capex (cash + non-cash)
      cfi,
      debtDrawdown: debtDrawdownCash, // Only cash-generating debt
      debtRepayment: -debtRepayment,
      equityInjection: equityInjectionCash, // Only cash-generating equity
      cff,
      netCashFlow,
      beginningCash: previousCash,
      endingCash,
    });

    // 8) Balance Sheet
    // PPE Rollforward: Beginning Gross PPE + Additions = Ending Gross PPE
    const ppe = previousPPE + totalPPEAdditions;
    // Accumulated Depreciation Rollforward: Beginning + Period Depreciation = Ending
    const accumulatedDepreciation = previousAccDep + depreciation;
    // Net PPE = Gross PPE - Accumulated Depreciation (this goes to Total Assets)
    const netPPE = ppe - accumulatedDepreciation;

    const currentAssets = endingCash + accountsReceivable + inventory;
    const totalAssets = currentAssets + netPPE;

    const currentLiabilities = accountsPayable;
    const debt = previousDebt + debtDrawdown - debtRepayment;
    const totalLiabilities = currentLiabilities + debt;

    // Equity Rollforward: Beginning Equity + Injections = Ending Equity
    const equity = previousEquity + equityInjection; // Paid-in capital
    // Retained Earnings Rollforward: Beginning RE + Net Income - Dividends = Ending RE
    const retainedEarnings = previousRetainedEarnings + netIncome; // No dividends modeled
    // Total Equity = Paid-in Capital + Retained Earnings
    const totalEquity = equity + retainedEarnings;

    balanceSheets.push({
      cash: endingCash,
      accountsReceivable,
      inventory,
      currentAssets,
      ppe,
      accumulatedDepreciation,
      netPPE,
      totalAssets,
      accountsPayable,
      currentLiabilities,
      debt,
      totalLiabilities,
      equity,
      retainedEarnings,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    });

    // 9) Carry forward
    previousCash = endingCash;
    previousAR = accountsReceivable;
    previousInventory = inventory;
    previousPPE = ppe;
    previousAccDep = accumulatedDepreciation;
    previousAP = accountsPayable;
    previousDebt = debt;
    previousEquity = equity;
    previousRetainedEarnings = retainedEarnings;
  });
  
  // Calculate depreciation schedule
  const depreciationSchedule = calculateDepreciationSchedule([...state.capex, ...debtFundedCapex]);
  
  // Calculate liquidity ratios
  const liquidityRatios = balanceSheets.map((bs) => ({
    currentRatio: bs.currentLiabilities > 0 ? bs.currentAssets / bs.currentLiabilities : 0,
    quickRatio: bs.currentLiabilities > 0 ? (bs.cash + bs.accountsReceivable) / bs.currentLiabilities : 0,
    cashRatio: bs.currentLiabilities > 0 ? bs.cash / bs.currentLiabilities : 0,
    workingCapital: bs.currentAssets - bs.currentLiabilities,
  }));
  
  // Calculate break-even analysis
  const breakEvenAnalysis = incomeStatements.map((is, i) => {
    const revenue = is.revenue;
    const variableCosts = is.cogs;
    const fixedCosts = is.opex;
    const contributionMargin = revenue - variableCosts;
    const contributionMarginPct = revenue > 0 ? (contributionMargin / revenue) * 100 : 0;
    const breakEvenRevenue = contributionMarginPct > 0 ? (fixedCosts / contributionMarginPct) * 100 : 0;
    
    // Calculate average price per unit from revenue drivers
    let avgPrice = 0;
    let totalUnits = 0;
    if (state.revenue.length > 0) {
      const period = allPeriods[i];
      state.revenue.forEach(driver => {
        const yearIndex = period.year - 1;
        const growthRate = driver.growthRates?.[yearIndex] || 0;
        const units = driver.volumeStart * Math.pow(1 + growthRate / 100, yearIndex);
        totalUnits += units;
        avgPrice += driver.price * units;
      });
      if (totalUnits > 0) avgPrice = avgPrice / totalUnits;
    }
    
    const breakEvenUnits = avgPrice > 0 ? breakEvenRevenue / avgPrice : 0;
    const marginOfSafety = revenue - breakEvenRevenue;
    const marginOfSafetyPct = revenue > 0 ? (marginOfSafety / revenue) * 100 : 0;
    
    return {
      revenue,
      fixedCosts,
      variableCosts,
      contributionMargin,
      contributionMarginPct,
      breakEvenRevenue,
      breakEvenUnits,
      marginOfSafety,
      marginOfSafetyPct,
    };
  });

  // Add annual totals for monthly data
  if (state.frequency === 'Monthly') {
    const { 
      periods: periodsWithAnnuals, 
      incomeStatement: isWithAnnuals, 
      balanceSheet: bsWithAnnuals,
      cashFlowStatement: cfWithAnnuals,
      liquidityRatios: lrWithAnnuals,
      breakEvenAnalysis: beWithAnnuals
    } = addAnnualTotals(
      allPeriods, 
      incomeStatements, 
      balanceSheets, 
      cashFlowStatements,
      liquidityRatios,
      breakEvenAnalysis
    );

    return {
      periods: periodsWithAnnuals,
      incomeStatement: isWithAnnuals,
      balanceSheet: bsWithAnnuals,
      cashFlowStatement: cfWithAnnuals,
      depreciationSchedule,
      liquidityRatios: lrWithAnnuals,
      breakEvenAnalysis: beWithAnnuals,
      frequency: state.frequency,
    };
  }

  return {
    periods: allPeriods,
    incomeStatement: incomeStatements,
    balanceSheet: balanceSheets,
    cashFlowStatement: cashFlowStatements,
    depreciationSchedule,
    liquidityRatios,
    breakEvenAnalysis,
    frequency: state.frequency,
  };
}

function generateHistoricalPeriods(historicalData: any[]): Period[] {
  return historicalData
    .map(d => d.period)
    .sort()
    .map((period, index) => {
      const [year, month] = period.split('-').map(Number);
      return {
        year,
        period: month,
        label: period,
      };
    });
}

function generatePeriods(horizonYears: number, frequency: 'Monthly' | 'Quarterly'): Period[] {
  const periods: Period[] = [];
  const periodsPerYear = frequency === 'Monthly' ? 12 : 4;
  
  for (let year = 1; year <= horizonYears; year++) {
    for (let period = 1; period <= periodsPerYear; period++) {
      periods.push({
        year,
        period,
        label: frequency === 'Monthly' ? `Y${year}M${period}` : `Y${year}Q${period}`,
      });
    }
  }
  
  return periods;
}

function calculateRevenue(drivers: any[], period: Period, scenario: string): number {
  if (drivers.length === 0) return 0;
  
  const scenarioMultiplier = scenario === 'Best' ? 1.2 : scenario === 'Worst' ? 0.8 : 1.0;
  
  return drivers.reduce((total, driver) => {
    const yearIndex = period.year - 1;
    const growthRate = driver.growthRates?.[yearIndex] || 0;
    const volume = driver.volumeStart * Math.pow(1 + growthRate / 100, yearIndex);
    return total + (driver.price * volume * scenarioMultiplier);
  }, 0);
}

function calculateTotalVolume(drivers: any[], period: Period, scenario: string): number {
  if (drivers.length === 0) return 0;
  
  const scenarioMultiplier = scenario === 'Best' ? 1.2 : scenario === 'Worst' ? 0.8 : 1.0;
  
  return drivers.reduce((total, driver) => {
    const yearIndex = period.year - 1;
    const growthRate = driver.growthRates?.[yearIndex] || 0;
    const volume = driver.volumeStart * Math.pow(1 + growthRate / 100, yearIndex);
    return total + (volume * scenarioMultiplier);
  }, 0);
}

function calculateCOGS(revenue: number, driver: any, revenueDrivers: any[], period: Period, scenario: string): number {
  if (driver.method === 'percentOfRevenue') {
    return revenue * ((driver.percentOfRevenue || 0) / 100);
  } else if (driver.method === 'unitCost') {
    // Check if we have per-segment unit costs
    if (driver.unitCosts && Object.keys(driver.unitCosts).length > 0) {
      // Calculate COGS per segment and sum
      const scenarioMultiplier = scenario === 'Best' ? 1.2 : scenario === 'Worst' ? 0.8 : 1.0;
      return revenueDrivers.reduce((total, revDriver) => {
        const yearIndex = period.year - 1;
        const growthRate = revDriver.growthRates?.[yearIndex] || 0;
        const volume = revDriver.volumeStart * Math.pow(1 + growthRate / 100, yearIndex) * scenarioMultiplier;
        const unitCost = driver.unitCosts[revDriver.segment] || 0;
        return total + (volume * unitCost);
      }, 0);
    } else {
      // Legacy: single unit cost for all segments
      const totalVolume = calculateTotalVolume(revenueDrivers, period, scenario);
      return totalVolume * (driver.unitCost || 0);
    }
  }
  return 0;
}

function calculateOpex(revenue: number, drivers: any[]): number {
  return drivers.reduce((total, driver) => {
    if (driver.basis === 'percentOfRevenue') {
      return total + (revenue * (driver.value / 100));
    }
    return total + driver.value;
  }, 0);
}

/**
 * Calculate depreciation expense for a given period
 * 
 * Accounting Principle: Depreciation allocates the cost of long-lived assets over their useful lives
 * Formula: Annual Depreciation = Asset Cost / Useful Life
 * Monthly Depreciation = Annual Depreciation / 12
 * 
 * @param capexDrivers - Array of all capital expenditures (including debt-funded)
 * @param year - Current forecast year
 * @param period - Current period within the year (1-12 for monthly, 1-4 for quarterly)
 * @param frequency - Monthly or Quarterly
 * @returns Depreciation expense for the period
 */
function calculateDepreciation(
  capexDrivers: any[], 
  year: number,
  period: number,
  frequency: 'Monthly' | 'Quarterly' = 'Monthly'
): number {
  const periodsPerYear = frequency === 'Monthly' ? 12 : 4;
  return capexDrivers
    .filter(c => {
      // Asset must be purchased before or in current year
      if (c.year > year) return false;
      
      // Calculate total periods elapsed since asset purchase
      // Assume assets are purchased in period 1 of their purchase year
      const periodsElapsed = (year - c.year) * periodsPerYear + (period - 1);
      const totalUsefulLifePeriods = c.lifeYears * periodsPerYear;
      
      // Asset must still have useful life remaining at period level
      if (periodsElapsed >= totalUsefulLifePeriods) return false;
      
      // For assets purchased in the current year, only depreciate if purchased in this period or earlier
      // Base capex is assumed to be purchased in period 1 of the year
      if (c.year === year && period < 1) return false;
      
      return true;
    })
    .reduce((total, c) => {
      if (c.method === 'SL') {
        // Straight-line depreciation: Asset cost / Useful life / Periods per year
        return total + (c.amount / c.lifeYears / periodsPerYear);
      }
      return total;
    }, 0);
}

function calculateInterestFromBalances(
  loanBalances: Array<{ balance: number; ratePct: number }>,
  frequency: 'Monthly' | 'Quarterly'
): number {
  const periodsPerYear = frequency === 'Monthly' ? 12 : 4;
  return loanBalances.reduce((total, loan) => {
    return total + (loan.balance * (loan.ratePct / 100) / periodsPerYear);
  }, 0);
}

function calculateDebtRepaymentAndUpdateBalances(
  loanBalances: Array<{
    index: number;
    balance: number;
    ratePct: number;
    tenorYears: number;
    amort: 'annuity' | 'bullet';
    startPeriod: number;
  }>,
  currentPeriod: number,
  frequency: 'Monthly' | 'Quarterly'
): number {
  const periodsPerYear = frequency === 'Monthly' ? 12 : 4;
  let totalRepayment = 0;

  // Update each loan's balance
  for (let i = loanBalances.length - 1; i >= 0; i--) {
    const loan = loanBalances[i];
    const periodsElapsed = currentPeriod - loan.startPeriod;
    const totalPeriods = loan.tenorYears * periodsPerYear;

    if (loan.amort === 'annuity' && periodsElapsed >= 0 && periodsElapsed < totalPeriods) {
      // Annuity: equal payments each period
      const periodPayment = loan.balance / (totalPeriods - periodsElapsed);
      totalRepayment += periodPayment;
      loan.balance -= periodPayment;

      // Remove loan if fully repaid
      if (loan.balance <= 0.01) {
        loanBalances.splice(i, 1);
      }
    } else if (loan.amort === 'bullet' && periodsElapsed === totalPeriods - 1) {
      // Bullet: full repayment at maturity
      totalRepayment += loan.balance;
      loanBalances.splice(i, 1);
    }
  }

  return totalRepayment;
}

function addAnnualTotals(
  periods: Period[],
  incomeStatements: IncomeStatement[],
  balanceSheets: BalanceSheet[],
  cashFlowStatements: CashFlowStatement[],
  liquidityRatios: LiquidityRatios[],
  breakEvenAnalysis: BreakEvenAnalysis[]
) {
  const newPeriods: Period[] = [];
  const newIS: IncomeStatement[] = [];
  const newBS: BalanceSheet[] = [];
  const newCF: CashFlowStatement[] = [];
  const newLR: LiquidityRatios[] = [];
  const newBE: BreakEvenAnalysis[] = [];

  // Group periods by year
  const periodsByYear = new Map<number, number[]>();
  periods.forEach((period, index) => {
    if (!periodsByYear.has(period.year)) {
      periodsByYear.set(period.year, []);
    }
    periodsByYear.get(period.year)!.push(index);
  });

  // Add periods and annual totals year by year
  Array.from(periodsByYear.keys()).sort((a, b) => a - b).forEach(year => {
    const indices = periodsByYear.get(year)!;
    
    // Add all monthly periods for this year
    indices.forEach(idx => {
      newPeriods.push(periods[idx]);
      newIS.push(incomeStatements[idx]);
      newBS.push(balanceSheets[idx]);
      newCF.push(cashFlowStatements[idx]);
      newLR.push(liquidityRatios[idx]);
      newBE.push(breakEvenAnalysis[idx]);
    });

    // Add annual total
    newPeriods.push({
      year,
      period: 0,
      label: `Y${year} Total`,
      isAnnualTotal: true,
    });

    // Sum income statement items
    const isTotal: IncomeStatement = {
      revenue: indices.reduce((sum, idx) => sum + incomeStatements[idx].revenue, 0),
      cogs: indices.reduce((sum, idx) => sum + incomeStatements[idx].cogs, 0),
      grossProfit: indices.reduce((sum, idx) => sum + incomeStatements[idx].grossProfit, 0),
      opex: indices.reduce((sum, idx) => sum + incomeStatements[idx].opex, 0),
      ebitda: indices.reduce((sum, idx) => sum + incomeStatements[idx].ebitda, 0),
      depreciation: indices.reduce((sum, idx) => sum + incomeStatements[idx].depreciation, 0),
      ebit: indices.reduce((sum, idx) => sum + incomeStatements[idx].ebit, 0),
      interest: indices.reduce((sum, idx) => sum + incomeStatements[idx].interest, 0),
      ebt: indices.reduce((sum, idx) => sum + incomeStatements[idx].ebt, 0),
      tax: indices.reduce((sum, idx) => sum + incomeStatements[idx].tax, 0),
      netIncome: indices.reduce((sum, idx) => sum + incomeStatements[idx].netIncome, 0),
    };
    newIS.push(isTotal);

    // Use last period's balance sheet (point in time, not sum)
    const lastIdx = indices[indices.length - 1];
    newBS.push(balanceSheets[lastIdx]);

    // Sum cash flow items
    const cfTotal: CashFlowStatement = {
      netIncome: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].netIncome, 0),
      depreciation: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].depreciation, 0),
      changeInAR: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].changeInAR, 0),
      changeInInventory: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].changeInInventory, 0),
      changeInAP: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].changeInAP, 0),
      cfo: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].cfo, 0),
      capex: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].capex, 0),
      totalPPEAdditions: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].totalPPEAdditions, 0),
      cfi: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].cfi, 0),
      debtDrawdown: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].debtDrawdown, 0),
      debtRepayment: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].debtRepayment, 0),
      equityInjection: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].equityInjection, 0),
      cff: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].cff, 0),
      netCashFlow: indices.reduce((sum, idx) => sum + cashFlowStatements[idx].netCashFlow, 0),
      beginningCash: cashFlowStatements[indices[0]].beginningCash,
      endingCash: cashFlowStatements[lastIdx].endingCash,
    };
    newCF.push(cfTotal);

    // Use last period's ratios (point in time)
    newLR.push(liquidityRatios[lastIdx]);

    // Average break-even analysis
    const beTotal: BreakEvenAnalysis = {
      revenue: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].revenue, 0),
      fixedCosts: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].fixedCosts, 0),
      variableCosts: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].variableCosts, 0),
      contributionMargin: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].contributionMargin, 0),
      contributionMarginPct: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].contributionMarginPct, 0) / indices.length,
      breakEvenRevenue: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].breakEvenRevenue, 0) / indices.length,
      breakEvenUnits: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].breakEvenUnits, 0),
      marginOfSafety: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].marginOfSafety, 0),
      marginOfSafetyPct: indices.reduce((sum, idx) => sum + breakEvenAnalysis[idx].marginOfSafetyPct, 0) / indices.length,
    };
    newBE.push(beTotal);
  });

  return {
    periods: newPeriods,
    incomeStatement: newIS,
    balanceSheet: newBS,
    cashFlowStatement: newCF,
    liquidityRatios: newLR,
    breakEvenAnalysis: newBE,
  };
}

function calculateDepreciationSchedule(capexDrivers: any[]): DepreciationSchedule[] {
  const schedule: DepreciationSchedule[] = [];
  
  capexDrivers.forEach((capex) => {
    for (let year = capex.year; year < capex.year + capex.lifeYears; year++) {
      const yearsSinceAcquisition = year - capex.year;
      const beginningValue = capex.amount - (capex.amount / capex.lifeYears) * yearsSinceAcquisition;
      const depreciation = capex.method === 'SL' ? capex.amount / capex.lifeYears : 0;
      const endingValue = beginningValue - depreciation;
      
      schedule.push({
        assetName: `${capex.assetClass || 'Asset'} (Y${capex.year})`,
        year,
        amount: capex.amount,
        lifeYears: capex.lifeYears,
        method: capex.method,
        beginningValue,
        depreciation,
        endingValue,
      });
    }
  });
  
  return schedule.sort((a, b) => a.year - b.year || a.assetName.localeCompare(b.assetName));
}

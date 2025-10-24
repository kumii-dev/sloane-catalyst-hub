import { create } from 'zustand';

export type Standard = 'IFRS' | 'GAAP';
export type Scenario = 'Base' | 'Best' | 'Worst';
export type Frequency = 'Monthly' | 'Quarterly';

export interface CompanyProfile {
  name: string;
  industry: string;
  currency: string;
  startDate: string;
  horizonYears: number;
  hasHistoricalData: boolean;
  historicalYears: number;
  historicalStartDate: string;
  startingCash?: number;
  startingEquity?: number;
}

export interface PPELineItem {
  assetClass: string;
  grossValue: number;
  accumulatedDepreciation: number;
  lifeYears: number;
  method: 'SL' | 'DDB';
}

export interface LoanLineItem {
  loanName: string;
  principal: number;
  interestRatePct: number;
  tenorYears: number;
  amortization: 'annuity' | 'bullet';
  startDate: string;
}

export interface HistoricalDataPoint {
  period: string;
  revenue: number;
  cogs: number;
  opex: number;
  capex: number;
  cash: number;
  ar: number;
  inventory: number;
  ppe: PPELineItem[];
  ap: number;
  debt: number;
  loans: LoanLineItem[];
  equity: number;
}

export interface MonthlyAssumption {
  month: number;
  year: number;
  revenueGrowthPct: number;
  cogsMarginPct: number;
  opexAmount: number;
  capexAmount: number;
}

export interface RevenueDriver {
  segment: string;
  price: number;
  volumeStart: number;
  growthRates: number[];
  recognition: 'point-in-time' | 'over-time';
}

export interface COGSDriver {
  method: 'percentOfRevenue' | 'unitCost';
  percentOfRevenue?: number;
  unitCost?: number;
  unitCosts?: Record<string, number>;
  inventoryMethod: 'FIFO' | 'WeightedAverage';
}

export interface OpexDriver {
  name: string;
  basis: 'percentOfRevenue' | 'fixed';
  value: number;
}

export interface CapexDriver {
  assetClass: string;
  amount: number;
  year: number;
  lifeYears: number;
  method: 'SL' | 'DDB';
}

export interface WorkingCapitalDriver {
  DSO: number;
  DIO: number;
  DPO: number;
}

export interface DebtDriver {
  type: string;
  principal: number;
  ratePct: number;
  tenorYears: number;
  amort: 'annuity' | 'bullet';
  startDate: string;
  useOfProceeds: 'cash' | 'capex' | 'workingCapital' | 'operations';
  capexItemIndex?: number;
}

export interface EquityDriver {
  type: string;
  amount: number;
  date: string;
  useOfProceeds: 'cash' | 'capex' | 'workingCapital' | 'operations';
  capexItemIndex?: number;
}

export interface AssetDriver {
  type: string;
  amount: number;
  date: string;
}

export interface TaxDriver {
  ratePct: number;
  NOL: number;
}

export interface ScenarioDrivers {
  Base: {
    revenueGrowthMultiplier: number;
    cogsMultiplier: number;
    opexMultiplier: number;
  };
  Best: {
    revenueGrowthMultiplier: number;
    cogsMultiplier: number;
    opexMultiplier: number;
  };
  Worst: {
    revenueGrowthMultiplier: number;
    cogsMultiplier: number;
    opexMultiplier: number;
  };
}

export interface SensitivityDriver {
  name: string;
  variable1: string;
  variable1Range: number[];
  variable2: string;
  variable2Range: number[];
  outputMetric: string;
}

export interface ModelState {
  standard: Standard;
  activeScenario: Scenario;
  frequency: Frequency;
  company: CompanyProfile;
  revenue: RevenueDriver[];
  cogs: COGSDriver;
  opex: OpexDriver[];
  capex: CapexDriver[];
  workingCapital: WorkingCapitalDriver;
  debt: DebtDriver[];
  equity: EquityDriver[];
  assets: AssetDriver[];
  tax: TaxDriver;
  historicalData: HistoricalDataPoint[];
  monthlyAssumptions: MonthlyAssumption[];
  useHistoricalForAssumptions: boolean;
  currentModelId?: string;
  scenarioDrivers: ScenarioDrivers;
  sensitivityAnalysis: SensitivityDriver[];
  
  setStandard: (standard: Standard) => void;
  setActiveScenario: (scenario: Scenario) => void;
  setCompany: (company: Partial<CompanyProfile>) => void;
  setRevenue: (revenue: RevenueDriver[]) => void;
  setCOGS: (cogs: COGSDriver) => void;
  setOpex: (opex: OpexDriver[]) => void;
  setCapex: (capex: CapexDriver[]) => void;
  setWorkingCapital: (wc: WorkingCapitalDriver) => void;
  setDebt: (debt: DebtDriver[]) => void;
  setEquity: (equity: EquityDriver[]) => void;
  setAssets: (assets: AssetDriver[]) => void;
  setTax: (tax: TaxDriver) => void;
  setHistoricalData: (data: HistoricalDataPoint[]) => void;
  setMonthlyAssumptions: (assumptions: MonthlyAssumption[]) => void;
  setUseHistoricalForAssumptions: (use: boolean) => void;
  loadModelState: (state: Partial<ModelState>) => void;
  setCurrentModelId: (id?: string) => void;
  setScenarioDrivers: (drivers: ScenarioDrivers) => void;
  setSensitivityAnalysis: (analysis: SensitivityDriver[]) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  standard: 'IFRS',
  activeScenario: 'Base',
  frequency: 'Monthly',
  company: {
    name: '',
    industry: '',
    currency: 'ZAR',
    startDate: new Date().toISOString().split('T')[0],
    horizonYears: 5,
    hasHistoricalData: false,
    historicalYears: 0,
    historicalStartDate: '',
  },
  revenue: [],
  cogs: {
    method: 'percentOfRevenue',
    percentOfRevenue: 0,
    unitCosts: {},
    inventoryMethod: 'FIFO',
  },
  opex: [],
  capex: [],
  workingCapital: {
    DSO: 0,
    DIO: 0,
    DPO: 0,
  },
  debt: [],
  equity: [],
  assets: [],
  tax: {
    ratePct: 0,
    NOL: 0,
  },
  historicalData: [],
  monthlyAssumptions: [],
  useHistoricalForAssumptions: false,
  currentModelId: undefined,
  scenarioDrivers: {
    Base: {
      revenueGrowthMultiplier: 1.0,
      cogsMultiplier: 1.0,
      opexMultiplier: 1.0,
    },
    Best: {
      revenueGrowthMultiplier: 1.2,
      cogsMultiplier: 0.9,
      opexMultiplier: 0.85,
    },
    Worst: {
      revenueGrowthMultiplier: 0.8,
      cogsMultiplier: 1.1,
      opexMultiplier: 1.15,
    },
  },
  sensitivityAnalysis: [],
  
  setStandard: (standard) => set({ standard }),
  setActiveScenario: (activeScenario) => set({ activeScenario }),
  setCompany: (company) => set((state) => ({ company: { ...state.company, ...company } })),
  setRevenue: (revenue) => set({ revenue }),
  setCOGS: (cogs) => set({ cogs }),
  setOpex: (opex) => set({ opex }),
  setCapex: (capex) => set({ capex }),
  setWorkingCapital: (workingCapital) => set({ workingCapital }),
  setDebt: (debt) => set({ debt }),
  setEquity: (equity) => set({ equity }),
  setAssets: (assets) => set({ assets }),
  setTax: (tax) => set({ tax }),
  setHistoricalData: (historicalData) => set({ historicalData }),
  setMonthlyAssumptions: (monthlyAssumptions) => set({ monthlyAssumptions }),
  setUseHistoricalForAssumptions: (useHistoricalForAssumptions) => set({ useHistoricalForAssumptions }),
  loadModelState: (state) => set((current) => ({
    ...current,
    ...state,
  })),
  setCurrentModelId: (currentModelId) => set({ currentModelId }),
  setScenarioDrivers: (scenarioDrivers) => set({ scenarioDrivers }),
  setSensitivityAnalysis: (sensitivityAnalysis) => set({ sensitivityAnalysis }),
}));

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { Period } from "@/lib/modelEngine";

interface FinancialTableProps {
  data: any[];
  periods: Period[];
  type: 'income-statement' | 'balance-sheet' | 'cash-flow' | 'depreciation' | 'ratios';
  currency: string;
}

export function FinancialTable({ data, periods, type, currency }: FinancialTableProps) {
  const renderRows = () => {
    switch (type) {
      case 'income-statement':
        return renderIncomeStatement(data, periods, currency);
      case 'balance-sheet':
        return renderBalanceSheet(data, periods, currency);
      case 'cash-flow':
        return renderCashFlow(data, periods, currency);
      case 'depreciation':
        return renderDepreciation(data, currency);
      case 'ratios':
        return renderRatios(data, periods);
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-x-auto">
      <Table>
        {renderRows()}
      </Table>
    </Card>
  );
}

function renderIncomeStatement(data: any[], periods: Period[], currency: string) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Line Item</TableHead>
          {periods.map((p, i) => (
            <TableHead key={i} className={p.isAnnualTotal ? "bg-muted font-bold" : ""}>
              {p.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-semibold">Revenue</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={periods[i].isAnnualTotal ? "bg-muted font-bold" : ""}>
              {currency} {formatNumber(d.revenue, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-6">Cost of Goods Sold</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={periods[i].isAnnualTotal ? "bg-muted" : ""}>
              {currency} {formatNumber(d.cogs, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell className="font-semibold">Gross Profit</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={`font-semibold ${periods[i].isAnnualTotal ? "bg-muted" : ""}`}>
              {currency} {formatNumber(d.grossProfit, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-6">Operating Expenses</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={periods[i].isAnnualTotal ? "bg-muted" : ""}>
              {currency} {formatNumber(d.opex, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell className="font-semibold">EBITDA</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={`font-semibold ${periods[i].isAnnualTotal ? "bg-muted" : ""}`}>
              {currency} {formatNumber(d.ebitda, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-6">Depreciation</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={periods[i].isAnnualTotal ? "bg-muted" : ""}>
              {currency} {formatNumber(d.depreciation, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell className="font-semibold">EBIT</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={`font-semibold ${periods[i].isAnnualTotal ? "bg-muted" : ""}`}>
              {currency} {formatNumber(d.ebit, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-6">Interest Expense</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={periods[i].isAnnualTotal ? "bg-muted" : ""}>
              {currency} {formatNumber(d.interest, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell className="font-semibold">EBT</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={`font-semibold ${periods[i].isAnnualTotal ? "bg-muted" : ""}`}>
              {currency} {formatNumber(d.ebt, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-6">Tax</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={periods[i].isAnnualTotal ? "bg-muted" : ""}>
              {currency} {formatNumber(d.tax, 0)}
            </TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-primary/10 font-bold">
          <TableCell className="font-bold">Net Income</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className={`font-bold ${periods[i].isAnnualTotal ? "bg-primary/20" : ""}`}>
              {currency} {formatNumber(d.netIncome, 0)}
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </>
  );
}

function renderBalanceSheet(data: any[], periods: Period[], currency: string) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Account</TableHead>
          {periods.map((p, i) => (
            <TableHead key={i} className={p.isAnnualTotal ? "bg-muted font-bold" : ""}>
              {p.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="font-semibold bg-muted/30">
          <TableCell colSpan={periods.length + 1}>ASSETS</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Cash</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.cash, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Accounts Receivable</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.accountsReceivable, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Inventory</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.inventory, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Total Current Assets</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.currentAssets, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">PPE (Gross)</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.ppe, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Accumulated Depreciation</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} ({formatNumber(d.accumulatedDepreciation, 0)})</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Net PPE</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.netPPE, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-primary/10 font-bold">
          <TableCell className="font-bold">TOTAL ASSETS</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-bold">{currency} {formatNumber(d.totalAssets, 0)}</TableCell>
          ))}
        </TableRow>
        
        <TableRow className="font-semibold bg-muted/30">
          <TableCell colSpan={periods.length + 1}>LIABILITIES & EQUITY</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Accounts Payable</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.accountsPayable, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Total Current Liabilities</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.currentLiabilities, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Long-term Debt</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.debt, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Total Liabilities</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.totalLiabilities, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Equity (Paid-in Capital)</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.equity, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Retained Earnings</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.retainedEarnings, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Total Equity</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.totalEquity, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-primary/10 font-bold">
          <TableCell className="font-bold">TOTAL LIABILITIES & EQUITY</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-bold">{currency} {formatNumber(d.totalLiabilitiesAndEquity, 0)}</TableCell>
          ))}
        </TableRow>
      </TableBody>
    </>
  );
}

function renderCashFlow(data: any[], periods: Period[], currency: string) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Cash Flow Item</TableHead>
          {periods.map((p, i) => (
            <TableHead key={i} className={p.isAnnualTotal ? "bg-muted font-bold" : ""}>
              {p.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="font-semibold bg-muted/30">
          <TableCell colSpan={periods.length + 1}>OPERATING ACTIVITIES</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Net Income</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.netIncome, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Depreciation</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.depreciation, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Change in AR</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.changeInAR, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Change in Inventory</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.changeInInventory, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Change in AP</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.changeInAP, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Cash from Operations</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.cfo, 0)}</TableCell>
          ))}
        </TableRow>
        
        <TableRow className="font-semibold bg-muted/30">
          <TableCell colSpan={periods.length + 1}>INVESTING ACTIVITIES</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Capital Expenditures</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.capex, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Cash from Investing</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.cfi, 0)}</TableCell>
          ))}
        </TableRow>
        
        <TableRow className="font-semibold bg-muted/30">
          <TableCell colSpan={periods.length + 1}>FINANCING ACTIVITIES</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Debt Drawdown</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.debtDrawdown, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Debt Repayment</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.debtRepayment, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Equity Injection</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.equityInjection, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-muted/50 font-semibold">
          <TableCell>Cash from Financing</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-semibold">{currency} {formatNumber(d.cff, 0)}</TableCell>
          ))}
        </TableRow>
        
        <TableRow className="bg-primary/10 font-bold">
          <TableCell className="font-bold">Net Change in Cash</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-bold">{currency} {formatNumber(d.netCashFlow, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="pl-4">Beginning Cash</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{currency} {formatNumber(d.beginningCash, 0)}</TableCell>
          ))}
        </TableRow>
        <TableRow className="bg-primary/10 font-bold">
          <TableCell className="font-bold">Ending Cash</TableCell>
          {data.map((d, i) => (
            <TableCell key={i} className="font-bold">{currency} {formatNumber(d.endingCash, 0)}</TableCell>
          ))}
        </TableRow>
      </TableBody>
    </>
  );
}

function renderDepreciation(data: any[], currency: string) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Original Cost</TableHead>
          <TableHead>Useful Life</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Beginning Value</TableHead>
          <TableHead>Depreciation</TableHead>
          <TableHead>Ending Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((d, i) => (
          <TableRow key={i}>
            <TableCell>{d.assetName}</TableCell>
            <TableCell>{d.year}</TableCell>
            <TableCell>{currency} {formatNumber(d.amount, 0)}</TableCell>
            <TableCell>{d.lifeYears} years</TableCell>
            <TableCell>{d.method}</TableCell>
            <TableCell>{currency} {formatNumber(d.beginningValue, 0)}</TableCell>
            <TableCell>{currency} {formatNumber(d.depreciation, 0)}</TableCell>
            <TableCell>{currency} {formatNumber(d.endingValue, 0)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}

function renderRatios(data: any[], periods: Period[]) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Ratio</TableHead>
          {periods.map((p, i) => (
            <TableHead key={i}>{p.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Current Ratio</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{formatNumber(d.currentRatio, 2)}x</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell>Quick Ratio</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{formatNumber(d.quickRatio, 2)}x</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell>Cash Ratio</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{formatNumber(d.cashRatio, 2)}x</TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell>Working Capital</TableCell>
          {data.map((d, i) => (
            <TableCell key={i}>{formatNumber(d.workingCapital, 0)}</TableCell>
          ))}
        </TableRow>
      </TableBody>
    </>
  );
}

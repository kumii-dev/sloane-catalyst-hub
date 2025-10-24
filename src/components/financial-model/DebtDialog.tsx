import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useModelStore } from '@/store/modelStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtDialog({ open, onOpenChange }: DebtDialogProps) {
  const { debt, setDebt, equity, setEquity, assets, setAssets, company } = useModelStore();
  const currency = company.currency || 'USD';

  // Calculate totals for accounting validation based on allocations
  const calculateExpectedAssets = () => {
    const modelStartDate = new Date(company.startDate);
    let expectedCash = 0;
    let expectedPPE = 0;
    let expectedWC = 0;

    // Process debt allocations before start date
    debt.forEach((d) => {
      const debtDate = new Date(d.startDate);
      if (debtDate <= modelStartDate) {
        const principal = d.principal || 0;
        if (d.useOfProceeds === 'cash' || d.useOfProceeds === 'operations') {
          expectedCash += principal;
        } else if (d.useOfProceeds === 'capex') {
          expectedPPE += principal;
        } else if (d.useOfProceeds === 'workingCapital') {
          expectedWC += principal;
        }
      }
    });

    // Process equity allocations before start date
    equity.forEach((e) => {
      const equityDate = new Date(e.date);
      if (equityDate <= modelStartDate) {
        const amount = e.amount || 0;
        const useOfProceeds = e.useOfProceeds || 'cash';
        if (useOfProceeds === 'cash' || useOfProceeds === 'operations') {
          expectedCash += amount;
        } else if (useOfProceeds === 'capex') {
          expectedPPE += amount;
        } else if (useOfProceeds === 'workingCapital') {
          expectedWC += amount;
        }
      }
    });

    return { expectedCash, expectedPPE, expectedWC, total: expectedCash + expectedPPE + expectedWC };
  };

  const expectedAssets = calculateExpectedAssets();
  const totalDebt = debt.reduce((sum, d) => sum + (d.principal || 0), 0);
  const totalEquity = equity.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalFunding = totalDebt + totalEquity;
  const isBalanced = Math.abs(expectedAssets.total - totalFunding) < 0.01;

  const addDebtItem = () => {
    setDebt([
      ...debt,
      {
        type: '',
        principal: 0,
        ratePct: 0,
        tenorYears: 5,
        amort: 'annuity',
        startDate: new Date().toISOString().split('T')[0],
        useOfProceeds: 'cash',
      },
    ]);
    toast.success("Debt facility added");
  };

  const removeDebtItem = (index: number) => {
    setDebt(debt.filter((_, i) => i !== index));
    toast.success("Debt facility removed");
  };

  const updateDebtItem = (index: number, field: string, value: any) => {
    const updated = [...debt];
    updated[index] = { ...updated[index], [field]: value };
    setDebt(updated);
  };

  const addEquityItem = () => {
    setEquity([
      ...equity,
      {
        type: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        useOfProceeds: 'cash',
      },
    ]);
    toast.success("Equity entry added");
  };

  const removeEquityItem = (index: number) => {
    setEquity(equity.filter((_, i) => i !== index));
    toast.success("Equity entry removed");
  };

  const updateEquityItem = (index: number, field: string, value: any) => {
    const updated = [...equity];
    updated[index] = { ...updated[index], [field]: value };
    setEquity(updated);
  };

  const addAssetItem = () => {
    setAssets([
      ...assets,
      {
        type: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
      },
    ]);
    toast.success("Asset item added");
  };

  const removeAssetItem = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
    toast.success("Asset item removed");
  };

  const updateAssetItem = (index: number, field: string, value: any) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], [field]: value };
    setAssets(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Balance Sheet Structure</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">Define your liabilities, equity, and assets</p>

          {/* Accounting Validation Summary */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-3">Accounting Balance Check</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Expected Assets (from allocations)</p>
                <p className="text-2xl font-bold">{currency} {expectedAssets.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Cash: {currency} {expectedAssets.expectedCash.toLocaleString()}, PPE: {currency} {expectedAssets.expectedPPE.toLocaleString()}, WC: {currency} {expectedAssets.expectedWC.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold">{currency} {totalDebt.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Equity</p>
                <p className="text-2xl font-bold">{currency} {totalEquity.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Total Funding (Debt + Equity)</span>
                <span className="text-xl font-bold">{currency} {totalFunding.toLocaleString()}</span>
              </div>
              
              {isBalanced ? (
                <Alert className="bg-success/10 border-success/50">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    <strong>Balance Sheet Balanced:</strong> Your debt and equity allocations match perfectly. The model will auto-populate initial assets based on your use of proceeds.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> Assets will be automatically calculated based on how you allocate debt and equity (use of proceeds). Make sure your debt and equity amounts are correct.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-xs text-muted-foreground mt-3">
                <strong>Accounting Principle:</strong> Assets = Liabilities + Equity. The model automatically calculates your initial assets based on how you allocate debt and equity proceeds. 
                For example, debt allocated to "capex" creates PPE assets, while "cash" allocation increases cash balances.
              </p>
            </div>
          </Card>

          <Tabs defaultValue="debt" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="debt">Debt</TabsTrigger>
              <TabsTrigger value="equity">Equity</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="debt" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Define your debt facilities and terms</p>
                <Button onClick={addDebtItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Debt
                </Button>
              </div>

              {debt.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No debt facilities defined yet</p>
                  <Button onClick={addDebtItem} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Debt Facility
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {debt.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Debt Facility #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDebtItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Input
                            value={item.type}
                            onChange={(e) => updateDebtItem(index, 'type', e.target.value)}
                            placeholder="Term Loan, Revolver, Bond, etc."
                          />
                          <p className="text-xs text-muted-foreground">Type of debt facility</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Principal Amount</Label>
                          <Input
                            type="number"
                            value={item.principal}
                            onChange={(e) => updateDebtItem(index, 'principal', parseFloat(e.target.value) || 0)}
                          />
                          <p className="text-xs text-muted-foreground">Total amount borrowed</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Interest Rate (%) - Annual</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={item.ratePct}
                            onChange={(e) => updateDebtItem(index, 'ratePct', parseFloat(e.target.value) || 0)}
                          />
                          <p className="text-xs text-muted-foreground">Annual interest rate</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Tenor (Years)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.tenorYears}
                            onChange={(e) => updateDebtItem(index, 'tenorYears', parseInt(e.target.value) || 1)}
                          />
                          <p className="text-xs text-muted-foreground">Length of the loan in years</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Amortization</Label>
                          <Select
                            value={item.amort}
                            onValueChange={(value: any) => updateDebtItem(index, 'amort', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annuity">Annuity (Equal Payments)</SelectItem>
                              <SelectItem value="bullet">Bullet (End of Term)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Payment structure</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={item.startDate}
                            onChange={(e) => updateDebtItem(index, 'startDate', e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">When the loan starts</p>
                        </div>

                        <div className="space-y-2 col-span-full">
                          <Label>Use of Proceeds</Label>
                          <Select
                            value={item.useOfProceeds || 'cash'}
                            onValueChange={(value: any) => updateDebtItem(index, 'useOfProceeds', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Retain as Cash</SelectItem>
                              <SelectItem value="capex">Capital Expenditure</SelectItem>
                              <SelectItem value="workingCapital">Working Capital</SelectItem>
                              <SelectItem value="operations">General Operations</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {item.useOfProceeds === 'cash' && 'Proceeds remain as cash on balance sheet'}
                            {item.useOfProceeds === 'capex' && 'Proceeds used to acquire fixed assets (PPE)'}
                            {item.useOfProceeds === 'workingCapital' && 'Proceeds fund AR, inventory, and operations'}
                            {item.useOfProceeds === 'operations' && 'Proceeds expensed through P&L'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="equity" className="space-y-4 mt-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Define equity contributions and capital structure</p>
                </div>
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription className="text-sm">
                    <strong>Equity Injections:</strong> When investors contribute capital, it increases both Cash (asset) and Equity on your balance sheet. 
                    Unlike debt, equity doesn't require repayment or interest.
                  </AlertDescription>
                </Alert>
              </div>
              <div className="flex justify-end">
                <Button onClick={addEquityItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Equity
                </Button>
              </div>

              {equity.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No equity entries defined yet</p>
                  <Button onClick={addEquityItem} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Equity Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {equity.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Equity Entry #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquityItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Input
                            value={item.type}
                            onChange={(e) => updateEquityItem(index, 'type', e.target.value)}
                            placeholder="Common Stock, Preferred Stock, etc."
                          />
                          <p className="text-xs text-muted-foreground">Type of equity investment</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateEquityItem(index, 'amount', parseFloat(e.target.value) || 0)}
                          />
                          <p className="text-xs text-muted-foreground">Amount of capital raised</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={item.date}
                            onChange={(e) => updateEquityItem(index, 'date', e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">When funding is received</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Use of Proceeds</Label>
                          <Select
                            value={item.useOfProceeds || 'cash'}
                            onValueChange={(value) => updateEquityItem(index, 'useOfProceeds', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="capex">Capital Expenditure</SelectItem>
                              <SelectItem value="workingCapital">Working Capital</SelectItem>
                              <SelectItem value="operations">General Operations</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">How will this equity be allocated?</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assets" className="space-y-4 mt-6">
              <div className="space-y-3 mb-4">
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription className="text-sm">
                    <strong>Auto-Calculated Assets:</strong> Initial assets are automatically calculated based on your debt and equity allocations (use of proceeds). 
                    The model follows proper accounting: Assets = Liabilities + Equity.
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>• Expected Cash: {currency} {expectedAssets.expectedCash.toLocaleString()}</li>
                      <li>• Expected PPE: {currency} {expectedAssets.expectedPPE.toLocaleString()}</li>
                      <li>• Expected Working Capital: {currency} {expectedAssets.expectedWC.toLocaleString()}</li>
                      <li><strong>• Total Assets: {currency} {expectedAssets.total.toLocaleString()}</strong></li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <div className="border rounded-lg p-6 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Assets are now auto-populated based on how you allocate debt and equity proceeds. You no longer need to manually enter assets here.
                  The model will initialize the balance sheet with the correct asset values based on your financing structure.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

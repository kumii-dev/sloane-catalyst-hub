import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useModelStore } from "@/store/modelStore";
import { toast } from "sonner";

interface EquityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquityDialog({ open, onOpenChange }: EquityDialogProps) {
  const { equity, setEquity, company } = useModelStore();
  const currency = company.currency || 'USD';

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
    toast.success("Equity injection added");
  };

  const removeEquityItem = (index: number) => {
    setEquity(equity.filter((_, i) => i !== index));
    toast.success("Equity injection removed");
  };

  const updateEquityItem = (index: number, field: string, value: any) => {
    const updated = [...equity];
    updated[index] = { ...updated[index], [field]: value };
    setEquity(updated);
  };

  const totalEquity = equity.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Equity Financing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <p className="text-muted-foreground">Define equity injections and capital raises</p>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Equity Injections:</strong> When investors contribute capital, it increases both Cash (asset) and Equity on your balance sheet. 
              Unlike debt, equity doesn't require repayment or interest. However, it dilutes ownership. Use this to declare all equity funding rounds.
            </AlertDescription>
          </Alert>

          <Card className="p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Equity Raised</p>
                <p className="text-2xl font-bold">{currency} {totalEquity.toLocaleString()}</p>
              </div>
              <Button onClick={addEquityItem} className="bg-gradient-hero">
                <Plus className="mr-2 h-4 w-4" />
                Add Equity Injection
              </Button>
            </div>
          </Card>

          {equity.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No equity injections defined yet</p>
              <Button onClick={addEquityItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add First Equity Injection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {equity.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Equity Injection #{index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEquityItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Input
                        value={item.type}
                        onChange={(e) => updateEquityItem(index, 'type', e.target.value)}
                        placeholder="Common Stock, Preferred Stock, Series A, etc."
                      />
                      <p className="text-xs text-muted-foreground">Type of equity investment (Common Stock, Preferred Stock, Series A/B/C, etc.)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateEquityItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="100000"
                      />
                      <p className="text-xs text-muted-foreground">Capital raised from investors (no repayment required, dilutes ownership)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateEquityItem(index, 'date', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Date when equity capital is received</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Use of Proceeds</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={item.useOfProceeds || 'cash'}
                        onChange={(e) => updateEquityItem(index, 'useOfProceeds', e.target.value)}
                      >
                        <option value="cash">Cash (Operating Cash)</option>
                        <option value="capex">Capital Expenditure (PPE)</option>
                        <option value="workingCapital">Working Capital</option>
                        <option value="operations">General Operations</option>
                      </select>
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

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Understanding Equity</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Equity injections increase both Cash (asset) and Paid-in Capital (equity)</li>
              <li>• Shows in Cash Flow Statement under Financing Activities (CFF)</li>
              <li>• Unlike debt, equity does not require repayment or interest payments</li>
              <li>• Equity dilutes ownership but provides permanent capital</li>
              <li>• Total Equity = Starting Equity + Retained Earnings + Additional Capital Injections</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

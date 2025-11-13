import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useModelStore } from "@/store/modelStore";

interface TaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaxDialog({ open, onOpenChange }: TaxDialogProps) {
  const { tax, setTax } = useModelStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tax Assumptions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <p className="text-muted-foreground">Define your corporate tax rate and loss carryforwards</p>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Tax Calculations:</strong> Tax is calculated on Earnings Before Tax (EBT). NOLs reduce taxable income, 
              helping lower your tax bill. Deferred tax assets/liabilities are calculated based on temporary differences.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Corporate Tax Rate (%) - Annual</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.1"
                value={tax.ratePct}
                onChange={(e) => setTax({ ...tax, ratePct: parseFloat(e.target.value) || 0 })}
                placeholder="28"
              />
              <p className="text-xs text-muted-foreground">
                The percentage of taxable income your company pays in taxes each year (e.g., 28% for South African corporations)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nol">Net Operating Loss (NOL) Carryforward</Label>
              <Input
                id="nol"
                type="number"
                value={tax.NOL}
                onChange={(e) => setTax({ ...tax, NOL: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Accumulated losses from previous years that can reduce current taxable income (helps lower your tax bill)
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Tax Calculation Notes</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Tax is calculated on Earnings Before Tax (EBT)</li>
              <li>• NOLs are applied to reduce taxable income before tax calculation</li>
              <li>• Deferred tax assets/liabilities are calculated based on temporary differences</li>
              <li>• Minimum tax provisions may apply depending on jurisdiction</li>
              <li>• Tax shields from interest expense reduce taxable income</li>
            </ul>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Example Tax Calculation</h4>
            <div className="text-sm space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Earnings Before Tax (EBT):</span>
                <span>R100,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Less: NOL Carryforward:</span>
                <span>-R{tax.NOL.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="text-muted-foreground">Taxable Income:</span>
                <span>${Math.max(0, 100000 - tax.NOL).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                <span>Tax Expense ({tax.ratePct}%):</span>
                <span>${(Math.max(0, 100000 - tax.NOL) * (tax.ratePct / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

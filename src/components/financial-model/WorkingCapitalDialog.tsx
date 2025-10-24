import { useModelStore } from '@/store/modelStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkingCapitalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkingCapitalDialog({ open, onOpenChange }: WorkingCapitalDialogProps) {
  const { workingCapital, setWorkingCapital } = useModelStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Working Capital Assumptions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">Define your working capital turnover metrics</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dso">Days Sales Outstanding (DSO)</Label>
              <Input
                id="dso"
                type="number"
                value={workingCapital.DSO}
                onChange={(e) => setWorkingCapital({ ...workingCapital, DSO: parseFloat(e.target.value) || 0 })}
                placeholder="45"
              />
              <p className="text-xs text-muted-foreground">Average days to collect payment from customers (lower is better - faster cash collection)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dio">Days Inventory Outstanding (DIO)</Label>
              <Input
                id="dio"
                type="number"
                value={workingCapital.DIO}
                onChange={(e) => setWorkingCapital({ ...workingCapital, DIO: parseFloat(e.target.value) || 0 })}
                placeholder="60"
              />
              <p className="text-xs text-muted-foreground">Average days inventory sits before being sold (lower is better - less capital tied up)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dpo">Days Payable Outstanding (DPO)</Label>
              <Input
                id="dpo"
                type="number"
                value={workingCapital.DPO}
                onChange={(e) => setWorkingCapital({ ...workingCapital, DPO: parseFloat(e.target.value) || 0 })}
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">Average days to pay suppliers (higher is better - keeps cash longer but maintain good relationships)</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Working Capital Cycle</h4>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days Sales Outstanding (DSO):</span>
                <span className="font-mono">{workingCapital.DSO} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days Inventory Outstanding (DIO):</span>
                <span className="font-mono">+ {workingCapital.DIO} days</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Days Payable Outstanding (DPO):</span>
                <span className="font-mono">- {workingCapital.DPO} days</span>
              </div>
              <div className="flex justify-between border-t-2 pt-2 font-semibold">
                <span>Cash Conversion Cycle:</span>
                <span className="font-mono">{workingCapital.DSO + workingCapital.DIO - workingCapital.DPO} days</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

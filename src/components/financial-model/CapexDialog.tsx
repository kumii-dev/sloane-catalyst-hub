import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CapexDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CapexDialog({ open, onOpenChange }: CapexDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Capital Expenditures</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Capex configuration will be implemented here.</p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

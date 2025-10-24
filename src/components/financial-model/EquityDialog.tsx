import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EquityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquityDialog({ open, onOpenChange }: EquityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Equity Financing</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Equity configuration will be implemented here.</p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

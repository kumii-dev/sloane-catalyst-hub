import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtDialog({ open, onOpenChange }: DebtDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Debt Financing</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Debt configuration will be implemented here.</p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

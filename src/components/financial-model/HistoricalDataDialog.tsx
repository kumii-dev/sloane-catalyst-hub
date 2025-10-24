import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HistoricalDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoricalDataDialog({ open, onOpenChange }: HistoricalDataDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Historical Data</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Historical data import will be implemented here.</p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

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
        <div className="py-8 text-center space-y-4">
          <div className="flex justify-center">
            <Construction className="h-12 w-12 text-rating" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Feature Coming Soon</h3>
            <p className="text-muted-foreground">Historical data import functionality is currently under development and will be available soon.</p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

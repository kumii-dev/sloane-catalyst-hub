import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface COGSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function COGSDialog({ open, onOpenChange }: COGSDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cost of Goods Sold</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">COGS configuration will be implemented here.</p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

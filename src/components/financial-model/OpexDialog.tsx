import { Plus, Trash2 } from 'lucide-react';
import { useModelStore } from '@/store/modelStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface OpexDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpexDialog({ open, onOpenChange }: OpexDialogProps) {
  const { opex, setOpex } = useModelStore();

  const addOpexItem = () => {
    const newItem = {
      name: '',
      basis: 'percentOfRevenue' as const,
      value: 0,
    };
    setOpex([...opex, newItem]);
    toast.success("Operating expense added");
  };

  const removeOpexItem = (index: number) => {
    setOpex(opex.filter((_, i) => i !== index));
    toast.success("Operating expense removed");
  };

  const updateOpexItem = (index: number, field: string, value: any) => {
    const updated = [...opex];
    updated[index] = { ...updated[index], [field]: value };
    setOpex(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Operating Expenses</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Define your operating expense categories</p>
            <Button onClick={addOpexItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>

          {opex.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No operating expenses defined yet</p>
              <Button onClick={addOpexItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {opex.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Expense #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOpexItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Expense Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateOpexItem(index, 'name', e.target.value)}
                          placeholder="Sales & Marketing, R&D, etc."
                        />
                        <p className="text-xs text-muted-foreground">Type of operating expense (e.g., salaries, rent, utilities, marketing)</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Basis</Label>
                        <Select
                          value={item.basis}
                          onValueChange={(value) => updateOpexItem(index, 'basis', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentOfRevenue">% of Revenue</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Choose if this expense varies with sales or stays constant</p>
                      </div>

                      <div className="space-y-2">
                        <Label>{item.basis === 'percentOfRevenue' ? 'Percentage (%)' : 'Amount - Monthly'}</Label>
                        <Input
                          type="number"
                          value={item.value}
                          onChange={(e) => updateOpexItem(index, 'value', parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {item.basis === 'percentOfRevenue' 
                            ? 'Percentage of monthly revenue (e.g., 15 for 15%)' 
                            : 'Fixed monthly expense amount in your currency'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

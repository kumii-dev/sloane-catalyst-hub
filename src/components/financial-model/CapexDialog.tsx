import { Plus, Trash2 } from 'lucide-react';
import { useModelStore } from '@/store/modelStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface CapexDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CapexDialog({ open, onOpenChange }: CapexDialogProps) {
  const { capex, setCapex } = useModelStore();

  const addCapexItem = () => {
    const newItem = {
      assetClass: '',
      amount: 0,
      year: 1,
      lifeYears: 5,
      method: 'SL' as const,
    };
    setCapex([...capex, newItem]);
    toast.success("Capital expenditure added");
  };

  const removeCapexItem = (index: number) => {
    setCapex(capex.filter((_, i) => i !== index));
    toast.success("Capital expenditure removed");
  };

  const updateCapexItem = (index: number, field: string, value: any) => {
    const updated = [...capex];
    updated[index] = { ...updated[index], [field]: value };
    setCapex(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Capital Expenditure</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Define your planned capital investments</p>
            <Button onClick={addCapexItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Capex
            </Button>
          </div>

          {capex.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No capital expenditures defined yet</p>
              <Button onClick={addCapexItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Capex
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {capex.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Capex #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCapexItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Asset Class</Label>
                        <Input
                          value={item.assetClass}
                          onChange={(e) => updateCapexItem(index, 'assetClass', e.target.value)}
                          placeholder="Equipment, Building, etc."
                        />
                        <p className="text-xs text-muted-foreground">Type of fixed asset being purchased</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateCapexItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">Total purchase cost of the asset</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Purchase Year</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.year}
                          onChange={(e) => updateCapexItem(index, 'year', parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">Year when asset will be purchased</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Useful Life (Years)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.lifeYears}
                          onChange={(e) => updateCapexItem(index, 'lifeYears', parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">How long the asset will be used before replacement</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Depreciation Method</Label>
                        <Select
                          value={item.method}
                          onValueChange={(value: any) => updateCapexItem(index, 'method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SL">Straight Line</SelectItem>
                            <SelectItem value="DDB">Double Declining Balance</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">SL: equal expense each year; DDB: higher expense early years</p>
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

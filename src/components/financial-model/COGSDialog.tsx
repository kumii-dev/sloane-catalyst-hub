import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useModelStore, COGSDriver } from "@/store/modelStore";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Info } from "lucide-react";

interface COGSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function COGSDialog({ open, onOpenChange }: COGSDialogProps) {
  const { cogs, setCOGS, revenue, company } = useModelStore();
  const [formData, setFormData] = useState<COGSDriver>(cogs);

  useEffect(() => {
    setFormData(cogs);
  }, [cogs]);

  const handleSave = () => {
    if (formData.method === 'percentOfRevenue' && (!formData.percentOfRevenue || formData.percentOfRevenue <= 0)) {
      toast.error("Please enter a valid percentage of revenue");
      return;
    }

    if (formData.method === 'unitCost' && revenue.length > 0) {
      const hasAllUnitCosts = revenue.every(
        (rev) => formData.unitCosts?.[rev.segment] && formData.unitCosts[rev.segment] > 0
      );
      if (!hasAllUnitCosts) {
        toast.error("Please enter unit costs for all revenue segments");
        return;
      }
    }

    setCOGS(formData);
    toast.success("COGS configuration saved");
    onOpenChange(false);
  };

  const handleMethodChange = (method: 'percentOfRevenue' | 'unitCost') => {
    setFormData({
      ...formData,
      method,
      percentOfRevenue: method === 'percentOfRevenue' ? formData.percentOfRevenue || 0 : undefined,
      unitCosts: method === 'unitCost' ? (formData.unitCosts || {}) : undefined,
    });
  };

  const handleUnitCostChange = (segment: string, value: string) => {
    const unitCosts = formData.unitCosts ? { ...formData.unitCosts } : {};
    unitCosts[segment] = parseFloat(value) || 0;
    setFormData({ ...formData, unitCosts });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cost of Goods Sold (COGS)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-3">
            <Label>COGS Calculation Method</Label>
            <RadioGroup
              value={formData.method}
              onValueChange={handleMethodChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentOfRevenue" id="percentOfRevenue" />
                <Label htmlFor="percentOfRevenue" className="font-normal cursor-pointer">
                  Percentage of Revenue
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unitCost" id="unitCost" />
                <Label htmlFor="unitCost" className="font-normal cursor-pointer">
                  Unit Cost (per revenue segment)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Percentage of Revenue Method */}
          {formData.method === 'percentOfRevenue' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Percentage of Revenue</CardTitle>
                <CardDescription>
                  COGS will be calculated as a fixed percentage of total revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="percentOfRevenue">COGS as % of Revenue</Label>
                  <Input
                    id="percentOfRevenue"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.percentOfRevenue || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentOfRevenue: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g., 60 for 60%"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: If revenue is {company.currency} 100,000 and COGS is 60%, then COGS = {company.currency} 60,000
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unit Cost Method */}
          {formData.method === 'unitCost' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Unit Cost by Segment</CardTitle>
                <CardDescription>
                  Specify the unit cost for each revenue segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenue.length === 0 ? (
                  <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">No revenue segments defined</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please add revenue drivers first to configure unit costs
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revenue.map((rev) => (
                      <div key={rev.segment} className="space-y-2">
                        <Label htmlFor={`unitCost-${rev.segment}`}>
                          {rev.segment} - Unit Cost ({company.currency})
                        </Label>
                        <Input
                          id={`unitCost-${rev.segment}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.unitCosts?.[rev.segment] || 0}
                          onChange={(e) => handleUnitCostChange(rev.segment, e.target.value)}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Revenue price: {company.currency} {rev.price.toLocaleString()} per unit
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory Method */}
          <div className="space-y-3">
            <Label htmlFor="inventoryMethod">Inventory Valuation Method</Label>
            <Select
              value={formData.inventoryMethod}
              onValueChange={(value: 'FIFO' | 'WeightedAverage') =>
                setFormData({ ...formData, inventoryMethod: value })
              }
            >
              <SelectTrigger id="inventoryMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIFO">FIFO (First-In, First-Out)</SelectItem>
                <SelectItem value="WeightedAverage">Weighted Average</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.inventoryMethod === 'FIFO'
                ? 'Assumes oldest inventory is sold first'
                : 'Uses average cost of all inventory units'}
            </p>
          </div>

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Method:</span>{' '}
                {formData.method === 'percentOfRevenue' ? 'Percentage of Revenue' : 'Unit Cost'}
              </div>
              {formData.method === 'percentOfRevenue' && formData.percentOfRevenue && (
                <div>
                  <span className="font-medium">COGS %:</span> {formData.percentOfRevenue}%
                </div>
              )}
              {formData.method === 'unitCost' && formData.unitCosts && (
                <div>
                  <span className="font-medium">Unit Costs:</span>{' '}
                  {Object.entries(formData.unitCosts).length} segment(s) configured
                </div>
              )}
              <div>
                <span className="font-medium">Inventory Method:</span>{' '}
                {formData.inventoryMethod === 'FIFO' ? 'FIFO' : 'Weighted Average'}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save COGS Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

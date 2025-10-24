import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelStore, RevenueDriver } from "@/store/modelStore";
import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface RevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevenueDialog({ open, onOpenChange }: RevenueDialogProps) {
  const { revenue, setRevenue, company } = useModelStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<RevenueDriver>({
    segment: "",
    price: 0,
    volumeStart: 0,
    growthRates: Array(company.horizonYears).fill(0),
    recognition: "point-in-time",
  });

  const resetForm = () => {
    setFormData({
      segment: "",
      price: 0,
      volumeStart: 0,
      growthRates: Array(company.horizonYears).fill(0),
      recognition: "point-in-time",
    });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    if (!formData.segment) {
      toast.error("Please enter a segment name");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (formData.volumeStart <= 0) {
      toast.error("Starting volume must be greater than 0");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...revenue];
      updated[editingIndex] = formData;
      setRevenue(updated);
      toast.success("Revenue stream updated");
    } else {
      setRevenue([...revenue, formData]);
      toast.success("Revenue stream added");
    }
    resetForm();
  };

  const handleEdit = (index: number) => {
    setFormData(revenue[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setRevenue(revenue.filter((_, i) => i !== index));
    toast.success("Revenue stream removed");
    if (editingIndex === index) {
      resetForm();
    }
  };

  const handleGrowthRateChange = (yearIndex: number, value: string) => {
    const newGrowthRates = [...formData.growthRates];
    newGrowthRates[yearIndex] = parseFloat(value) || 0;
    setFormData({ ...formData, growthRates: newGrowthRates });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revenue Drivers</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {editingIndex !== null ? "Edit Revenue Stream" : "Add Revenue Stream"}
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="segment">Segment/Product Name *</Label>
                <Input
                  id="segment"
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  placeholder="e.g., Product A, Service B"
                />
              </div>

              <div>
                <Label htmlFor="price">Unit Price ({company.currency}) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="volumeStart">Starting Volume (units) *</Label>
                <Input
                  id="volumeStart"
                  type="number"
                  value={formData.volumeStart}
                  onChange={(e) => setFormData({ ...formData, volumeStart: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="recognition">Revenue Recognition</Label>
                <Select
                  value={formData.recognition}
                  onValueChange={(value: "point-in-time" | "over-time") =>
                    setFormData({ ...formData, recognition: value })
                  }
                >
                  <SelectTrigger id="recognition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="point-in-time">Point in Time</SelectItem>
                    <SelectItem value="over-time">Over Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Annual Growth Rates (%)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {formData.growthRates.map((rate, index) => (
                    <div key={index}>
                      <Label className="text-xs text-muted-foreground">Year {index + 1}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={rate}
                        onChange={(e) => handleGrowthRateChange(index, e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} className="flex-1">
                  {editingIndex !== null ? "Update" : <><Plus className="h-4 w-4 mr-2" /> Add</>}
                </Button>
                {editingIndex !== null && (
                  <Button onClick={resetForm} variant="outline">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Current Revenue Streams ({revenue.length})</h3>
            
            {revenue.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    No revenue streams added yet. Add your first revenue driver to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {revenue.map((driver, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{driver.segment}</CardTitle>
                          <CardDescription>
                            {company.currency} {driver.price.toLocaleString()} × {driver.volumeStart.toLocaleString()} units
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(index)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(index)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Recognition: {driver.recognition === "point-in-time" ? "Point in Time" : "Over Time"}</div>
                        <div>
                          Growth: {driver.growthRates.map((r, i) => `Y${i + 1}: ${r}%`).join(", ")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

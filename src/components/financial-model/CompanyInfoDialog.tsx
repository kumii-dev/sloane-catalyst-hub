import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelStore } from "@/store/modelStore";
import { useState } from "react";

interface CompanyInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyInfoDialog({ open, onOpenChange }: CompanyInfoDialogProps) {
  const { company, setCompany, setStandard, standard, setFrequency, frequency } = useModelStore();
  const [localData, setLocalData] = useState(company);

  const handleSave = () => {
    setCompany(localData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={localData.name}
                onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={localData.industry}
                onChange={(e) => setLocalData({ ...localData, industry: e.target.value })}
                placeholder="Technology"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={localData.currency} onValueChange={(value) => setLocalData({ ...localData, currency: value })}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZAR">ZAR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Model Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={localData.startDate}
                onChange={(e) => setLocalData({ ...localData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="horizonYears">Forecast Years</Label>
              <Input
                id="horizonYears"
                type="number"
                min="1"
                max="10"
                value={localData.horizonYears}
                onChange={(e) => setLocalData({ ...localData, horizonYears: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="standard">Accounting Standard</Label>
              <Select value={standard} onValueChange={(value: any) => setStandard(value)}>
                <SelectTrigger id="standard">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IFRS">IFRS</SelectItem>
                  <SelectItem value="GAAP">US GAAP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">Period Frequency</Label>
              <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

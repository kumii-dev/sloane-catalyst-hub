import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

interface KYCUpgradeProps {
  currentTier: string;
  userId: string;
  onSuccess?: () => void;
}

const KYCUpgrade = ({ currentTier, userId, onSuccess }: KYCUpgradeProps) => {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newTier = currentTier === "none" ? "lite" : "full";
      
      const { error } = await supabase
        .from("profiles")
        .update({
          business_name: businessName,
          business_type: businessType,
          phone,
          province,
          kyc_tier: newTier,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "KYC Upgraded!",
        description: `Your KYC tier has been upgraded to ${newTier}.`,
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    { name: "None", value: "none", features: ["Basic account", "View-only access"] },
    { name: "Lite", value: "lite", features: ["Record transactions", "Basic analytics", "Earn points"] },
    { name: "Full", value: "full", features: ["All Lite features", "Access to credit", "Premium rewards", "Priority support"] },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Your KYC Tier</CardTitle>
        <CardDescription>
          Current tier: <span className="capitalize font-semibold">{currentTier}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {tiers.map((tier) => (
              <div
                key={tier.value}
                className={`border rounded-lg p-4 ${
                  currentTier === tier.value ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <h3 className="font-semibold mb-2">{tier.name}</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <form onSubmit={handleUpgrade} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="My Shop"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail Shop</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+27 12 345 6789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select value={province} onValueChange={setProvince} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gauteng">Gauteng</SelectItem>
                    <SelectItem value="western_cape">Western Cape</SelectItem>
                    <SelectItem value="kwazulu_natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="eastern_cape">Eastern Cape</SelectItem>
                    <SelectItem value="free_state">Free State</SelectItem>
                    <SelectItem value="limpopo">Limpopo</SelectItem>
                    <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="northern_cape">Northern Cape</SelectItem>
                    <SelectItem value="north_west">North West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Upgrading..." : "Upgrade KYC Tier"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCUpgrade;

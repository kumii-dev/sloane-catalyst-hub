import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Coins, UsersIcon, Tag, AlertCircle, CheckCircle } from "lucide-react";

interface ServicePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: string;
    name: string;
    service_providers: {
      is_cohort_partner: boolean;
    };
  };
}

interface Cohort {
  id: string;
  name: string;
}

const ServicePaymentDialog = ({ open, onOpenChange, service }: ServicePaymentDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'voucher' | 'credits' | 'sponsored' | 'card'>('credits');
  const [creditBalance, setCreditBalance] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [userCohorts, setUserCohorts] = useState<Cohort[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<'1' | '3' | '6'>('1');
  const [hasSponsoredAccess, setHasSponsoredAccess] = useState(false);

  // Pricing based on duration
  const pricingData = {
    '1': { credits: 20, zar: 200 },
    '3': { credits: 50, zar: 500 },
    '6': { credits: 90, zar: 900 }
  };

  useEffect(() => {
    if (open && user) {
      fetchUserData();
    }
  }, [open, user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch credit balance
      const { data: walletData } = await supabase
        .from("credits_wallet")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (walletData) {
        setCreditBalance(walletData.balance);
      }

      // Fetch user's active cohorts
      const { data: cohortData } = await supabase
        .from("cohort_memberships")
        .select(`
          cohort_id,
          cohorts:cohort_id (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (cohortData) {
        const cohorts = cohortData
          .map(cm => cm.cohorts)
          .filter(c => c !== null) as Cohort[];
        setUserCohorts(cohorts);

        // Check if service is funded by any of user's cohorts
        if (service.service_providers.is_cohort_partner && cohorts.length > 0) {
          // For now, assume cohort partners provide sponsored access to all cohort members
          setHasSponsoredAccess(true);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a voucher code",
        variant: "destructive",
      });
      return;
    }

    // Mock voucher validation - in production, this would query a vouchers table
    const mockVouchers: Record<string, number> = {
      'SAVE10': 10,
      'SAVE20': 20,
      'SAVE50': 50,
    };

    const discount = mockVouchers[voucherCode.toUpperCase()];
    if (discount) {
      setAppliedVoucher({ code: voucherCode.toUpperCase(), discount });
      toast({
        title: "Voucher Applied",
        description: `${discount}% discount applied!`,
      });
    } else {
      toast({
        title: "Invalid Voucher",
        description: "The voucher code you entered is not valid",
        variant: "destructive",
      });
    }
  };

  const calculateFinalCost = () => {
    const basePrice = pricingData[selectedDuration].credits;
    if (appliedVoucher) {
      return Math.round(basePrice * (1 - appliedVoucher.discount / 100));
    }
    return basePrice;
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    // Validation based on payment method
    if (paymentMethod === 'sponsored' && !selectedCohort) {
      toast({
        title: "Selection Required",
        description: "Please select a sponsored programme",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'credits') {
      const finalCost = calculateFinalCost();
      if (creditBalance < finalCost) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${finalCost} credits but only have ${creditBalance}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (paymentMethod === 'card') {
      toast({
        title: "Coming Soon",
        description: "Card payments will be available soon",
      });
      return;
    }

    setProcessing(true);

    try {
      const finalCost = paymentMethod === 'credits' ? calculateFinalCost() : 0;
      const durationMonths = parseInt(selectedDuration);
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      // Create subscription
      const { error: subscriptionError } = await supabase
        .from("service_subscriptions")
        .insert({
          service_id: service.id,
          user_id: user.id,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          credits_used: paymentMethod === 'credits' ? finalCost : 0,
          subscription_status: 'active',
        });

      if (subscriptionError) throw subscriptionError;

      // Deduct credits if applicable
      if (paymentMethod === 'credits' && finalCost > 0) {
        const { error: deductError } = await supabase.rpc("deduct_credits", {
          p_user_id: user.id,
          p_amount: finalCost,
          p_description: `Subscription to ${service.name} (${selectedDuration} month${durationMonths > 1 ? 's' : ''})`,
        });

        if (deductError) throw deductError;
      }

      toast({
        title: "Subscription Successful!",
        description: `You now have access to ${service.name} for ${selectedDuration} month${durationMonths > 1 ? 's' : ''}`,
      });

      onOpenChange(false);
      
      // Refresh the page to show updated subscription status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: error.message || "An error occurred while processing your subscription",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscribe to {service.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Duration Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Subscription Duration</Label>
            <RadioGroup value={selectedDuration} onValueChange={(value: any) => setSelectedDuration(value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-primary cursor-pointer">
                  <RadioGroupItem value="1" id="duration-1" />
                  <Label htmlFor="duration-1" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>1 Month</span>
                      <div className="text-right">
                        <div className="font-semibold">{pricingData['1'].credits} Credits</div>
                        <div className="text-sm text-muted-foreground">or R{pricingData['1'].zar}</div>
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-primary cursor-pointer">
                  <RadioGroupItem value="3" id="duration-3" />
                  <Label htmlFor="duration-3" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>3 Months</span>
                      <div className="text-right">
                        <div className="font-semibold">{pricingData['3'].credits} Credits</div>
                        <div className="text-sm text-muted-foreground">or R{pricingData['3'].zar}</div>
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-primary cursor-pointer">
                  <RadioGroupItem value="6" id="duration-6" />
                  <Label htmlFor="duration-6" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>6 Months</span>
                      <div className="text-right">
                        <div className="font-semibold">{pricingData['6'].credits} Credits <Badge variant="secondary" className="ml-2">Save 10%</Badge></div>
                        <div className="text-sm text-muted-foreground">or R{pricingData['6'].zar}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Payment Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Voucher Option */}
              <Card 
                className={`cursor-pointer transition-all ${paymentMethod === 'voucher' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPaymentMethod('voucher')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Voucher Code</div>
                      <div className="text-sm text-muted-foreground">Apply a discount code</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kumii Credits Option */}
              <Card 
                className={`cursor-pointer transition-all ${paymentMethod === 'credits' ? 'ring-2 ring-primary' : ''} ${creditBalance < calculateFinalCost() ? 'opacity-50' : ''}`}
                onClick={() => setPaymentMethod('credits')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Coins className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium">Kumii Credits</div>
                        <div className="text-sm text-muted-foreground">Balance: {creditBalance}</div>
                      </div>
                    </div>
                    {creditBalance < calculateFinalCost() && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sponsored Option */}
              {hasSponsoredAccess && (
                <Card 
                  className={`cursor-pointer transition-all ${paymentMethod === 'sponsored' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setPaymentMethod('sponsored')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <UsersIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Sponsored Access</div>
                        <div className="text-sm text-muted-foreground">Use cohort benefits</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Card Option */}
              <Card 
                className={`cursor-pointer transition-all ${paymentMethod === 'card' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Credit Card</div>
                        <div className="text-sm text-muted-foreground">Coming soon</div>
                      </div>
                    </div>
                    <Badge variant="outline">Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cohort Selection (if sponsored) */}
          {paymentMethod === 'sponsored' && userCohorts.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Sponsored Programme</Label>
              <RadioGroup value={selectedCohort} onValueChange={setSelectedCohort}>
                <div className="space-y-2">
                  {userCohorts.map((cohort) => (
                    <div key={cohort.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={cohort.id} id={cohort.id} />
                      <Label htmlFor={cohort.id} className="flex-1 cursor-pointer font-normal">
                        {cohort.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Voucher Input */}
          {paymentMethod === 'voucher' && (
            <div>
              <Label htmlFor="voucher-code" className="text-base font-semibold mb-3 block">Enter Voucher Code</Label>
              <div className="flex gap-2">
                <Input
                  id="voucher-code"
                  placeholder="Enter code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleApplyVoucher} variant="outline">
                  Apply
                </Button>
              </div>
              {appliedVoucher && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{appliedVoucher.discount}% discount applied</span>
                </div>
              )}
            </div>
          )}

          {/* Payment Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subscription Duration:</span>
                  <span className="font-medium">{selectedDuration} Month{parseInt(selectedDuration) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-medium">{pricingData[selectedDuration].credits} Credits</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher Discount:</span>
                    <span className="font-medium">-{appliedVoucher.discount}%</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total:</span>
                    <span>
                      {paymentMethod === 'sponsored' ? 'FREE' : `${calculateFinalCost()} Credits`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubscribe} 
              className="flex-1"
              disabled={
                processing || 
                (paymentMethod === 'credits' && creditBalance < calculateFinalCost()) ||
                (paymentMethod === 'sponsored' && !selectedCohort) ||
                (paymentMethod === 'card')
              }
            >
              {processing ? "Processing..." : "Complete Subscription"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServicePaymentDialog;

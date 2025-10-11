import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Coins, Gift } from "lucide-react";
import { BookingData } from "./BookSessionDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentStepProps {
  mentor: any;
  bookingData: BookingData;
  onBack: () => void;
  onComplete: () => void;
}

export const PaymentStep = ({ mentor, bookingData, onBack, onComplete }: PaymentStepProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "credits" | "sponsored">("card");
  const [creditBalance, setCreditBalance] = useState(0);
  const [isSponsoredMember, setIsSponsoredMember] = useState(false);
  const { toast } = useToast();

  const sessionFee = mentor.session_fee || 100;
  const creditsRequired = Math.ceil(sessionFee / 10); // 1 credit = $10 equivalent
  const currency = "USD";
  const localAmount = sessionFee;

  useEffect(() => {
    const fetchPaymentOptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch credit balance
      const { data: wallet } = await supabase
        .from('credits_wallet')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (wallet) {
        setCreditBalance(wallet.balance);
      }

      // Check if user is part of a sponsored cohort
      const { data: memberships } = await supabase
        .from('cohort_memberships')
        .select('cohort_id, cohorts(credits_allocated)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (memberships && memberships.length > 0) {
        setIsSponsoredMember(true);
      }
    };

    fetchPaymentOptions();
  }, []);

  const handlePayment = async () => {
    if (paymentMethod === "card" && !email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === "credits" && creditBalance < creditsRequired) {
      toast({
        title: "Insufficient credits",
        description: `You need ${creditsRequired} credits but only have ${creditBalance}.`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create session booking
      const { data: session, error: sessionError } = await supabase
        .from('mentoring_sessions')
        .insert({
          mentor_id: mentor.id,
          mentee_id: user.id,
          scheduled_at: bookingData.date?.toISOString(),
          duration_minutes: 60,
          title: "Leadership Coaching",
          description: bookingData.message || "",
          session_type: 'premium',
          session_status: 'pending',
          price: paymentMethod === "sponsored" ? 0 : sessionFee
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Process payment based on method
      if (paymentMethod === "credits") {
        // Deduct credits from wallet
        const { error: walletError } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: creditsRequired,
          p_description: `Mentoring session with ${mentor.title}`,
          p_reference_id: session.id
        });

        if (walletError) throw walletError;
      } else if (paymentMethod === "card") {
        // Simulate Stripe payment
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      // Sponsored members get free access

      toast({
        title: "Booking Confirmed! 🎉",
        description: paymentMethod === "credits" 
          ? `Session booked using ${creditsRequired} Kumii Credits.`
          : paymentMethod === "sponsored"
          ? "Session booked through your sponsored programme."
          : "Your mentoring session has been booked successfully."
      });

      onComplete();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Payment Method</h2>
        <p className="text-muted-foreground">Select how you'd like to pay for this session</p>
      </div>

      {/* Payment Method Selection */}
      <Card>
        <CardContent className="pt-6">
          <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <div className="space-y-4">
              {/* Kumii Credits Option */}
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                paymentMethod === "credits" ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <RadioGroupItem value="credits" id="credits" disabled={creditBalance < creditsRequired} />
                <Label htmlFor="credits" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">Kumii Credits</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay with {creditsRequired} credits
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Available: {creditBalance} credits
                  </p>
                  {creditBalance < creditsRequired && (
                    <p className="text-sm text-destructive mt-1">Insufficient credits</p>
                  )}
                </Label>
              </div>

              {/* Sponsored Programme Option */}
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                paymentMethod === "sponsored" ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <RadioGroupItem value="sponsored" id="sponsored" disabled={!isSponsoredMember} />
                <Label htmlFor="sponsored" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Sponsored Programme</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isSponsoredMember 
                      ? "Free access as a sponsored member"
                      : "Join a sponsored cohort for free access"
                    }
                  </p>
                  {isSponsoredMember && (
                    <p className="text-sm font-medium text-green-600 mt-1">✓ Active member</p>
                  )}
                </Label>
              </div>

              {/* Credit Card Option */}
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
              }`}>
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Credit Card</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay ${sessionFee} with card
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Details Based on Method */}
      {paymentMethod === "card" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Session Fee</span>
                  <span>${sessionFee}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${sessionFee}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Pay with</Label>
                <div className="flex items-center gap-2 mt-2 p-3 border rounded-md">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Credit Card</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Secure payment powered by Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {paymentMethod === "credits" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div>
                  <p className="font-semibold">Credits Required</p>
                  <p className="text-sm text-muted-foreground">For this mentoring session</p>
                </div>
                <div className="text-2xl font-bold">{creditsRequired}</div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Your Balance</p>
                  <p className="text-sm text-muted-foreground">Available credits</p>
                </div>
                <div className="text-2xl font-bold">{creditBalance}</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div>
                  <p className="font-semibold">Remaining Balance</p>
                  <p className="text-sm text-muted-foreground">After this session</p>
                </div>
                <div className="text-2xl font-bold">{creditBalance - creditsRequired}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === "sponsored" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Gift className="w-16 h-16 mx-auto text-green-600" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Sponsored Access</h3>
                <p className="text-muted-foreground">
                  This session is covered by your sponsored programme membership. No payment required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handlePayment} 
          disabled={isProcessing || (paymentMethod === "credits" && creditBalance < creditsRequired) || (paymentMethod === "sponsored" && !isSponsoredMember)}
          className="flex-1 bg-green-600 hover:bg-green-700" 
          size="lg"
        >
          {isProcessing ? "Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
};

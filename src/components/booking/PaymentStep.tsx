import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookingData } from "./BookSessionDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { BookingSummaryBanner } from "./BookingSummaryBanner";
import { Wallet, Gift, CreditCard, Ticket } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface PaymentStepProps {
  mentor: any;
  bookingData: BookingData;
  onBack: () => void;
  onComplete: () => void;
}

export const PaymentStep = ({ mentor, bookingData, onBack, onComplete }: PaymentStepProps) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"credits" | "sponsored" | "card" | "voucher">("sponsored");
  const [creditBalance, setCreditBalance] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<string>("");

  const availableCohorts = [
    { id: "aws", name: "AWS Cohort" },
    { id: "microsoft", name: "Microsoft Cohort" },
    { id: "african-bank", name: "African Bank Cohort" },
    { id: "wr-seta", name: "W&R SETA Cohort" },
    { id: "asupol", name: "ASUPOL Cohort" }
  ];

  useEffect(() => {
    const fetchPaymentOptions = async () => {
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
    };

    fetchPaymentOptions();
  }, [user]);

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toast.error("Please enter a voucher code");
      return;
    }
    
    // Demo voucher logic - in production this would validate against a database
    const validVouchers: Record<string, number> = {
      "FIRST10": 10,
      "MENTOR20": 20,
      "STARTUP50": 50
    };
    
    const discount = validVouchers[voucherCode.toUpperCase()];
    
    if (discount) {
      setAppliedVoucher({ code: voucherCode.toUpperCase(), discount });
      toast.success(`Voucher applied! ${discount}% discount`);
    } else {
      toast.error("Invalid voucher code");
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please log in to complete booking");
      return;
    }

    if (paymentMethod === "sponsored" && !selectedCohort) {
      toast.error("Please select a sponsored programme");
      return;
    }

    const sessionFee = mentor.session_fee || 100;
    const creditsRequired = Math.ceil(sessionFee / 10);
    const finalCredits = appliedVoucher 
      ? Math.ceil(creditsRequired * (1 - appliedVoucher.discount / 100))
      : creditsRequired;

    if (paymentMethod === "credits" && creditBalance < finalCredits) {
      toast.error("Insufficient Kumii Credits");
      return;
    }

    setIsProcessing(true);

    try {
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

      // Send booking notification email to mentor
      try {
        const { data: mentorProfile } = await supabase
          .from('profiles')
          .select('email, first_name')
          .eq('user_id', mentor.user_id)
          .single();

        const { data: menteeProfile } = await supabase
          .from('profiles')
          .select('email, first_name')
          .eq('user_id', user.id)
          .single();

        if (mentorProfile?.email && menteeProfile?.email) {
          await supabase.functions.invoke('send-booking-email', {
            body: {
              type: 'booking_created',
              mentorEmail: mentorProfile.email,
              mentorName: mentor.title || mentorProfile.first_name,
              menteeEmail: menteeProfile.email,
              menteeName: menteeProfile.first_name,
              sessionDate: bookingData.date?.toLocaleDateString() || 'TBD',
              sessionTime: bookingData.timeSlot || 'TBD',
              sessionType: bookingData.sessionType || 'Premium',
              message: bookingData.message
            }
          });
          console.log('Booking notification email sent to mentor');
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the booking if email fails
      }

      // Process payment based on method
      if (paymentMethod === "credits" || paymentMethod === "voucher") {
        // Deduct credits from wallet
        const { error: walletError } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: finalCredits,
          p_description: `Mentoring session with ${mentor.title}${appliedVoucher ? ` (Voucher: ${appliedVoucher.code})` : ''}`,
          p_reference_id: session.id
        });

        if (walletError) throw walletError;
      }

      const cohortName = availableCohorts.find(c => c.id === selectedCohort)?.name || "sponsored programme";
      
      toast.success(
        paymentMethod === "credits" || paymentMethod === "voucher"
          ? `Booking Confirmed! ${finalCredits} credits used.`
          : `Booking Confirmed! Session booked through ${cohortName}.`
      );

      onComplete();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const sessionFee = mentor.session_fee || 100;
  const creditsRequired = Math.ceil(sessionFee / 10);
  const discount = appliedVoucher ? Math.ceil(creditsRequired * appliedVoucher.discount / 100) : 0;
  const finalCredits = creditsRequired - discount;

  return (
    <div className="space-y-6">
      <BookingSummaryBanner mentor={mentor} bookingData={bookingData} />
      
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Payment Options</h2>
          <p className="text-lg font-semibold">Final Balance: {finalCredits} Credits (R{finalCredits * 10})</p>
        </div>

        {/* Payment Method Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              if (appliedVoucher) setPaymentMethod("voucher");
            }}
            disabled={!appliedVoucher}
            className={cn(
              "flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all hover:shadow-md",
              paymentMethod === "voucher" && appliedVoucher ? "border-primary bg-primary/5" : "border-border",
              !appliedVoucher && "opacity-50 cursor-not-allowed"
            )}
          >
            <Ticket className="w-8 h-8 text-primary" />
            <span className="font-semibold text-sm">Voucher</span>
          </button>

          <button
            onClick={() => setPaymentMethod("credits")}
            disabled={creditBalance < finalCredits}
            className={cn(
              "flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all hover:shadow-md",
              paymentMethod === "credits" ? "border-primary bg-primary/5" : "border-border",
              creditBalance < finalCredits && "opacity-50 cursor-not-allowed"
            )}
          >
            <Wallet className="w-8 h-8 text-primary" />
            <span className="font-semibold text-sm">Kumii Credits</span>
            <span className="text-xs text-muted-foreground">{creditBalance} available</span>
          </button>

          <button
            onClick={() => setPaymentMethod("sponsored")}
            className={cn(
              "flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all hover:shadow-md",
              paymentMethod === "sponsored" ? "border-success bg-success/5" : "border-border"
            )}
          >
            <Gift className={cn("w-8 h-8", paymentMethod === "sponsored" ? "text-success" : "text-primary")} />
            <span className="font-semibold text-sm">Sponsored</span>
          </button>

          <button
            onClick={() => setPaymentMethod("card")}
            disabled
            className="flex flex-col items-center gap-3 p-6 border-2 rounded-lg opacity-50 cursor-not-allowed"
          >
            <CreditCard className="w-8 h-8 text-primary" />
            <span className="font-semibold text-sm">Card / EFT</span>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </button>
        </div>

        {/* Sponsored Programme Selector */}
        {paymentMethod === "sponsored" && (
          <div className="border rounded-lg p-6 space-y-4 bg-primary/5">
            <Label className="text-lg font-semibold">Select Your Sponsored Programme</Label>
            <RadioGroup value={selectedCohort} onValueChange={setSelectedCohort}>
              <div className="grid gap-3">
                {availableCohorts.map((cohort) => (
                  <div
                    key={cohort.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                      selectedCohort === cohort.id ? "border-primary bg-background shadow-sm" : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedCohort(cohort.id)}
                  >
                    <RadioGroupItem value={cohort.id} id={cohort.id} />
                    <Label htmlFor={cohort.id} className="flex-1 cursor-pointer font-medium">
                      {cohort.name}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Voucher Section */}
        <div className="border rounded-lg p-6 space-y-4">
          <Label>Have a voucher code?</Label>
          <div className="flex gap-3">
            <Input
              placeholder="Enter Voucher Code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              disabled={!!appliedVoucher}
              className="flex-1"
            />
            <Button
              onClick={handleApplyVoucher}
              variant="default"
              disabled={!!appliedVoucher || !voucherCode.trim()}
            >
              {appliedVoucher ? "Applied" : "Apply Voucher"}
            </Button>
          </div>
          {appliedVoucher && (
            <p className="text-sm text-success-foreground">
              ✓ Voucher "{appliedVoucher.code}" applied - {appliedVoucher.discount}% discount
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Try: FIRST10, MENTOR20, or STARTUP50
          </p>
        </div>

        {/* Payment Summary */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b">
            <h3 className="font-semibold text-lg">Payment Summary</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-sm font-medium">
                  <th className="text-left pb-2">ITEM</th>
                  <th className="text-right pb-2">FEE</th>
                  <th className="text-right pb-2">CREDIT</th>
                  <th className="text-right pb-2">VOUCHER</th>
                  <th className="text-right pb-2">AMOUNT DUE</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4">Session</td>
                  <td className="text-right font-semibold">{creditsRequired}</td>
                  <td className="text-right">-</td>
                  <td className="text-right text-success-foreground">{appliedVoucher ? `-${discount}` : '-'}</td>
                  <td className="text-right font-semibold">{finalCredits}</td>
                </tr>
              </tbody>
            </table>
            
            {paymentMethod === "credits" && creditBalance >= finalCredits && (
              <div className="pt-3 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Credit Balance</span>
                  <span className="font-medium">{creditBalance}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Remaining Balance</span>
                  <span className="font-semibold">{creditBalance - finalCredits}</span>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-lg">Balance Due</span>
              <span className="text-2xl font-bold">{finalCredits} Credits</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handlePayment}
            disabled={
              isProcessing || 
              (paymentMethod === "credits" && creditBalance < finalCredits) ||
              (paymentMethod === "sponsored" && !selectedCohort) ||
              (paymentMethod === "card") ||
              (paymentMethod === "voucher" && (!appliedVoucher || creditBalance < finalCredits))
            }
            size="lg"
            className="flex-1 bg-success hover:bg-success/90"
          >
            {isProcessing ? "Processing..." : "Process Transaction"}
          </Button>
        </div>
      </div>
    </div>
  );
};

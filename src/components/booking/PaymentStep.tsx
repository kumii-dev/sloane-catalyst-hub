import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { BookingData } from "./BookSessionDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentStepProps {
  mentor: any;
  bookingData: BookingData;
  onBack: () => void;
  onComplete: () => void;
}

export const PaymentStep = ({ mentor, bookingData, onBack, onComplete }: PaymentStepProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const sessionFee = mentor.session_fee || 100;
  const currency = "USD";
  const localAmount = sessionFee; // In production, convert currency

  const handlePayment = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get current user
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
          price: sessionFee
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // In production, integrate with Stripe here
      // For now, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Booking Confirmed! 🎉",
        description: "Your mentoring session has been booked successfully. Check your email for details."
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
        <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
        <p className="text-muted-foreground">Secure payment powered by Stripe</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Choose a currency:</h3>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  🇿🇦 ZAR {(localAmount * 21.1).toFixed(2)}
                </Button>
                <Button variant="outline" className="flex-1">
                  🇪🇺 €{localAmount.toFixed(2)}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                1 EUR = 21.1005 ZAR (includes 3.75% conversion fee)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-10 h-10" />
                <div>
                  <div className="font-semibold">Mentoring Fee - {sessionFee}</div>
                  <div className="text-sm text-muted-foreground">
                    This is the Mentoring Fee defined by your Mentor for the Mentoring Session Type you chose. This amount...
                  </div>
                  <div className="text-sm">Qty 10</div>
                </div>
                <div className="ml-auto font-bold">
                  {currency} {localAmount.toFixed(2)}
                </div>
              </div>

              <div className="text-sm border-t pt-2">
                <div className="flex justify-between">
                  <span>ZAR {(localAmount * 21.1).toFixed(2)} each</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>{currency} {localAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ℹ</span>
                  <span>{currency} 0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total due</span>
                  <span>{currency} {localAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nkambumw@gmail.com"
                />
              </div>

              <div>
                <Label>Pay with</Label>
                <div className="flex items-center gap-2 mt-2 p-3 border rounded-md">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Signature Debit</span>
                  <span className="ml-auto text-muted-foreground">•••• 2028</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" id="amex" className="rounded" />
                <label htmlFor="amex">
                  If declined, use American Express •••• 2104
                </label>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700" 
                size="lg"
              >
                {isProcessing ? "Processing..." : "Book"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By confirming your payment, you allow 11 Mentors to charge you for this payment 
                and future payments in accordance with their terms.
              </p>

              <Button variant="link" onClick={onBack} className="w-full">
                Pay without Link
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Powered by <span className="font-semibold">stripe</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

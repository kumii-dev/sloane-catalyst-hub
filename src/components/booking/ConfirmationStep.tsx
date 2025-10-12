import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { BookingData } from "./BookSessionDialog";
import { BookingSummaryBanner } from "./BookingSummaryBanner";

interface ConfirmationStepProps {
  mentor: any;
  bookingData: BookingData;
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

export const ConfirmationStep = ({ mentor, bookingData, onNext, onBack }: ConfirmationStepProps) => {
  const sessionFee = mentor.session_fee || 100;
  const platformFee = sessionFee * ((mentor.platform_fee_percentage || 25) / 100);
  const mentorReceives = sessionFee - platformFee;

  const handleProceed = () => {
    onNext({});
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <BookingSummaryBanner mentor={mentor} bookingData={bookingData} />
      
      <div className="text-center space-y-4 py-6">
        <h2 className="text-3xl font-bold">Confirm Your Booking</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Review your session details and proceed to secure payment.
        </p>
      </div>

      <Card className="shadow-soft border-2">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-lg font-medium">Total Amount</span>
            <span className="text-4xl font-bold text-primary">R{sessionFee}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Mentor receives (75%)</span>
              <span className="font-medium text-foreground">R{mentorReceives.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform fee (25%)</span>
              <span className="font-medium text-foreground">R{platformFee.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-4 border-t bg-muted/30 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <Shield className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium">Protected Booking</div>
              <div className="text-muted-foreground">
                Full refund if mentor cancels or doesn't show • 24-hour cancellation policy
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleProceed}
          className="flex-1 h-12 text-base bg-success hover:bg-success/90"
          size="lg"
        >
          Confirm & Pay
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12"
          size="lg"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

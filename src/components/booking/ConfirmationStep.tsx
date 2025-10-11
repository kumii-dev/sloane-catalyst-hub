import { Button } from "@/components/ui/button";
import { BookingData } from "./BookSessionDialog";

interface ConfirmationStepProps {
  mentor: any;
  bookingData: BookingData;
  onNext: () => void;
  onBack: () => void;
}

export const ConfirmationStep = ({ mentor, bookingData, onNext, onBack }: ConfirmationStepProps) => {
  const sessionFee = mentor.session_fee || 100;
  const platformFee = sessionFee * ((mentor.platform_fee_percentage || 25) / 100);
  const mentorReceives = sessionFee - platformFee;

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <h2 className="text-3xl font-bold text-center">Confirm Your Choice</h2>
      
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          You're booking a professional mentoring session.
        </p>
        
        <div className="text-2xl font-bold">
          Session fee: ${sessionFee}
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-center gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Mentor receives: ${mentorReceives.toFixed(0)} (75%)</span>
          </div>
          <div className="flex justify-center gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Platform fee: ${platformFee.toFixed(0)} (25%)</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 space-y-3">
        <div className="font-semibold">Refund Policy:</div>
        <p className="text-sm text-muted-foreground">
          Full refund if mentor doesn't show or cancels within 24 hours.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onNext}
          className="flex-1 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          ✓ Yes, Proceed
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
          size="lg"
        >
          ↻ Go Back
        </Button>
      </div>
    </div>
  );
};

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CalendarStep } from "./CalendarStep";
import { TimeSlotStep } from "./TimeSlotStep";
import { BookingDetailsStep } from "./BookingDetailsStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { PaymentStep } from "./PaymentStep";

type BookingStep = "calendar" | "timeslot" | "details" | "confirmation" | "payment";

interface BookSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: any;
}

export interface BookingData {
  date: Date | null;
  timeSlot: string | null;
  message: string;
  sessionType: string;
}

export const BookSessionDialog = ({ open, onOpenChange, mentor }: BookSessionDialogProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>("calendar");
  const [bookingData, setBookingData] = useState<BookingData>({
    date: null,
    timeSlot: null,
    message: "",
    sessionType: "professional"
  });

  const handleNext = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
    
    if (currentStep === "calendar") setCurrentStep("timeslot");
    else if (currentStep === "timeslot") setCurrentStep("details");
    else if (currentStep === "details") setCurrentStep("confirmation");
    else if (currentStep === "confirmation") setCurrentStep("payment");
  };

  const handleBack = () => {
    if (currentStep === "timeslot") setCurrentStep("calendar");
    else if (currentStep === "details") setCurrentStep("timeslot");
    else if (currentStep === "confirmation") setCurrentStep("details");
    else if (currentStep === "payment") setCurrentStep("confirmation");
  };

  const handleClose = () => {
    setCurrentStep("calendar");
    setBookingData({ date: null, timeSlot: null, message: "", sessionType: "professional" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {currentStep === "calendar" && (
          <CalendarStep 
            mentor={mentor}
            onNext={handleNext}
            onClose={handleClose}
          />
        )}
        
        {currentStep === "timeslot" && (
          <TimeSlotStep 
            mentor={mentor}
            selectedDate={bookingData.date!}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === "details" && (
          <BookingDetailsStep 
            mentor={mentor}
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === "confirmation" && (
          <ConfirmationStep 
            mentor={mentor}
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        
        {currentStep === "payment" && (
          <PaymentStep 
            mentor={mentor}
            bookingData={bookingData}
            onBack={handleBack}
            onComplete={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

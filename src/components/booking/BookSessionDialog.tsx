import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CalendarStep } from "./CalendarStep";
import { TimeSlotStep } from "./TimeSlotStep";
import { BookingDetailsStep } from "./BookingDetailsStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { PaymentStep } from "./PaymentStep";
import { BookingProgressStepper } from "./BookingProgressStepper";
import { BookingTimer } from "./BookingTimer";
import { toast } from "sonner";

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

  const handleTimeout = () => {
    toast.error("Booking session expired. Please start again.");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 w-full">
        <BookingProgressStepper currentStep={currentStep} />
        
        <div className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-center justify-center sm:justify-end gap-2 mb-4 flex-wrap">
            <p className="text-xs sm:text-sm text-muted-foreground font-bold text-center sm:text-left">
              We time your booking session to prevent conflicts and double bookings
            </p>
            <BookingTimer onTimeout={handleTimeout} initialMinutes={10} />
          </div>
          
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

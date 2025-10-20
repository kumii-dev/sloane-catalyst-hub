import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type BookingStep = "calendar" | "timeslot" | "details" | "confirmation" | "payment";

interface Step {
  id: BookingStep;
  label: string;
}

interface BookingProgressStepperProps {
  currentStep: BookingStep;
}

const steps: Step[] = [
  { id: "calendar", label: "SELECT DATE" },
  { id: "timeslot", label: "SELECT TIME" },
  { id: "details", label: "SESSION DETAILS" },
  { id: "confirmation", label: "REVIEW" },
  { id: "payment", label: "PAYMENT" },
];

export const BookingProgressStepper = ({ currentStep }: BookingProgressStepperProps) => {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-4 px-2 sm:py-6 sm:px-4 bg-muted/30 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-0 flex-shrink">
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20",
                      isUpcoming && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <span className="text-sm sm:text-base">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] sm:text-xs font-medium text-center max-w-[60px] sm:max-w-none leading-tight",
                      (isCompleted || isCurrent) && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.label.split(' ')[0]}</span>
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-0.5 sm:mx-2 transition-all min-w-[8px]",
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

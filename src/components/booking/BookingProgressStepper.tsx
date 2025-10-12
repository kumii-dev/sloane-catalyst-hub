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
    <div className="w-full py-6 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isUpcoming && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center whitespace-nowrap",
                      (isCompleted || isCurrent) && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-all",
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

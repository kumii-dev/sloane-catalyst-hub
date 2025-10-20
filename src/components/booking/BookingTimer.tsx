import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingTimerProps {
  onTimeout?: () => void;
  initialMinutes?: number;
}

export const BookingTimer = ({ onTimeout, initialMinutes = 3 }: BookingTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // in seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 120; // Less than 2 minutes

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card border rounded-lg">
      <Clock className={cn("w-5 h-5", isUrgent && "text-destructive animate-pulse")} />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Booking Time Left</span>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isUrgent && "text-destructive"
            )}
          >
            {minutes}
          </span>
          <span className="text-xs text-muted-foreground">MIN</span>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isUrgent && "text-destructive"
            )}
          >
            {seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">SEC</span>
        </div>
      </div>
    </div>
  );
};

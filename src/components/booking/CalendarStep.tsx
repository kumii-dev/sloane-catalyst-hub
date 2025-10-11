import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { BookingData } from "./BookSessionDialog";

interface CalendarStepProps {
  mentor: any;
  onNext: (data: Partial<BookingData>) => void;
  onClose: () => void;
}

export const CalendarStep = ({ mentor, onNext }: CalendarStepProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Mock available dates - in production, fetch from mentor_availability
  const availableDates = new Set([
    format(new Date(2025, 9, 15), 'yyyy-MM-dd'),
    format(new Date(2025, 9, 17), 'yyyy-MM-dd'),
    format(new Date(2025, 9, 18), 'yyyy-MM-dd'),
    format(new Date(2025, 9, 22), 'yyyy-MM-dd'),
    format(new Date(2025, 9, 24), 'yyyy-MM-dd'),
    format(new Date(2025, 9, 25), 'yyyy-MM-dd'),
  ]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && availableDates.has(format(date, 'yyyy-MM-dd'))) {
      setSelectedDate(date);
      onNext({ date });
    }
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.has(format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1">
            <Star className="w-4 h-4 mr-1 fill-current" />
            PROFESSIONAL SESSION
          </Badge>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">
          Select date for: Leadership Coaching
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>(Change)</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span>🎓 Premium mentoring experience</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => !isDateAvailable(date)}
          modifiers={{
            available: (date) => isDateAvailable(date)
          }}
          modifiersStyles={{
            available: { backgroundColor: 'hsl(var(--primary) / 0.2)' }
          }}
          className="border rounded-lg"
          numberOfMonths={2}
        />
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Available dates are highlighted
      </div>
    </div>
  );
};

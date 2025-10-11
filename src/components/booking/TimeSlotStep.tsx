import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";
import { BookingData } from "./BookSessionDialog";

interface TimeSlotStepProps {
  mentor: any;
  selectedDate: Date;
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

export const TimeSlotStep = ({ mentor, selectedDate, onNext, onBack }: TimeSlotStepProps) => {
  const [selectedTime, setSelectedTime] = useState<string>();

  // Mock time slots - in production, fetch from mentor availability
  const timeSlots = {
    "17:00 - 17:59": ["17:30", "17:45"],
    "18:00 - 18:59": ["18:00", "18:15", "18:30"]
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onNext({ timeSlot: time });
  };

  const sessionFee = mentor.session_fee || 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1">
          <Star className="w-4 h-4 mr-1 fill-current" />
          PROFESSIONAL SESSION
        </Badge>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Leadership Coaching</h2>
          <p className="text-muted-foreground">
            with {mentor.profiles?.first_name} on {format(selectedDate, 'EEEE, MMMM d')}
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            🎓 Premium mentoring experience with dedicated expertise and personalized guidance
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-2xl font-bold">${sessionFee}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Select an Available Time</h3>
        
        <div className="space-y-6">
          {Object.entries(timeSlots).map(([range, times]) => (
            <div key={range}>
              <h4 className="font-medium mb-3">{range}</h4>
              <div className="grid grid-cols-3 gap-3">
                {times.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="text-lg py-6"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

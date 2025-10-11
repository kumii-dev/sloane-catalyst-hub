import React, { useState, useEffect } from "react";
import { format, getDay, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X, Loader2 } from "lucide-react";
import { BookingData } from "./BookSessionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimeSlotStepProps {
  mentor: any;
  selectedDate: Date;
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

export const TimeSlotStep = ({ mentor, selectedDate, onNext, onBack }: TimeSlotStepProps) => {
  const [selectedTime, setSelectedTime] = useState<string>();
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (mentor?.id && selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [mentor?.id, selectedDate]);

  const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes: number = 30) => {
    const slots: string[] = [];
    const start = parse(startTime, 'HH:mm:ss', new Date());
    const end = parse(endTime, 'HH:mm:ss', new Date());
    
    let current = start;
    while (current < end) {
      slots.push(format(current, 'HH:mm'));
      current = new Date(current.getTime() + intervalMinutes * 60000);
    }
    
    return slots;
  };

  const fetchAvailableTimeSlots = async () => {
    try {
      setLoading(true);
      const dayOfWeek = getDay(selectedDate); // 0 = Sunday, 1 = Monday, etc.
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Check for date-specific override first
      const { data: override } = await supabase
        .from('mentor_date_overrides')
        .select('*')
        .eq('mentor_id', mentor.id)
        .eq('date', dateStr)
        .maybeSingle();

      let availableSlots: string[] = [];

      if (override && override.is_available) {
        // Use override times if available
        if (override.start_time && override.end_time) {
          availableSlots = generateTimeSlots(override.start_time, override.end_time);
        }
      } else if (!override) {
        // Use recurring weekly availability
        const { data: availability, error: availError } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('mentor_id', mentor.id)
          .eq('day_of_week', dayOfWeek)
          .eq('is_active', true)
          .maybeSingle();

        if (availError) throw availError;

        if (availability) {
          availableSlots = generateTimeSlots(availability.start_time, availability.end_time);
        }
      }

      // Fetch already booked sessions for this date
      const { data: bookedSessions, error: sessionsError } = await supabase
        .from('mentoring_sessions')
        .select('scheduled_at')
        .eq('mentor_id', mentor.id)
        .in('session_status', ['pending', 'confirmed'])
        .gte('scheduled_at', `${dateStr}T00:00:00`)
        .lte('scheduled_at', `${dateStr}T23:59:59`);

      if (sessionsError) throw sessionsError;

      // Filter out booked time slots
      const bookedTimes = new Set(
        bookedSessions?.map(session => 
          format(new Date(session.scheduled_at), 'HH:mm')
        ) || []
      );

      const filteredSlots = availableSlots.filter(slot => !bookedTimes.has(slot));
      
      setTimeSlots(filteredSlots);

      if (filteredSlots.length === 0) {
        toast({
          title: "No time slots available",
          description: "All slots are booked for this date. Please select another date.",
        });
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Failed to load available time slots. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onNext({ timeSlot: time });
  };

  const sessionFee = mentor.session_fee || 100;

  if (loading) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading available time slots...</p>
        </div>
        <Button variant="outline" onClick={onBack} className="w-full">
          Back to Calendar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1">
          <Star className="w-4 h-4 mr-1 fill-current" />
          {mentor.is_premium ? 'PREMIUM SESSION' : 'PROFESSIONAL SESSION'}
        </Badge>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Mentoring Session</h2>
          <p className="text-muted-foreground">
            with {mentor.profiles?.first_name} {mentor.profiles?.last_name} on {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            🎓 {mentor.is_premium ? 'Premium' : 'Professional'} mentoring experience with dedicated expertise
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-2xl font-bold">${sessionFee}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">per session</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Select an Available Time</h3>
        
        {timeSlots.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-lg text-muted-foreground mb-2">
              No time slots available
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              All slots are booked for this date
            </p>
            <Button variant="outline" onClick={onBack}>
              Choose Another Date
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
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
        )}
      </div>

      {timeSlots.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          All times shown in your local timezone
        </div>
      )}
    </div>
  );
};

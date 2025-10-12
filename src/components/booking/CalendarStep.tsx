import React, { useState, useEffect } from "react";
import { format, addDays, startOfDay, isBefore, getDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2 } from "lucide-react";
import { BookingData } from "./BookSessionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CalendarStepProps {
  mentor: any;
  onNext: (data: Partial<BookingData>) => void;
  onClose: () => void;
}

export const CalendarStep = ({ mentor, onNext }: CalendarStepProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (mentor?.id) {
      fetchMentorAvailability();
    }
  }, [mentor?.id]);

  const fetchMentorAvailability = async () => {
    try {
      setLoading(true);
      
      // Fetch mentor's recurring weekly availability
      const { data: availability, error: availError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentor.id)
        .eq('is_active', true);

      if (availError) throw availError;

      // Fetch date-specific overrides
      const { data: overrides, error: overrideError } = await supabase
        .from('mentor_date_overrides')
        .select('*')
        .eq('mentor_id', mentor.id)
        .gte('date', format(new Date(), 'yyyy-MM-dd'));

      if (overrideError) throw overrideError;

      // Fetch already booked sessions
      const { data: bookedSessions, error: sessionsError } = await supabase
        .from('mentoring_sessions')
        .select('scheduled_at')
        .eq('mentor_id', mentor.id)
        .in('session_status', ['pending', 'confirmed'])
        .gte('scheduled_at', new Date().toISOString());

      if (sessionsError) throw sessionsError;

      // Generate available dates for next 60 days
      const availDates = new Set<string>();
      const today = startOfDay(new Date());
      const daysToGenerate = 60;

      for (let i = 0; i < daysToGenerate; i++) {
        const checkDate = addDays(today, i);
        const dayOfWeek = getDay(checkDate); // 0 = Sunday, 1 = Monday, etc.
        const dateStr = format(checkDate, 'yyyy-MM-dd');

        // Check if date is in the past
        if (isBefore(checkDate, today)) continue;

        // Check for date-specific override
        const override = overrides?.find(o => o.date === dateStr);
        if (override) {
          // If override exists and is_available is true, add it
          if (override.is_available) {
            availDates.add(dateStr);
          }
          // If is_available is false, skip this date
          continue;
        }

        // Check recurring weekly availability
        const dayAvailability = availability?.find(a => a.day_of_week === dayOfWeek);
        if (dayAvailability) {
          // Check if this specific date/time is already booked
          const isBooked = bookedSessions?.some(session => {
            const sessionDate = format(new Date(session.scheduled_at), 'yyyy-MM-dd');
            return sessionDate === dateStr;
          });

          if (!isBooked) {
            availDates.add(dateStr);
          }
        }
      }

      setAvailableDates(availDates);
      
      if (availDates.size === 0) {
        toast({
          title: "No availability",
          description: "This mentor has no available slots in the next 60 days.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching mentor availability:', error);
      toast({
        title: "Error",
        description: "Failed to load mentor availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && availableDates.has(format(date, 'yyyy-MM-dd'))) {
      setSelectedDate(date);
      onNext({ date });
    }
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.has(format(date, 'yyyy-MM-dd'));
  };

  if (loading) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading mentor availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1">
            <Star className="w-4 h-4 mr-1 fill-current" />
            {mentor.is_premium ? 'PREMIUM SESSION' : 'PROFESSIONAL SESSION'}
          </Badge>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">
          Select date for mentoring session
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>with {mentor.profiles?.first_name} {mentor.profiles?.last_name}</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span>🎓 {mentor.is_premium ? 'Premium' : 'Professional'} mentoring experience</span>
        </div>
      </div>

      {availableDates.size === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">
            No available slots at the moment
          </p>
          <p className="text-sm text-muted-foreground">
            Please check back later or contact the mentor directly
          </p>
        </div>
      ) : (
        <>
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
                available: { backgroundColor: 'hsl(var(--success) / 0.15)' }
              }}
              className="border rounded-lg pointer-events-auto"
              numberOfMonths={2}
            />
          </div>

          <div className="text-sm text-muted-foreground text-center space-y-1">
            <p>✨ Available dates are highlighted</p>
            <p className="text-xs">Showing availability for the next 60 days</p>
          </div>
        </>
      )}
    </div>
  );
};

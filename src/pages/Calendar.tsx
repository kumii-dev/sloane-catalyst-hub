import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isSameDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  type: "session" | "event" | "meeting";
  status?: string;
  location?: string;
  meeting_link?: string;
  participants?: string[];
  color: string;
}

const Calendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    if (user) {
      fetchCalendarEvents();
    }
  }, [user, currentMonth]);

  const fetchCalendarEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const allEvents: CalendarEvent[] = [];

      // Fetch mentoring sessions
      const { data: sessions } = await supabase
        .from("mentoring_sessions")
        .select(`
          id,
          title,
          scheduled_at,
          duration_minutes,
          session_status,
          meeting_link,
          mentor:mentors(title, company),
          mentee_id
        `)
        .or(`mentee_id.eq.${user.id}`)
        .gte("scheduled_at", monthStart.toISOString())
        .lte("scheduled_at", monthEnd.toISOString())
        .order("scheduled_at", { ascending: true });

      if (sessions) {
        allEvents.push(
          ...sessions.map((session) => ({
            id: session.id,
            title: session.title,
            description: `Mentorship session with ${session.mentor?.title || "mentor"}`,
            start_time: session.scheduled_at,
            end_time: new Date(
              new Date(session.scheduled_at).getTime() + (session.duration_minutes || 60) * 60000
            ).toISOString(),
            type: "session" as const,
            status: session.session_status,
            meeting_link: session.meeting_link,
            color: "bg-primary/10 border-primary",
          }))
        );
      }

      // Fetch registered events
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event:events(
            id,
            title,
            start_date,
            end_date,
            location,
            is_virtual,
            meeting_link
          )
        `)
        .eq("user_id", user.id)
        .eq("registration_status", "registered");

      if (registrations) {
        allEvents.push(
          ...registrations
            .filter((reg) => reg.event)
            .map((reg) => ({
              id: reg.event!.id,
              title: reg.event!.title,
              description: reg.event!.is_virtual ? "Virtual Event" : "In-person Event",
              start_time: reg.event!.start_date,
              end_time: reg.event!.end_date,
              type: "event" as const,
              location: reg.event!.location,
              meeting_link: reg.event!.meeting_link,
              color: "bg-success/10 border-success",
            }))
        );
      }

      // Sort events by start time
      allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.start_time), date));
  };

  const getEventsForSelectedDate = () => {
    return getEventsForDate(selectedDate);
  };

  const getDatesWithEvents = () => {
    return events.map((event) => parseISO(event.start_time));
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === "session") {
      navigate("/mentee-dashboard");
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const upcomingEvents = events.filter(
    (event) => new Date(event.start_time) >= new Date()
  ).slice(0, 5);

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage all your scheduled activities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {format(currentMonth, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMonthChange("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentMonth(new Date());
                        setSelectedDate(new Date());
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMonthChange("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  modifiers={{
                    hasEvents: getDatesWithEvents(),
                  }}
                  modifiersClassNames={{
                    hasEvents: "bg-primary/20 font-bold",
                  }}
                  className="rounded-md border"
                />

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Mentoring Sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>Events</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events for Selected Date */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </CardTitle>
                <CardDescription>
                  {getEventsForSelectedDate().length === 0
                    ? "No events scheduled"
                    : `${getEventsForSelectedDate().length} event${
                        getEventsForSelectedDate().length > 1 ? "s" : ""
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading events...
                    </div>
                  ) : getEventsForSelectedDate().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No events scheduled for this day</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getEventsForSelectedDate().map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg border-l-4 ${event.color} cursor-pointer hover:bg-muted/50 transition-colors`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            {event.status && (
                              <Badge variant={getStatusColor(event.status) as any}>
                                {event.status}
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(parseISO(event.start_time), "h:mm a")}
                              {event.end_time &&
                                ` - ${format(parseISO(event.end_time), "h:mm a")}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                            {event.meeting_link && (
                              <a
                                href={event.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Video className="h-4 w-4" />
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your next scheduled activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading...
                    </div>
                  ) : upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No upcoming events</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border ${event.color} cursor-pointer hover:bg-muted/50 transition-colors`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            {event.status && (
                              <Badge variant={getStatusColor(event.status) as any} className="text-xs">
                                {event.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(parseISO(event.start_time), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(event.start_time), "h:mm a")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;

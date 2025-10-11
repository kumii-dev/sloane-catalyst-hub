import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

interface WeeklyAvailability {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface DateOverride {
  id?: string;
  date: string;
  is_available: boolean;
  start_time?: string;
  end_time?: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function MentorAvailability() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);
  
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>(
    DAYS.map((_, index) => ({
      day_of_week: index,
      start_time: "09:00:00",
      end_time: "17:00:00",
      is_active: false,
    }))
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
  const [overrideAvailable, setOverrideAvailable] = useState(true);
  const [overrideStartTime, setOverrideStartTime] = useState("09:00");
  const [overrideEndTime, setOverrideEndTime] = useState("17:00");

  useEffect(() => {
    checkMentorAndFetchAvailability();
  }, []);

  const checkMentorAndFetchAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: mentor } = await supabase
        .from("mentors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!mentor) {
        toast({
          title: "Not a mentor",
          description: "You need to be a registered mentor to access this page.",
          variant: "destructive",
        });
        navigate("/become-mentor");
        return;
      }

      setMentorId(mentor.id);
      await fetchAvailability(mentor.id);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (mentorId: string) => {
    // Fetch weekly availability
    const { data: weekly } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", mentorId);

    if (weekly && weekly.length > 0) {
      const updatedWeekly = DAYS.map((_, index) => {
        const existing = weekly.find((w) => w.day_of_week === index);
        return existing || {
          day_of_week: index,
          start_time: "09:00:00",
          end_time: "17:00:00",
          is_active: false,
        };
      });
      setWeeklyAvailability(updatedWeekly);
    }

    // Fetch date overrides
    const { data: overrides } = await supabase
      .from("mentor_date_overrides")
      .select("*")
      .eq("mentor_id", mentorId)
      .gte("date", format(new Date(), "yyyy-MM-dd"))
      .order("date", { ascending: true });

    if (overrides) {
      setDateOverrides(overrides);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    setWeeklyAvailability((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex ? { ...day, is_active: !day.is_active } : day
      )
    );
  };

  const handleTimeChange = (dayIndex: number, field: "start_time" | "end_time", value: string) => {
    setWeeklyAvailability((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex ? { ...day, [field]: `${value}:00` } : day
      )
    );
  };

  const saveWeeklyAvailability = async () => {
    if (!mentorId) return;

    setSaving(true);
    try {
      // Delete existing availability
      await supabase
        .from("mentor_availability")
        .delete()
        .eq("mentor_id", mentorId);

      // Insert active days
      const activeAvailability = weeklyAvailability
        .filter((day) => day.is_active)
        .map((day) => ({
          mentor_id: mentorId,
          day_of_week: day.day_of_week,
          start_time: day.start_time,
          end_time: day.end_time,
          is_active: true,
        }));

      if (activeAvailability.length > 0) {
        const { error } = await supabase
          .from("mentor_availability")
          .insert(activeAvailability);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Weekly availability saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save availability",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveDateOverride = async () => {
    if (!mentorId || !selectedDate) return;

    setSaving(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Check if override exists
      const { data: existing } = await supabase
        .from("mentor_date_overrides")
        .select("id")
        .eq("mentor_id", mentorId)
        .eq("date", dateStr)
        .maybeSingle();

      const overrideData = {
        mentor_id: mentorId,
        date: dateStr,
        is_available: overrideAvailable,
        start_time: overrideAvailable ? `${overrideStartTime}:00` : null,
        end_time: overrideAvailable ? `${overrideEndTime}:00` : null,
      };

      if (existing) {
        await supabase
          .from("mentor_date_overrides")
          .update(overrideData)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("mentor_date_overrides")
          .insert(overrideData);
      }

      toast({
        title: "Success",
        description: "Date override saved successfully!",
      });

      // Refresh overrides
      if (mentorId) {
        await fetchAvailability(mentorId);
      }
      setSelectedDate(undefined);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save date override",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeDateOverride = async (overrideId: string) => {
    try {
      await supabase
        .from("mentor_date_overrides")
        .delete()
        .eq("id", overrideId);

      toast({
        title: "Success",
        description: "Date override removed successfully!",
      });

      if (mentorId) {
        await fetchAvailability(mentorId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove date override",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Availability</h1>
          <p className="text-muted-foreground">
            Set your weekly schedule and manage specific date overrides
          </p>
        </div>

        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="gap-2">
              <Clock className="w-4 h-4" />
              Weekly Schedule
            </TabsTrigger>
            <TabsTrigger value="overrides" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date Overrides
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>
                  Set your regular weekly schedule. These hours will repeat every week.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyAvailability.map((day) => (
                  <div
                    key={day.day_of_week}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <Switch
                        checked={day.is_active}
                        onCheckedChange={() => handleDayToggle(day.day_of_week)}
                      />
                      <Label className="font-semibold">{DAYS[day.day_of_week]}</Label>
                    </div>

                    {day.is_active && (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">From:</Label>
                          <input
                            type="time"
                            value={day.start_time.slice(0, 5)}
                            onChange={(e) =>
                              handleTimeChange(day.day_of_week, "start_time", e.target.value)
                            }
                            className="px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">To:</Label>
                          <input
                            type="time"
                            value={day.end_time.slice(0, 5)}
                            onChange={(e) =>
                              handleTimeChange(day.day_of_week, "end_time", e.target.value)
                            }
                            className="px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  onClick={saveWeeklyAvailability}
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Weekly Schedule
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overrides" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Date Override</CardTitle>
                  <CardDescription>
                    Block specific dates or add special availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="border rounded-lg pointer-events-auto"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="font-semibold">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          checked={overrideAvailable}
                          onCheckedChange={setOverrideAvailable}
                        />
                        <Label>Available on this date</Label>
                      </div>

                      {overrideAvailable && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label className="w-16">From:</Label>
                            <input
                              type="time"
                              value={overrideStartTime}
                              onChange={(e) => setOverrideStartTime(e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="w-16">To:</Label>
                            <input
                              type="time"
                              value={overrideEndTime}
                              onChange={(e) => setOverrideEndTime(e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-md"
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={saveDateOverride}
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Override
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Overrides</CardTitle>
                  <CardDescription>
                    Your upcoming date-specific changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dateOverrides.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No date overrides set
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dateOverrides.map((override) => (
                        <div
                          key={override.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-semibold">
                              {format(new Date(override.date), "MMM d, yyyy")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {override.is_available ? (
                                <>
                                  Available: {override.start_time?.slice(0, 5)} -{" "}
                                  {override.end_time?.slice(0, 5)}
                                </>
                              ) : (
                                <span className="text-destructive">Unavailable</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => override.id && removeDateOverride(override.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

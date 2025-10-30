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
  is_available: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdvisorAvailability() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>(
    DAYS.map((_, index) => ({
      day_of_week: index,
      start_time: "09:00:00",
      end_time: "17:00:00",
      is_available: false,
    }))
  );

  useEffect(() => {
    checkAdvisorAndFetchAvailability();
  }, []);

  const checkAdvisorAndFetchAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: advisor } = await supabase
        .from("advisors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!advisor) {
        toast({
          title: "Not an advisor",
          description: "You need to be a registered advisor to access this page.",
          variant: "destructive",
        });
        navigate("/become-advisor");
        return;
      }

      setAdvisorId(advisor.id);
      await fetchAvailability(advisor.id);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (advisorId: string) => {
    const { data: weekly } = await supabase
      .from("advisor_availability")
      .select("*")
      .eq("advisor_id", advisorId);

    if (weekly && weekly.length > 0) {
      const updatedWeekly = DAYS.map((_, index) => {
        const existing = weekly.find((w) => w.day_of_week === index);
        return existing ? {
          ...existing,
          is_available: existing.is_available ?? true
        } : {
          day_of_week: index,
          start_time: "09:00:00",
          end_time: "17:00:00",
          is_available: false,
        };
      });
      setWeeklyAvailability(updatedWeekly);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    setWeeklyAvailability((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex ? { ...day, is_available: !day.is_available } : day
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
    if (!advisorId) return;

    setSaving(true);
    try {
      // Delete existing availability
      await supabase
        .from("advisor_availability")
        .delete()
        .eq("advisor_id", advisorId);

      // Insert active days
      const activeAvailability = weeklyAvailability
        .filter((day) => day.is_available)
        .map((day) => ({
          advisor_id: advisorId,
          day_of_week: day.day_of_week,
          start_time: day.start_time,
          end_time: day.end_time,
          is_available: true,
        }));

      if (activeAvailability.length > 0) {
        const { error } = await supabase
          .from("advisor_availability")
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
            Set your weekly schedule to enable booking
          </p>
        </div>

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
                    checked={day.is_available}
                    onCheckedChange={() => handleDayToggle(day.day_of_week)}
                  />
                  <Label className="font-semibold">{DAYS[day.day_of_week]}</Label>
                </div>

                {day.is_available && (
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
      </div>
    </Layout>
  );
}

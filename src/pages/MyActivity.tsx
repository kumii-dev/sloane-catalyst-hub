import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Calendar, ShoppingBag, MessageSquare, Award } from "lucide-react";
import { CurrencyIcon } from "@/components/ui/currency-icon";
import { useNavigate } from "react-router-dom";

interface MyActivityItem {
  id: string;
  type: "session" | "application" | "listing" | "subscription" | "review";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  link?: string;
}

const MyActivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<MyActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sessions" | "funding" | "marketplace">("all");

  useEffect(() => {
    if (user) {
      fetchMyActivity();
    }
  }, [user, filter]);

  const fetchMyActivity = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const activities: MyActivityItem[] = [];

      // Fetch my mentoring sessions
      const { data: sessions } = await supabase
        .from("mentoring_sessions")
        .select(`
          id,
          title,
          scheduled_at,
          session_status,
          mentor:mentors(title, company)
        `)
        .eq("mentee_id", user.id)
        .order("scheduled_at", { ascending: false });

      if (sessions) {
        activities.push(
          ...sessions.map((session) => ({
            id: session.id,
            type: "session" as const,
            title: session.title,
            description: `Mentorship session with ${session.mentor?.title || "mentor"}`,
            timestamp: session.scheduled_at,
            status: session.session_status,
            link: "/mentee-dashboard",
          }))
        );
      }

      // Fetch my funding applications
      const { data: applications } = await supabase
        .from("funding_applications")
        .select(`
          id,
          status,
          created_at,
          opportunity:funding_opportunities(title)
        `)
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      if (applications) {
        activities.push(
          ...applications.map((app) => ({
            id: app.id,
            type: "application" as const,
            title: app.opportunity?.title || "Funding Application",
            description: `Funding application submitted`,
            timestamp: app.created_at,
            status: app.status,
            link: "/funding/startup-dashboard",
          }))
        );
      }

      // Fetch my listings
      const { data: listings } = await supabase
        .from("listings")
        .select("id, title, status, created_at, listing_type")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });

      if (listings) {
        activities.push(
          ...listings.map((listing) => ({
            id: listing.id,
            type: "listing" as const,
            title: listing.title,
            description: `${listing.listing_type} listing`,
            timestamp: listing.created_at,
            status: listing.status,
            link: `/listings/${listing.id}`,
          }))
        );
      }

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activities);
    } catch (error) {
      console.error("Error fetching my activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: MyActivityItem["type"]) => {
    switch (type) {
      case "session":
        return <Calendar className="h-5 w-5 text-primary" />;
      case "application":
        return <CurrencyIcon className="h-5 w-5 text-success" />;
      case "listing":
        return <ShoppingBag className="h-5 w-5 text-warning" />;
      case "subscription":
        return <Award className="h-5 w-5 text-info" />;
      case "review":
        return <MessageSquare className="h-5 w-5 text-secondary" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "confirmed":
      case "approved":
      case "active":
        return "success";
      case "pending":
      case "under_review":
        return "warning";
      case "cancelled":
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    if (filter === "sessions") return activity.type === "session";
    if (filter === "funding") return activity.type === "application";
    if (filter === "marketplace") return activity.type === "listing" || activity.type === "subscription";
    return true;
  });

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Activity</h1>
          <p className="text-muted-foreground">
            Track all your activities and interactions on the platform
          </p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="sessions">Mentorship</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Your Activity Timeline</CardTitle>
            <CardDescription>
              A chronological view of all your platform activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your activities...
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No activities yet</p>
                  <p className="text-sm mt-2">
                    Start engaging with the platform to see your activity here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => activity.link && navigate(activity.link)}
                    >
                      <div className="p-2 rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {activity.status && (
                          <Badge
                            variant={getStatusColor(activity.status) as any}
                            className="mt-2"
                          >
                            {activity.status.replace("_", " ")}
                          </Badge>
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
    </Layout>
  );
};

export default MyActivity;

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, Users, DollarSign, BookOpen, TrendingUp, MessageSquare } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "session" | "funding" | "listing" | "message" | "resource";
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  metadata?: any;
}

const Activity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sessions" | "funding" | "marketplace">("all");

  useEffect(() => {
    fetchPlatformActivity();
  }, [filter]);

  const fetchPlatformActivity = async () => {
    try {
      setLoading(true);
      const activities: ActivityItem[] = [];

      // Fetch recent mentoring sessions
      const { data: sessions } = await supabase
        .from("mentoring_sessions")
        .select(`
          id,
          title,
          scheduled_at,
          session_status,
          mentee_id,
          mentor:mentors(user_id, title)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (sessions) {
        for (const session of sessions) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, profile_picture_url")
            .eq("user_id", session.mentee_id)
            .single();

          activities.push({
            id: session.id,
            type: "session",
            title: session.title,
            description: `New mentoring session scheduled`,
            timestamp: session.scheduled_at,
            user: {
              name: profile ? `${profile.first_name} ${profile.last_name}` : "Anonymous",
              avatar: profile?.profile_picture_url,
            },
          });
        }
      }

      // Fetch recent funding applications
      const { data: applications } = await supabase
        .from("funding_applications")
        .select(`
          id,
          status,
          created_at,
          applicant_id,
          opportunity:funding_opportunities(title)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (applications) {
        for (const app of applications) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, profile_picture_url")
            .eq("user_id", app.applicant_id)
            .single();

          activities.push({
            id: app.id,
            type: "funding",
            title: app.opportunity?.title || "Funding Opportunity",
            description: `Applied for funding`,
            timestamp: app.created_at,
            user: {
              name: profile ? `${profile.first_name} ${profile.last_name}` : "Anonymous",
              avatar: profile?.profile_picture_url,
            },
            metadata: { status: app.status },
          });
        }
      }

      // Fetch recent listings
      const { data: listings } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          listing_type,
          created_at,
          provider_id
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);

      if (listings) {
        for (const listing of listings) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, profile_picture_url")
            .eq("user_id", listing.provider_id)
            .single();

          activities.push({
            id: listing.id,
            type: "listing",
            title: listing.title,
            description: `New ${listing.listing_type} listing`,
            timestamp: listing.created_at,
            user: {
              name: profile ? `${profile.first_name} ${profile.last_name}` : "Anonymous",
              avatar: profile?.profile_picture_url,
            },
          });
        }
      }

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "session":
        return <Calendar className="h-5 w-5 text-primary" />;
      case "funding":
        return <DollarSign className="h-5 w-5 text-success" />;
      case "listing":
        return <TrendingUp className="h-5 w-5 text-warning" />;
      case "resource":
        return <BookOpen className="h-5 w-5 text-info" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-secondary" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    if (filter === "sessions") return activity.type === "session";
    if (filter === "funding") return activity.type === "funding";
    if (filter === "marketplace") return activity.type === "listing";
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Platform Activity Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest activities across the platform
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Real-time updates from across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading activities...
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No activities yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback>
                                {activity.user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {activity.user.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="mt-2 font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        {activity.metadata?.status && (
                          <Badge variant="outline" className="mt-2">
                            {activity.metadata.status}
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

export default Activity;

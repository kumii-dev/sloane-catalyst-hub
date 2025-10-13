import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isFuture, isPast } from "date-fns";
import { useNavigate } from "react-router-dom";

const MenteeDashboard = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    totalHours: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch all sessions where user is the mentee
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('mentoring_sessions')
        .select(`
          *,
          mentors (
            id,
            title,
            company,
            rating,
            user_id
          )
        `)
        .eq('mentee_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch mentor profiles
      if (sessionsData && sessionsData.length > 0) {
        const mentorUserIds = sessionsData.map(s => s.mentors?.user_id).filter(Boolean);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url')
          .in('user_id', mentorUserIds);

        const profileMap = Object.fromEntries(
          (profilesData || []).map(p => [p.user_id, p])
        );

        const enrichedSessions = sessionsData.map(session => ({
          ...session,
          mentor_profile: profileMap[session.mentors?.user_id] || null
        }));

        setSessions(enrichedSessions);

        // Calculate stats
        const upcoming = enrichedSessions.filter(s => 
          s.scheduled_at && isFuture(new Date(s.scheduled_at))
        ).length;
        const completed = enrichedSessions.filter(s => 
          s.session_status === 'completed'
        ).length;
        const totalHours = enrichedSessions.reduce((sum, s) => 
          sum + (s.duration_minutes || 0), 0
        ) / 60;

        setStats({
          total: enrichedSessions.length,
          upcoming,
          completed,
          totalHours
        });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load your sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      completed: { variant: "default", className: "bg-green-600" },
      cancelled: { variant: "destructive", className: "" },
      pending: { variant: "secondary", className: "bg-yellow-500 text-white" },
      confirmed: { variant: "default", className: "bg-blue-600" }
    };
    return variants[status] || { variant: "outline", className: "" };
  };

  const upcomingSessions = sessions.filter(s => 
    s.scheduled_at && isFuture(new Date(s.scheduled_at))
  );

  const pastSessions = sessions.filter(s => 
    s.scheduled_at && isPast(new Date(s.scheduled_at))
  );

  if (loading) {
    return (
      <Layout showSidebar={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Mentorship Journey</h1>
                <p className="text-muted-foreground">Track your growth and upcoming sessions</p>
              </div>
              <Button onClick={() => navigate('/find-mentor')} size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Session
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                    <p className="text-3xl font-bold">{stats.upcoming}</p>
                  </div>
                  <Clock className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-3xl font-bold">{stats.totalHours.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming Sessions
                <Badge variant="secondary">{upcomingSessions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Past Sessions
                <Badge variant="secondary">{pastSessions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                All Sessions
                <Badge variant="secondary">{sessions.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">No upcoming sessions</p>
                    <Button onClick={() => navigate('/find-mentor')}>
                      Book Your First Session
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={session.mentor_profile?.profile_picture_url} 
                              alt={session.mentor_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentor_profile?.first_name?.[0]}
                              {session.mentor_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {session.mentor_profile?.first_name} {session.mentor_profile?.last_name}
                                  </span>
                                  <span>•</span>
                                  <span>{session.mentors?.title}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(session.session_status)}
                                <Badge {...getStatusBadge(session.session_status)}>
                                  {session.session_status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-medium">
                                  {format(new Date(session.scheduled_at), 'PPP')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{session.duration_minutes} minutes</span>
                              </div>
                              {session.session_type && (
                                <Badge variant="outline">{session.session_type}</Badge>
                              )}
                              {session.price && (
                                <Badge variant="secondary">R{session.price}</Badge>
                              )}
                            </div>

                            {session.description && (
                              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                {session.description}
                              </p>
                            )}

                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="default">
                                <Video className="w-4 h-4 mr-2" />
                                Join Session
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messaging-hub?userId=${session.mentors?.user_id}`)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message Mentor
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/mentor/${session.mentors?.id}`)}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No past sessions yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastSessions.map((session) => (
                    <Card key={session.id} className="opacity-90">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={session.mentor_profile?.profile_picture_url} 
                              alt={session.mentor_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentor_profile?.first_name?.[0]}
                              {session.mentor_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {session.mentor_profile?.first_name} {session.mentor_profile?.last_name}
                                  </span>
                                </div>
                              </div>
                              <Badge {...getStatusBadge(session.session_status)}>
                                {session.session_status}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{format(new Date(session.scheduled_at), 'PPP')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{session.duration_minutes} minutes</span>
                              </div>
                            </div>

                            {session.session_status === 'completed' && (
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline">
                                  <Star className="w-4 h-4 mr-2" />
                                  Leave Review
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Book Again
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage 
                            src={session.mentor_profile?.profile_picture_url} 
                            alt={session.mentor_profile?.first_name}
                          />
                          <AvatarFallback>
                            {session.mentor_profile?.first_name?.[0]}
                            {session.mentor_profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>
                                  {session.mentor_profile?.first_name} {session.mentor_profile?.last_name}
                                </span>
                              </div>
                            </div>
                            <Badge {...getStatusBadge(session.session_status)}>
                              {session.session_status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{format(new Date(session.scheduled_at), 'PPP')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{session.duration_minutes} minutes</span>
                            </div>
                            {session.session_type && (
                              <Badge variant="outline">{session.session_type}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default MenteeDashboard;

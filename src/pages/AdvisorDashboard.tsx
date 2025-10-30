import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Check,
  X,
  Settings,
  Video
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { VideoCallRoom } from "@/components/video/VideoCallRoom";
import { getOrCreateVideoRoom, canJoinSession } from "@/utils/videoCallUtils";
import { SessionCountdown } from "@/components/SessionCountdown";

const AdvisorDashboard = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [advisorProfile, setAdvisorProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    pending: 0,
    completed: 0,
    totalEarnings: 0
  });
  const [activeVideoSession, setActiveVideoSession] = useState<{id: string, roomUrl: string} | null>(null);
  const [showNotAdvisorDialog, setShowNotAdvisorDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdvisorStatus();
  }, []);

  const checkAdvisorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        navigate('/auth');
        return;
      }

      const { data: advisor, error: advisorError } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (advisorError) throw advisorError;

      if (!advisor) {
        setLoading(false);
        setShowNotAdvisorDialog(true);
        return;
      }

      setAdvisorProfile(advisor);
      fetchSessions(advisor.id);
    } catch (error) {
      console.error('Failed to check advisor status:', error);
      toast({
        title: "Error",
        description: "Failed to load advisor profile",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const fetchSessions = async (advisorId: string) => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('advisor_sessions')
        .select('*')
        .eq('advisor_id', advisorId)
        .order('scheduled_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (sessionsData && sessionsData.length > 0) {
        const clientIds = sessionsData.map(s => s.client_user_id).filter(Boolean);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url, email')
          .in('user_id', clientIds);

        const profileMap = Object.fromEntries(
          (profilesData || []).map(p => [p.user_id, p])
        );

        const enrichedSessions = sessionsData.map(session => ({
          ...session,
          client_profile: profileMap[session.client_user_id] || null
        }));

        setSessions(enrichedSessions);

        const upcoming = enrichedSessions.filter(s => {
          if (!s.scheduled_at || s.status !== 'confirmed') return false;
          const sessionDate = new Date(s.scheduled_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const sessionDay = new Date(sessionDate);
          sessionDay.setHours(0, 0, 0, 0);
          return sessionDay >= today;
        }).length;
        
        const pending = enrichedSessions.filter(s => 
          s.status === 'pending'
        ).length;
        
        const completed = enrichedSessions.filter(s => 
          s.status === 'completed'
        ).length;
        
        const totalEarnings = enrichedSessions
          .filter(s => s.status === 'completed')
          .reduce((sum, s) => sum + (parseFloat(String(s.amount_paid || 0))), 0);

        const nonCancelledTotal = enrichedSessions.filter(s => 
          s.status !== 'cancelled'
        ).length;

        setStats({
          total: nonCancelledTotal,
          upcoming,
          pending,
          completed,
          totalEarnings
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

  const handleJoinSession = async (session: any) => {
    try {
      if (!canJoinSession(session.scheduled_at)) {
        const sessionTime = new Date(session.scheduled_at);
        const now = new Date();
        const timeUntilSession = Math.round((sessionTime.getTime() - now.getTime()) / (1000 * 60));
        
        toast({
          title: "Cannot Join Yet",
          description: `You can join 15 minutes before the session. Time until session: ${timeUntilSession} minutes`,
          variant: "destructive"
        });
        return;
      }

      const roomUrl = await getOrCreateVideoRoom(session.id);
      setActiveVideoSession({ id: session.id, roomUrl });
    } catch (error) {
      console.error("Failed to join session:", error);
      toast({
        title: "Error",
        description: "Failed to join video call",
        variant: "destructive"
      });
    }
  };

  const handleLeaveSession = () => {
    setActiveVideoSession(null);
    if (advisorProfile) {
      fetchSessions(advisorProfile.id);
    }
  };

  const handleSessionAction = async (sessionId: string, action: 'confirm' | 'decline') => {
    try {
      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
      
      const { error } = await supabase
        .from('advisor_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: action === 'confirm' ? "Session Confirmed" : "Session Declined",
        description: action === 'confirm' 
          ? "The client has been notified" 
          : "The session has been cancelled"
      });

      if (advisorProfile) {
        fetchSessions(advisorProfile.id);
      }
    } catch (error) {
      console.error('Failed to update session:', error);
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive"
      });
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

  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const upcomingSessions = sessions.filter(s => {
    if (!s.scheduled_at || s.status !== 'confirmed') return false;
    const sessionDate = new Date(s.scheduled_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDay = new Date(sessionDate);
    sessionDay.setHours(0, 0, 0, 0);
    return sessionDay >= today;
  });
  const completedSessions = sessions.filter(s => s.status === 'completed');

  if (activeVideoSession) {
    return (
      <VideoCallRoom
        sessionId={activeVideoSession.id}
        roomUrl={activeVideoSession.roomUrl}
        onLeave={handleLeaveSession}
        userRole="mentor"
      />
    );
  }

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
      <AlertDialog open={showNotAdvisorDialog} onOpenChange={setShowNotAdvisorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-destructive">
              Not an Advisor
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-4">
              You need to become an advisor first before you can access the advisor dashboard. 
              Would you like to start your advisory journey?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNotAdvisorDialog(false);
                navigate('/');
              }}
              className="w-full sm:w-auto"
            >
              Go Home
            </Button>
            <AlertDialogAction
              onClick={() => {
                setShowNotAdvisorDialog(false);
                navigate('/become-advisor');
              }}
              className="w-full sm:w-auto"
            >
              Become an Advisor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        <div className="border-b bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Advisor Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your advisory sessions and availability</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => navigate('/advisor-availability')} className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button variant="outline" onClick={() => navigate('/edit-advisor-profile')} className="w-full sm:w-auto">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button onClick={() => navigate(`/advisor/${advisorProfile?.id}`)} className="w-full sm:w-auto">
                  View My Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold">{stats.pending}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                    <p className="text-3xl font-bold">{stats.upcoming}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Earnings</p>
                    <p className="text-3xl font-bold">R{stats.totalEarnings.toFixed(0)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="relative">
                Pending Requests
                {pendingSessions.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500" variant="secondary">
                    {pendingSessions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending session requests</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                pendingSessions.map((session) => (
                  <Card key={session.id} className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={session.client_profile?.profile_picture_url} />
                            <AvatarFallback>
                              {session.client_profile?.first_name?.[0]}{session.client_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {session.client_profile?.first_name} {session.client_profile?.last_name}
                              </h3>
                              <Badge variant="secondary" className="bg-yellow-500 text-white">
                                {session.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(session.scheduled_at), 'EEEE, MMMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {format(new Date(session.scheduled_at), 'h:mm a')} ({session.duration_minutes} min)
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{session.session_type}</Badge>
                              </div>
                              {session.notes && (
                                <p className="mt-2 text-sm">{session.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSessionAction(session.id, 'confirm')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSessionAction(session.id, 'decline')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming sessions</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                upcomingSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={session.client_profile?.profile_picture_url} />
                            <AvatarFallback>
                              {session.client_profile?.first_name?.[0]}{session.client_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {session.client_profile?.first_name} {session.client_profile?.last_name}
                              </h3>
                              <Badge className={getStatusBadge(session.status).className}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(session.scheduled_at), 'EEEE, MMMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {format(new Date(session.scheduled_at), 'h:mm a')} ({session.duration_minutes} min)
                              </div>
                              <SessionCountdown scheduledAt={session.scheduled_at} />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {canJoinSession(session.scheduled_at) && (
                            <Button onClick={() => handleJoinSession(session)} className="gap-2">
                              <Video className="w-4 h-4" />
                              Join Session
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No completed sessions yet</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                completedSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.client_profile?.profile_picture_url} />
                          <AvatarFallback>
                            {session.client_profile?.first_name?.[0]}{session.client_profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {session.client_profile?.first_name} {session.client_profile?.last_name}
                            </h3>
                            <Badge className="bg-green-600">Completed</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(session.scheduled_at), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              R{parseFloat(session.amount_paid || 0).toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdvisorDashboard;

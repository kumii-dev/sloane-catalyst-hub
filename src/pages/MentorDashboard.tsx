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
  MessageSquare, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  User,
  Check,
  X,
  Settings,
  Video
} from "lucide-react";
import { CurrencyIcon } from "@/components/ui/currency-icon";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isFuture, isPast } from "date-fns";
import { useNavigate } from "react-router-dom";
import { VideoCallRoom } from "@/components/video/VideoCallRoom";
import { getOrCreateVideoRoom, canJoinSession } from "@/utils/videoCallUtils";
import { SessionCountdown } from "@/components/SessionCountdown";

const MentorDashboard = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    pending: 0,
    completed: 0,
    totalEarnings: 0
  });
  const [activeVideoSession, setActiveVideoSession] = useState<{id: string, roomUrl: string} | null>(null);
  const [showNotMentorDialog, setShowNotMentorDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkMentorStatus();
  }, []);

  const checkMentorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        navigate('/auth');
        return;
      }

      // Check if user is a mentor
      const { data: mentor, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (mentorError) throw mentorError;

      if (!mentor) {
        setLoading(false);
        setShowNotMentorDialog(true);
        return;
      }

      setMentorProfile(mentor);
      fetchSessions(mentor.id);
    } catch (error) {
      console.error('Failed to check mentor status:', error);
      toast({
        title: "Error",
        description: "Failed to load mentor profile",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const fetchSessions = async (mentorId: string) => {
    try {
      // Fetch all sessions where user is the mentor
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('mentoring_sessions')
        .select('*')
        .eq('mentor_id', mentorId)
        .order('scheduled_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch mentee profiles
      if (sessionsData && sessionsData.length > 0) {
        const menteeIds = sessionsData.map(s => s.mentee_id).filter(Boolean);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url, email')
          .in('user_id', menteeIds);

        const profileMap = Object.fromEntries(
          (profilesData || []).map(p => [p.user_id, p])
        );

        const enrichedSessions = sessionsData.map(session => ({
          ...session,
          mentee_profile: profileMap[session.mentee_id] || null
        }));

        setSessions(enrichedSessions);

        // Calculate stats
        const upcoming = enrichedSessions.filter(s => {
          if (!s.scheduled_at || s.session_status !== 'confirmed') return false;
          const sessionDate = new Date(s.scheduled_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const sessionDay = new Date(sessionDate);
          sessionDay.setHours(0, 0, 0, 0);
          // Include today's sessions and future sessions (confirmed only)
          return sessionDay >= today;
        }).length;
        const pending = enrichedSessions.filter(s => 
          s.session_status === 'pending'
        ).length;
        const completed = enrichedSessions.filter(s => 
          s.session_status === 'completed'
        ).length;
        const totalEarnings = enrichedSessions
          .filter(s => s.session_status === 'completed')
          .reduce((sum, s) => sum + (s.price || 0), 0);

        // Calculate total excluding cancelled sessions
        const nonCancelledTotal = enrichedSessions.filter(s => 
          s.session_status !== 'cancelled'
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
    if (mentorProfile) {
      fetchSessions(mentorProfile.id);
    }
  };

  const handleSessionAction = async (sessionId: string, action: 'confirm' | 'decline') => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
      
      const { error } = await supabase
        .from('mentoring_sessions')
        .update({ session_status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      // Send confirmation email to mentee if session is accepted
      if (action === 'confirm') {
        try {
          const { data: menteeProfile } = await supabase
            .from('profiles')
            .select('email, first_name')
            .eq('user_id', session.mentee_id)
            .single();

          const { data: { user } } = await supabase.auth.getUser();
          const { data: mentorProfileData } = await supabase
            .from('profiles')
            .select('email, first_name')
            .eq('user_id', user?.id)
            .single();

          if (menteeProfile?.email && mentorProfileData) {
            await supabase.functions.invoke('send-booking-email', {
              body: {
                type: 'booking_accepted',
                mentorEmail: mentorProfileData.email,
                mentorName: mentorProfile.title || mentorProfileData.first_name,
                menteeEmail: menteeProfile.email,
                menteeName: menteeProfile.first_name,
                sessionDate: format(new Date(session.scheduled_at), 'MMM d, yyyy'),
                sessionTime: format(new Date(session.scheduled_at), 'h:mm a'),
                sessionType: session.session_type || 'Premium',
                sessionId: sessionId,
                mentorUserId: user?.id || '',
                menteeUserId: session.mentee_id
              }
            });
            console.log('Confirmation email sent to mentee');
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't fail the session confirmation if email fails
        }
        
        // Send review request emails when session is confirmed
        try {
          await supabase.functions.invoke('send-review-request', {
            body: { sessionId }
          });
          console.log('Review request emails sent');
        } catch (reviewEmailError) {
          console.error('Review request email sending failed:', reviewEmailError);
          // Don't fail if review emails fail
        }
      }

      // Create notification for mentee
      const notificationSubject = action === 'confirm' 
        ? '✅ Session Confirmed!' 
        : '❌ Session Declined';
      
      const notificationBody = action === 'confirm'
        ? `Your mentoring session "${session.title}" on ${format(new Date(session.scheduled_at), 'MMM d, yyyy')} at ${format(new Date(session.scheduled_at), 'h:mm a')} has been confirmed!`
        : `Your mentoring session request "${session.title}" has been declined. Please book another time slot or reach out to the mentor.`;

      await supabase
        .from('messages')
        .insert({
          user_id: session.mentee_id,
          message_type: 'notification',
          subject: notificationSubject,
          body: notificationBody,
          related_entity_type: 'mentoring_session',
          related_entity_id: sessionId,
          is_read: false
        });

      toast({
        title: action === 'confirm' ? "Session Confirmed" : "Session Declined",
        description: action === 'confirm' 
          ? "The mentee has been notified" 
          : "The session has been cancelled"
      });

      // Refresh sessions
      if (mentorProfile) {
        fetchSessions(mentorProfile.id);
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

  const pendingSessions = sessions.filter(s => s.session_status === 'pending');
  const upcomingSessions = sessions.filter(s => {
    if (!s.scheduled_at || s.session_status !== 'confirmed') return false;
    const sessionDate = new Date(s.scheduled_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDay = new Date(sessionDate);
    sessionDay.setHours(0, 0, 0, 0);
    // Include today's sessions and future sessions
    return sessionDay >= today;
  });
  const completedSessions = sessions.filter(s => s.session_status === 'completed');
  const pastSessions = sessions.filter(s => {
    if (!s.scheduled_at) return false;
    const sessionDate = new Date(s.scheduled_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDay = new Date(sessionDate);
    sessionDay.setHours(0, 0, 0, 0);
    // Only past if session was before today
    return sessionDay < today;
  });

  // Handle active video call
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
      {/* Not a Mentor Dialog */}
      <AlertDialog open={showNotMentorDialog} onOpenChange={setShowNotMentorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-destructive">
              Not a Mentor
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-4">
              You need to become a mentor first before you can access the mentor dashboard. 
              Would you like to start your mentorship journey?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNotMentorDialog(false);
                navigate('/mentee-dashboard');
              }}
              className="w-full sm:w-auto"
            >
              Go to Mentee Dashboard
            </Button>
            <AlertDialogAction
              onClick={() => {
                setShowNotMentorDialog(false);
                navigate('/become-mentor');
              }}
              className="w-full sm:w-auto"
            >
              Become a Mentor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mentor Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your mentoring sessions and availability</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => navigate('/mentor-availability')} className="w-full sm:w-auto whitespace-nowrap">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="truncate">Manage Availability</span>
                </Button>
                <Button variant="outline" onClick={() => navigate('/edit-mentor-profile')} className="w-full sm:w-auto whitespace-nowrap">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Edit Profile</span>
                </Button>
                <Button onClick={() => navigate('/mentorship')} className="w-full sm:w-auto whitespace-nowrap">
                  <span>View My Profile</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
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
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-3xl font-bold">${stats.totalEarnings}</p>
                  </div>
                  <CurrencyIcon className="w-10 h-10 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full justify-start mb-6 overflow-x-auto scrollbar-hide flex-nowrap">
              <TabsTrigger value="pending" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Pending Requests</span>
                <span className="sm:hidden">Pending</span>
                {stats.pending > 0 && (
                  <Badge variant="destructive" className="ml-1">{stats.pending}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Upcoming Sessions</span>
                <span className="sm:hidden">Upcoming</span>
                <Badge variant="secondary">{upcomingSessions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden">Done</span>
                <Badge variant="secondary">{completedSessions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Past Sessions</span>
                <span className="sm:hidden">Past</span>
                <Badge variant="secondary">{pastSessions.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                All Sessions
                <Badge variant="secondary">{sessions.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Pending Requests Tab */}
            <TabsContent value="pending">
              {pendingSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No pending requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingSessions.map((session) => (
                    <Card key={session.id} className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <Avatar className="h-16 w-16 ring-2 ring-yellow-400 flex-shrink-0">
                            <AvatarImage 
                              src={session.mentee_profile?.profile_picture_url} 
                              alt={session.mentee_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentee_profile?.first_name?.[0]}
                              {session.mentee_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 break-words">{session.title}</h3>
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">
                                      {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
                                    </span>
                                  </div>
                                  {session.mentee_profile?.email && (
                                    <span className="truncate text-xs">{session.mentee_profile.email}</span>
                                  )}
                                </div>
                              </div>
                              <Badge className="bg-yellow-500 whitespace-nowrap flex-shrink-0">
                                New Request
                              </Badge>
                            </div>

                            <div className="flex flex-col gap-3 mt-3">
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="font-medium break-words">
                                    {format(new Date(session.scheduled_at), 'PPP')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span>{format(new Date(session.scheduled_at), 'h:mm a')}</span>
                                </div>
                                <span>{session.duration_minutes} min</span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                {session.session_type && (
                                  <Badge variant="outline" className="whitespace-nowrap">{session.session_type}</Badge>
                                )}
                                {session.price && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 whitespace-nowrap">
                                    R{session.price}
                                  </Badge>
                                )}
                                <SessionCountdown scheduledAt={session.scheduled_at} />
                              </div>
                            </div>

                            {session.description && (
                              <div className="mt-3 p-3 bg-background rounded-md">
                                <p className="text-sm font-medium mb-1">Message from mentee:</p>
                                <p className="text-sm text-muted-foreground break-words">{session.description}</p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              <Button 
                                size="sm" 
                                onClick={() => handleSessionAction(session.id, 'confirm')}
                                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                <span className="whitespace-nowrap">Accept Request</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSessionAction(session.id, 'decline')}
                                className="border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto"
                              >
                                <X className="w-4 h-4 mr-2" />
                                <span className="whitespace-nowrap">Decline</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messaging-hub?userId=${session.mentee_id}`)}
                                className="w-full sm:w-auto"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                <span className="whitespace-nowrap">Message</span>
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

            {/* Upcoming Sessions Tab */}
            <TabsContent value="upcoming">
              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No upcoming confirmed sessions</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <Avatar className="h-16 w-16 flex-shrink-0">
                            <AvatarImage 
                              src={session.mentee_profile?.profile_picture_url} 
                              alt={session.mentee_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentee_profile?.first_name?.[0]}
                              {session.mentee_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 break-words">{session.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
                                  </span>
                                </div>
                              </div>
                              <Badge className="bg-blue-600 whitespace-nowrap flex-shrink-0">
                                Confirmed
                              </Badge>
                            </div>

                            <div className="flex flex-col gap-3 mt-3">
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="font-medium break-words">
                                    {format(new Date(session.scheduled_at), 'PPP')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span>{format(new Date(session.scheduled_at), 'h:mm a')}</span>
                                </div>
                                <span>{session.duration_minutes} min</span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                {session.price && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 whitespace-nowrap">
                                    R{session.price}
                                  </Badge>
                                )}
                                <SessionCountdown scheduledAt={session.scheduled_at} />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleJoinSession(session)}
                                disabled={!canJoinSession(session.scheduled_at)}
                                className="w-full sm:w-auto"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                <span className="whitespace-nowrap">Start Session</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messaging-hub?userId=${session.mentee_id}`)}
                                className="w-full sm:w-auto"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                <span className="whitespace-nowrap">Message</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "Reschedule Session",
                                    description: "Please contact the mentee to reschedule the session",
                                  });
                                  navigate(`/messaging-hub?userId=${session.mentee_id}`);
                                }}
                                className="w-full sm:w-auto"
                              >
                                <span className="whitespace-nowrap">Reschedule</span>
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

            {/* Completed Sessions Tab */}
            <TabsContent value="completed">
              {completedSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">No completed sessions yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <Card key={session.id} className="border-green-200 bg-green-50/30 dark:bg-green-950/10">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <Avatar className="h-16 w-16 ring-2 ring-green-400 flex-shrink-0">
                            <AvatarImage 
                              src={session.mentee_profile?.profile_picture_url} 
                              alt={session.mentee_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentee_profile?.first_name?.[0]}
                              {session.mentee_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 break-words">{session.title}</h3>
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">
                                      {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
                                    </span>
                                  </div>
                                  {session.mentee_profile?.email && (
                                    <span className="truncate text-xs">{session.mentee_profile.email}</span>
                                  )}
                                </div>
                              </div>
                              <Badge className="bg-green-600 whitespace-nowrap flex-shrink-0">
                                Completed
                              </Badge>
                            </div>

                            <div className="flex flex-col gap-3 mt-3">
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="font-medium break-words">
                                    {format(new Date(session.scheduled_at), 'PPP')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span>{format(new Date(session.scheduled_at), 'h:mm a')}</span>
                                </div>
                                <span>{session.duration_minutes} min</span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                {session.session_type && (
                                  <Badge variant="outline" className="whitespace-nowrap">{session.session_type}</Badge>
                                )}
                                {session.price && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 whitespace-nowrap">
                                    Earned: R{session.price}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {session.description && (
                              <div className="mt-3 p-3 bg-background/50 rounded-md">
                                <p className="text-sm font-medium mb-1">Session Notes:</p>
                                <p className="text-sm text-muted-foreground break-words">{session.description}</p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              <Button 
                                size="sm" 
                                onClick={() => navigate(`/review/${session.id}?reviewer=mentor`)}
                                className="w-full sm:w-auto"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                <span className="whitespace-nowrap">Review Session</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messaging-hub?userId=${session.mentee_id}`)}
                                className="w-full sm:w-auto"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                <span className="whitespace-nowrap">Message</span>
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

            {/* Past Sessions Tab */}
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
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <Avatar className="h-16 w-16 flex-shrink-0">
                            <AvatarImage 
                              src={session.mentee_profile?.profile_picture_url} 
                              alt={session.mentee_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentee_profile?.first_name?.[0]}
                              {session.mentee_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 break-words">{session.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
                                  </span>
                                </div>
                              </div>
                              <Badge {...getStatusBadge(session.session_status)} className="whitespace-nowrap flex-shrink-0">
                                {session.session_status}
                              </Badge>
                            </div>

                            <div className="flex flex-col gap-2 mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="break-words">{format(new Date(session.scheduled_at), 'PPP')} at {format(new Date(session.scheduled_at), 'h:mm a')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span>{session.duration_minutes} minutes</span>
                              </div>
                              {session.price && (
                                <Badge variant="secondary" className="w-fit whitespace-nowrap">Earned: R{session.price}</Badge>
                              )}
                            </div>

                            {session.session_status === 'completed' && (
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" onClick={() => navigate(`/review/${session.id}?reviewer=mentor`)} className="w-full sm:w-auto">
                                  <Star className="w-4 h-4 mr-2" />
                                  <span className="whitespace-nowrap">Review Session</span>
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => navigate(`/messaging-hub?userId=${session.mentee_id}`)} className="w-full sm:w-auto">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  <span className="whitespace-nowrap">Message</span>
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

            {/* All Sessions Tab */}
            <TabsContent value="all">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage 
                            src={session.mentee_profile?.profile_picture_url} 
                            alt={session.mentee_profile?.first_name}
                          />
                          <AvatarFallback>
                            {session.mentee_profile?.first_name?.[0]}
                            {session.mentee_profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg sm:text-xl font-semibold mb-2 break-words">{session.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
                                </span>
                              </div>
                            </div>
                            <Badge {...getStatusBadge(session.session_status)} className="whitespace-nowrap flex-shrink-0">
                              {session.session_status}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-2 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="break-words">{format(new Date(session.scheduled_at), 'PPP')} at {format(new Date(session.scheduled_at), 'h:mm a')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                              <span>{session.duration_minutes} minutes</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {session.session_type && (
                                <Badge variant="outline" className="whitespace-nowrap">{session.session_type}</Badge>
                              )}
                              {session.price && (
                                <Badge variant="secondary" className="whitespace-nowrap">R{session.price}</Badge>
                              )}
                            </div>
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

export default MentorDashboard;

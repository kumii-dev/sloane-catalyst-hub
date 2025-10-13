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
  DollarSign, 
  MessageSquare, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  User,
  Check,
  X,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isFuture, isPast } from "date-fns";
import { useNavigate } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkMentorStatus();
  }, []);

  const checkMentorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        toast({
          title: "Not a mentor",
          description: "You need to become a mentor first",
          variant: "destructive"
        });
        navigate('/become-mentor');
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
        const upcoming = enrichedSessions.filter(s => 
          s.scheduled_at && isFuture(new Date(s.scheduled_at)) && s.session_status !== 'cancelled'
        ).length;
        const pending = enrichedSessions.filter(s => 
          s.session_status === 'pending'
        ).length;
        const completed = enrichedSessions.filter(s => 
          s.session_status === 'completed'
        ).length;
        const totalEarnings = enrichedSessions
          .filter(s => s.session_status === 'completed')
          .reduce((sum, s) => sum + (s.price || 0), 0);

        setStats({
          total: enrichedSessions.length,
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
                sessionType: session.session_type || 'Premium'
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
  const upcomingSessions = sessions.filter(s => 
    s.scheduled_at && 
    isFuture(new Date(s.scheduled_at)) && 
    s.session_status === 'confirmed'
  );
  const pastSessions = sessions.filter(s => 
    s.scheduled_at && 
    isPast(new Date(s.scheduled_at))
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
                <h1 className="text-3xl font-bold mb-2">Mentor Dashboard</h1>
                <p className="text-muted-foreground">Manage your mentoring sessions and availability</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/mentor-availability')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button variant="outline" onClick={() => navigate('/edit-mentor-profile')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button onClick={() => navigate('/mentorship')}>
                  View My Profile
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
                  <DollarSign className="w-10 h-10 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Pending Requests
                {stats.pending > 0 && (
                  <Badge variant="destructive" className="ml-1">{stats.pending}</Badge>
                )}
              </TabsTrigger>
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
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16 ring-2 ring-yellow-400">
                            <AvatarImage 
                              src={session.mentee_profile?.profile_picture_url} 
                              alt={session.mentee_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentee_profile?.first_name?.[0]}
                              {session.mentee_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
                                  </span>
                                  {session.mentee_profile?.email && (
                                    <>
                                      <span>•</span>
                                      <span>{session.mentee_profile.email}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge className="bg-yellow-500">
                                New Request
                              </Badge>
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
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  R{session.price}
                                </Badge>
                              )}
                            </div>

                            {session.description && (
                              <div className="mt-3 p-3 bg-background rounded-md">
                                <p className="text-sm font-medium mb-1">Message from mentee:</p>
                                <p className="text-sm text-muted-foreground">{session.description}</p>
                              </div>
                            )}

                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm" 
                                onClick={() => handleSessionAction(session.id, 'confirm')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Accept Request
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSessionAction(session.id, 'decline')}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messaging-hub?userId=${session.mentee_id}`)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
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
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={session.mentee_profile?.profile_picture_url} 
                              alt={session.mentee_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentee_profile?.first_name?.[0]}
                              {session.mentee_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
                                  </span>
                                </div>
                              </div>
                              <Badge className="bg-blue-600">
                                Confirmed
                              </Badge>
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
                              {session.price && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  R{session.price}
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="default">
                                Start Session
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messaging-hub?userId=${session.mentee_id}`)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
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
                              >
                                Reschedule
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
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={session.mentee_profile?.profile_picture_url} 
                              alt={session.mentee_profile?.first_name}
                            />
                            <AvatarFallback>
                              {session.mentee_profile?.first_name?.[0]}
                              {session.mentee_profile?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  <span>
                                    {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
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
                              {session.price && (
                                <Badge variant="secondary">Earned: R{session.price}</Badge>
                              )}
                            </div>

                            {session.session_status === 'completed' && (
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline">
                                  View Feedback
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
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage 
                            src={session.mentee_profile?.profile_picture_url} 
                            alt={session.mentee_profile?.first_name}
                          />
                          <AvatarFallback>
                            {session.mentee_profile?.first_name?.[0]}
                            {session.mentee_profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{session.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>
                                  {session.mentee_profile?.first_name} {session.mentee_profile?.last_name}
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
                            {session.price && (
                              <Badge variant="secondary">R{session.price}</Badge>
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

export default MentorDashboard;

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Package, Users, Activity, Shield, UserPlus, BarChart3, Brain, AlertTriangle, Lock, Database, MessageSquare } from "lucide-react";
import { CurrencyIcon } from "@/components/ui/currency-icon";
import { AIAgentMonitoringDashboard } from "@/components/AIAgentMonitoringDashboard";
import { RealTimeSecurityEvents } from "@/components/RealTimeSecurityEvents";
import { ActiveUserSessions } from "@/components/ActiveUserSessions";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeListings, setActiveListings] = useState<number>(0);
  const [securityStats, setSecurityStats] = useState({
    activeEvents: 0,
    activeSessions: 0,
    criticalAlerts: 0,
    aiAgentsActive: 5
  });

  useEffect(() => {
    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "support_agent"]);

    if (error || !data || data.length === 0) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    setPageLoading(true);
    
    // Fetch pending listings
    const { data: pendingData, error: pendingError } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });

    if (pendingError) {
      toast.error("Failed to load listings");
      console.error(pendingError);
    } else {
      setPendingListings(pendingData || []);
    }

    // Fetch total users count
    const { count: usersCount, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: 'exact', head: true });

    if (!usersError && usersCount !== null) {
      setTotalUsers(usersCount);
    }

    // Fetch active listings count
    const { count: activeCount, error: activeError } = await supabase
      .from("listings")
      .select("*", { count: 'exact', head: true })
      .eq("status", "active");

    if (!activeError && activeCount !== null) {
      setActiveListings(activeCount);
    }

    // Fetch security statistics
    try {
      const { count: eventsCount } = await supabase
        .from("auth_events" as any)
        .select("*", { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { count: sessionsCount } = await supabase
        .from("user_sessions" as any)
        .select("*", { count: 'exact', head: true })
        .eq("is_active", true);

      const { count: criticalCount } = await supabase
        .from("auth_events" as any)
        .select("*", { count: 'exact', head: true })
        .eq("severity", "critical")
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setSecurityStats({
        activeEvents: eventsCount || 0,
        activeSessions: sessionsCount || 0,
        criticalAlerts: criticalCount || 0,
        aiAgentsActive: 5
      });
    } catch (error) {
      console.error("Error fetching security stats:", error);
    }

    setPageLoading(false);
  };

  const handleApproval = async (listingId: string, approved: boolean) => {
    const { error } = await supabase
      .from("listings")
      .update({
        status: approved ? "active" : "rejected",
        approved_at: approved ? new Date().toISOString() : null,
        approved_by: approved ? user?.id : null,
      })
      .eq("id", listingId);

    if (error) {
      toast.error("Failed to update listing");
      console.error(error);
    } else {
      toast.success(`Listing ${approved ? "approved" : "rejected"}`);
      fetchDashboardData();
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage listings, cohorts, and platform activities</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-9 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="ai-agents" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <CurrencyIcon className="w-4 h-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Cohorts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingListings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeListings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                </CardContent>
              </Card>
            </div>

            {/* Security Overview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Operations Overview
                </CardTitle>
                <CardDescription>Real-time security metrics and AI agent status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">AI Agents Active</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{securityStats.aiAgentsActive}</div>
                  </div>
                  <div className="flex flex-col space-y-2 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Active Sessions</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{securityStats.activeSessions}</div>
                  </div>
                  <div className="flex flex-col space-y-2 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Events (24h)</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">{securityStats.activeEvents}</div>
                  </div>
                  <div className="flex flex-col space-y-2 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium">Critical Alerts</span>
                    </div>
                    <div className="text-3xl font-bold text-red-600">{securityStats.criticalAlerts}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => navigate("/ai-agent-monitoring")} variant="default">
                    <Brain className="w-4 h-4 mr-2" />
                    View AI Agents Dashboard
                  </Button>
                  <Button onClick={() => navigate("/security-operations")} variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Operations
                  </Button>
                  <Button onClick={() => navigate("/siem-dashboard")} variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    SIEM Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button onClick={() => navigate("/admin/registrations")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <UserPlus className="w-6 h-6" />
                    <span>Review Registrations</span>
                  </div>
                </Button>
                <Button onClick={() => navigate("/admin/users")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-6 h-6" />
                    <span>Manage Users</span>
                  </div>
                </Button>
                <Button onClick={() => navigate("/admin/mentorship")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span>Mentorship & Advisory</span>
                  </div>
                </Button>
                <Button onClick={() => navigate("/admin/financial")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <CurrencyIcon className="w-6 h-6" />
                    <span>Financial Overview</span>
                  </div>
                </Button>
                <Button onClick={() => navigate("/admin/cohorts")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span>Manage Cohorts</span>
                  </div>
                </Button>
                <Button onClick={() => navigate("/admin/performance")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="w-6 h-6" />
                    <span>System Performance</span>
                  </div>
                </Button>
                <Button onClick={() => navigate("/admin/support")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    <span>Support Console</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Real-Time Security Events
                </CardTitle>
                <CardDescription>Live feed of authentication and security events</CardDescription>
              </CardHeader>
              <CardContent>
                <RealTimeSecurityEvents />
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Operations</CardTitle>
                  <CardDescription>Access comprehensive security monitoring tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => navigate("/security-operations")} className="w-full">
                    Security Operations Center
                  </Button>
                  <Button onClick={() => navigate("/incident-management")} variant="outline" className="w-full">
                    Incident Management
                  </Button>
                  <Button onClick={() => navigate("/threat-intelligence")} variant="outline" className="w-full">
                    Threat Intelligence
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Security Analytics</CardTitle>
                  <CardDescription>Advanced monitoring and detection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => navigate("/siem-dashboard")} className="w-full">
                    SIEM Dashboard
                  </Button>
                  <Button onClick={() => navigate("/xdr-dashboard")} variant="outline" className="w-full">
                    XDR Dashboard
                  </Button>
                  <Button onClick={() => navigate("/system-status")} variant="outline" className="w-full">
                    System Status
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Agent Monitoring Dashboard
                </CardTitle>
                <CardDescription>Real-time monitoring of all AI agents and playbook executions</CardDescription>
              </CardHeader>
              <CardContent>
                <AIAgentMonitoringDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Active User Sessions
                </CardTitle>
                <CardDescription>Monitor and manage active user sessions with termination capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveUserSessions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>New Registrations</CardTitle>
                <CardDescription>Review pending registrations across all personas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/registrations")}>
                  View All Registrations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Listings Approval</CardTitle>
                <CardDescription>Review and approve marketplace listings</CardDescription>
              </CardHeader>
              <CardContent>
                {pageLoading ? (
                  <p>Loading...</p>
                ) : pendingListings.length === 0 ? (
                  <p className="text-muted-foreground">No pending listings</p>
                ) : (
                  <div className="space-y-4">
                    {pendingListings.map((listing) => (
                      <Card key={listing.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold">{listing.title}</h3>
                                <Badge variant="outline">{listing.listing_type}</Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{listing.short_description}</p>
                              <div className="flex gap-2 text-sm text-muted-foreground">
                                <span>Price: R{listing.base_price || "N/A"}</span>
                                {listing.credits_price && (
                                  <span>| Credits: {listing.credits_price}</span>
                                )}
                                <span>| Mode: {listing.delivery_mode}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/listings/${listing.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="icon"
                                onClick={() => handleApproval(listing.id, true)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleApproval(listing.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and administrator access</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/users")}>
                  Manage Users & Admins
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Monitor credits and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/financial")}>
                  View Financial Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Management</CardTitle>
                <CardDescription>Manage cohorts and bulk subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/cohorts")}>
                  Go to Cohort Manager
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

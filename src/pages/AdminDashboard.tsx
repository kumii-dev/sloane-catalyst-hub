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
import { CheckCircle, XCircle, Eye, Package, Users, Activity, Shield, DollarSign, UserPlus, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
      .eq("role", "admin")
      .single();

    if (error || !data) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchPendingListings();
  };

  const fetchPendingListings = async () => {
    setPageLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load listings");
      console.error(error);
    } else {
      setPendingListings(data || []);
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
      fetchPendingListings();
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
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
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
              <Shield className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
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
                  <div className="text-2xl font-bold">Loading...</div>
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
                  <div className="text-2xl font-bold">Loading...</div>
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
                <Button onClick={() => navigate("/admin/financial")} className="h-20">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="w-6 h-6" />
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

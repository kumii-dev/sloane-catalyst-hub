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
import { CheckCircle, XCircle, Eye, Package, Users, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

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
    setLoading(true);
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
    setLoading(false);
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

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Cohorts
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Listings Approval</CardTitle>
                <CardDescription>Review and approve marketplace listings</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
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

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Database Performance</CardTitle>
                <CardDescription>Monitor database health and query performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/performance")}>
                  Open Performance Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

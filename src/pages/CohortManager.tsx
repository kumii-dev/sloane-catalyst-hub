import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Users, CheckCircle } from "lucide-react";

export default function CohortManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [cohortForm, setCohortForm] = useState({
    name: "",
    description: "",
    sponsor_name: "",
    sponsor_logo_url: "",
    credits_allocated: 0,
    start_date: "",
    end_date: "",
  });

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
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    const [cohortsRes, listingsRes] = await Promise.all([
      supabase.from("cohorts").select("*").order("created_at", { ascending: false }),
      supabase.from("listings").select("*").eq("status", "active"),
    ]);

    if (cohortsRes.data) setCohorts(cohortsRes.data);
    if (listingsRes.data) setListings(listingsRes.data);
    setLoading(false);
  };

  const handleCreateCohort = async () => {
    const { error } = await supabase.from("cohorts").insert([cohortForm]);

    if (error) {
      toast.error("Failed to create cohort");
      console.error(error);
    } else {
      toast.success("Cohort created successfully");
      setCohortForm({
        name: "",
        description: "",
        sponsor_name: "",
        sponsor_logo_url: "",
        credits_allocated: 0,
        start_date: "",
        end_date: "",
      });
      fetchData();
    }
  };

  const handleBulkSubscribe = async () => {
    if (!selectedCohort || selectedListings.length === 0) {
      toast.error("Please select a cohort and at least one listing");
      return;
    }

    const inserts = selectedListings.map((listingId) => ({
      cohort_id: selectedCohort,
      listing_id: listingId,
    }));

    const { error } = await supabase.from("cohort_funded_listings").insert(inserts);

    if (error) {
      toast.error("Failed to add listings to cohort");
      console.error(error);
    } else {
      toast.success("Listings added to cohort successfully");
      setSelectedListings([]);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Cohort Manager</h1>
            <p className="text-muted-foreground">Create and manage cohorts with bulk subscriptions</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Cohort
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Cohort</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Cohort Name</Label>
                  <Input
                    value={cohortForm.name}
                    onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                    placeholder="e.g., Q1 2025 Startups"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={cohortForm.description}
                    onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                    placeholder="Describe the cohort..."
                  />
                </div>
                <div>
                  <Label>Sponsor Name</Label>
                  <Input
                    value={cohortForm.sponsor_name}
                    onChange={(e) => setCohortForm({ ...cohortForm, sponsor_name: e.target.value })}
                    placeholder="Sponsor organization name"
                  />
                </div>
                <div>
                  <Label>Credits Allocated</Label>
                  <Input
                    type="number"
                    value={cohortForm.credits_allocated}
                    onChange={(e) => setCohortForm({ ...cohortForm, credits_allocated: parseInt(e.target.value) || 0 })}
                    placeholder="Total credits for cohort"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={cohortForm.start_date}
                      onChange={(e) => setCohortForm({ ...cohortForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={cohortForm.end_date}
                      onChange={(e) => setCohortForm({ ...cohortForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateCohort} className="w-full">
                  Create Cohort
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Active Cohorts</CardTitle>
              <CardDescription>Select a cohort to manage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cohorts.filter(c => c.is_active).map((cohort) => (
                  <Button
                    key={cohort.id}
                    variant={selectedCohort === cohort.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCohort(cohort.id)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {cohort.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Bulk Assign Listings</CardTitle>
              <CardDescription>
                {selectedCohort ? "Select listings to add to cohort" : "Select a cohort first"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCohort ? (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedListings.includes(listing.id)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => {
                          setSelectedListings((prev) =>
                            prev.includes(listing.id)
                              ? prev.filter((id) => id !== listing.id)
                              : [...prev, listing.id]
                          );
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{listing.title}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{listing.listing_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {listing.credits_price} credits
                            </span>
                          </div>
                        </div>
                        {selectedListings.includes(listing.id) && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleBulkSubscribe}
                    disabled={selectedListings.length === 0}
                    className="w-full"
                  >
                    Add {selectedListings.length} Listing{selectedListings.length !== 1 ? "s" : ""} to Cohort
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Select a cohort from the left to manage listings
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

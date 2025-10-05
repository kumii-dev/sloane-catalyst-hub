import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Eye, Edit, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  title: string;
  short_description: string;
  listing_type: string;
  status: string;
  thumbnail_url: string | null;
  base_price: number | null;
  credits_price: number | null;
  total_subscriptions: number;
  created_at: string;
}

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchMyListings();
  }, [user, navigate]);

  const fetchMyListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("provider_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading listings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending_approval":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Edit className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
      case "pending_approval":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your marketplace listings
            </p>
          </div>
          <Button onClick={() => navigate("/listings/create")}>
            <Plus className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't created any listings yet
              </p>
              <Button onClick={() => navigate("/listings/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {listing.thumbnail_url && (
                        <img
                          src={listing.thumbnail_url}
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{listing.title}</CardTitle>
                          <Badge className={getStatusColor(listing.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(listing.status)}
                              {listing.status.replace("_", " ")}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {listing.short_description}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="capitalize">{listing.listing_type}</span>
                          {listing.base_price && (
                            <span>R {listing.base_price.toFixed(2)}</span>
                          )}
                          {listing.credits_price && (
                            <span>{listing.credits_price} credits</span>
                          )}
                          <span>{listing.total_subscriptions} subscriptions</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/listings/${listing.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyListings;

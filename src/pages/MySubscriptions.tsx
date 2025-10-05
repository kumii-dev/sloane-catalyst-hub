import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, XCircle, ExternalLink, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

interface Subscription {
  id: string;
  status: string;
  payment_method: string;
  amount_paid: number;
  credits_used: number;
  started_at: string;
  expires_at: string;
  listing: {
    id: string;
    title: string;
    short_description: string;
    thumbnail_url: string;
    listing_type: string;
  };
  cohort: {
    name: string;
    sponsor_name: string;
  } | null;
}

const MySubscriptions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      navigate("/auth");
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          listings(id, title, short_description, thumbnail_url, listing_type),
          cohorts(name, sponsor_name)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubscriptions(
        data.map((sub: any) => ({
          ...sub,
          listing: sub.listings,
          cohort: sub.cohorts,
        }))
      );
    } catch (error: any) {
      toast({
        title: "Error loading subscriptions",
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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "expired":
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterSubscriptions = (status: string) => {
    if (status === "all") return subscriptions;
    if (status === "active") return subscriptions.filter((s) => s.status === "active");
    if (status === "expired") return subscriptions.filter((s) => s.status === "expired" || s.status === "cancelled");
    return subscriptions;
  };

  const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {subscription.listing.thumbnail_url ? (
          <img
            src={subscription.listing.thumbnail_url}
            alt={subscription.listing.title}
            className="w-full md:w-48 h-48 object-cover"
          />
        ) : (
          <div className="w-full md:w-48 h-48 bg-muted flex items-center justify-center text-4xl">
            💻
          </div>
        )}

        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-xl font-semibold mb-1">{subscription.listing.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {subscription.listing.short_description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(subscription.status)}
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Payment method:</span>
              <Badge variant="outline" className="capitalize">
                {subscription.payment_method === "sponsored"
                  ? `Sponsored by ${subscription.cohort?.sponsor_name}`
                  : subscription.payment_method}
              </Badge>
            </div>

            {subscription.started_at && (
              <p className="text-sm text-muted-foreground">
                Started: {new Date(subscription.started_at).toLocaleDateString()}
              </p>
            )}

            {subscription.expires_at && (
              <p className="text-sm text-muted-foreground">
                Expires: {new Date(subscription.expires_at).toLocaleDateString()}
              </p>
            )}

            {subscription.amount_paid && (
              <p className="text-sm">
                <span className="text-muted-foreground">Amount paid:</span>{" "}
                <span className="font-semibold">R{subscription.amount_paid.toFixed(2)}</span>
              </p>
            )}

            {subscription.credits_used && (
              <p className="text-sm">
                <span className="text-muted-foreground">Credits used:</span>{" "}
                <span className="font-semibold">{subscription.credits_used}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/listings/${subscription.listing.id}`)}
            >
              View Listing
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
            {subscription.status === "active" && (
              <Button size="sm">Access Service</Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your active and past subscriptions
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({subscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({filterSubscriptions("active").length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({filterSubscriptions("expired").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You don't have any subscriptions yet
                  </p>
                  <Button onClick={() => navigate("/marketplace")}>
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              subscriptions.map((subscription) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filterSubscriptions("active").length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No active subscriptions
                  </p>
                  <Button onClick={() => navigate("/marketplace")}>
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filterSubscriptions("active").map((subscription) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            {filterSubscriptions("expired").length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No expired subscriptions</p>
                </CardContent>
              </Card>
            ) : (
              filterSubscriptions("expired").map((subscription) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MySubscriptions;

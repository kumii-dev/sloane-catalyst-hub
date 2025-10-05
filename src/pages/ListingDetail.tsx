import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Coins, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ListingDetail {
  id: string;
  title: string;
  short_description: string;
  description: string;
  listing_type: string;
  delivery_mode: string;
  base_price: number;
  credits_price: number;
  thumbnail_url: string;
  gallery_images: string[];
  rating: number;
  total_reviews: number;
  total_subscriptions: number;
  tags: string[];
  provider: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    review_text: string;
    user: {
      first_name: string;
      last_name: string;
    };
    created_at: string;
  }>;
}

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribeDialog, setSubscribeDialog] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [userCohorts, setUserCohorts] = useState<any[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [isFundedListing, setIsFundedListing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListingDetails();
      if (user) {
        fetchUserEligibility();
      }
    }
  }, [id, user]);

  const fetchListingDetails = async () => {
    try {
      const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch provider profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("user_id", listing.provider_id)
        .single();

      // Fetch reviews
      const { data: reviews } = await supabase
        .from("listing_reviews")
        .select(`
          id,
          rating,
          review_text,
          created_at,
          profiles!user_id(first_name, last_name)
        `)
        .eq("listing_id", id);

      setListing({
        ...listing,
        provider: profile || { id: "", first_name: "", last_name: "", email: "" },
        reviews: reviews?.map((review: any) => ({
          ...review,
          user: review.profiles || { first_name: "", last_name: "" }
        })) || []
      });
    } catch (error: any) {
      toast({
        title: "Error loading listing",
        description: error.message,
        variant: "destructive",
      });
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEligibility = async () => {
    if (!user) return;

    try {
      // Fetch user cohorts
      const { data: cohorts } = await supabase
        .from("cohort_memberships")
        .select("cohorts(*)")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (cohorts) {
        setUserCohorts(cohorts.map((c: any) => c.cohorts));
      }

      // Fetch user credits
      const { data: wallet } = await supabase
        .from("credits_wallet")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (wallet) {
        setUserCredits(wallet.balance);
      }

      // Check if listing is funded for any of user's cohorts
      if (cohorts && cohorts.length > 0) {
        const cohortIds = cohorts.map((c: any) => c.cohorts.id);
        const { data: fundedListings } = await supabase
          .from("cohort_funded_listings")
          .select("*")
          .eq("listing_id", id)
          .in("cohort_id", cohortIds)
          .eq("is_active", true);

        setIsFundedListing(fundedListings && fundedListings.length > 0);
      }
    } catch (error) {
      console.error("Error fetching eligibility:", error);
    }
  };

  const handleSubscribe = async (paymentMethod: "paystack" | "credits" | "sponsored") => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubscribing(true);

    try {
      // Create subscription record
      const subscriptionData: any = {
        user_id: user.id,
        listing_id: id,
        payment_method: paymentMethod,
        status: "pending",
      };

      if (paymentMethod === "credits") {
        if (userCredits < (listing?.credits_price || 0)) {
          throw new Error("Insufficient credits");
        }
        subscriptionData.credits_used = listing?.credits_price;
        subscriptionData.status = "active";
        subscriptionData.started_at = new Date().toISOString();
      } else if (paymentMethod === "sponsored") {
        subscriptionData.status = "active";
        subscriptionData.started_at = new Date().toISOString();
        subscriptionData.cohort_id = userCohorts[0]?.id;
      } else {
        subscriptionData.amount_paid = listing?.base_price;
        // In production, integrate with Paystack here
      }

      const { error: subError } = await supabase
        .from("user_subscriptions")
        .insert(subscriptionData);

      if (subError) throw subError;

      // Deduct credits if paid with credits
      if (paymentMethod === "credits" && listing?.credits_price) {
        // Update wallet balance
        const { data: wallet } = await supabase
          .from("credits_wallet")
          .select("balance")
          .eq("user_id", user.id)
          .single();

        if (wallet) {
          const newBalance = wallet.balance - listing.credits_price;
          await supabase
            .from("credits_wallet")
            .update({ balance: newBalance, total_spent: newBalance })
            .eq("user_id", user.id);

          // Log transaction
          await supabase
            .from("credits_transactions")
            .insert({
              user_id: user.id,
              amount: -listing.credits_price,
              transaction_type: "subscription",
              reference_id: id,
              description: `Subscription to ${listing.title}`,
              balance_after: newBalance
            });
        }
      }

      toast({
        title: "Subscription successful!",
        description: "You now have access to this listing",
      });

      setSubscribeDialog(false);
      navigate("/my-subscriptions");
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Listing not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Image */}
            {listing.thumbnail_url ? (
              <img
                src={listing.thumbnail_url}
                alt={listing.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center text-8xl">
                💻
              </div>
            )}

            {/* Title and Description */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{listing.title}</h1>
                  <p className="text-xl text-muted-foreground">{listing.short_description}</p>
                </div>
                <Badge className="capitalize">{listing.listing_type}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{listing.delivery_mode.replace("_", " ")}</span>
                </div>
                {listing.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{listing.rating.toFixed(1)} ({listing.total_reviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{listing.total_subscriptions} subscriptions</span>
                </div>
              </div>

              {isFundedListing && (
                <Card className="bg-blue-50 border-blue-200 mb-6">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">Sponsored Access Available</p>
                      <p className="text-sm text-blue-700">
                        This listing is available at no cost through your cohort membership
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({listing.total_reviews})</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      {listing.description.split("\n").map((para, i) => (
                        <p key={i} className="mb-4">{para}</p>
                      ))}
                    </div>

                    {listing.tags && listing.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {listing.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {listing.reviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No reviews yet. Be the first to review this listing!
                    </CardContent>
                  </Card>
                ) : (
                  listing.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.user.first_name[0]}{review.user.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold">
                                {review.user.first_name} {review.user.last_name}
                              </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                            <p>{review.review_text}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  {listing.base_price ? (
                    <p className="text-3xl font-bold">R{listing.base_price.toFixed(2)}</p>
                  ) : (
                    <p className="text-lg text-muted-foreground">Contact for pricing</p>
                  )}
                  {listing.credits_price && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Coins className="w-4 h-4" />
                      or {listing.credits_price} Kumii Credits
                    </p>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setSubscribeDialog(true)}
                  disabled={!user}
                >
                  Subscribe Now
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    Sign in to subscribe
                  </p>
                )}

                {isFundedListing && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Free with your cohort</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold mb-4">Provider</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {listing.provider.first_name[0]}{listing.provider.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {listing.provider.first_name} {listing.provider.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{listing.provider.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subscribe Dialog */}
        <Dialog open={subscribeDialog} onOpenChange={setSubscribeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscribe to {listing.title}</DialogTitle>
              <DialogDescription>
                Choose your payment method to access this listing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {isFundedListing && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleSubscribe("sponsored")}
                  disabled={isSubscribing}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Use Sponsored Access</p>
                    <p className="text-xs text-muted-foreground">
                      Free through {userCohorts[0]?.sponsor_name}
                    </p>
                  </div>
                </Button>
              )}

              {listing.credits_price && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleSubscribe("credits")}
                  disabled={isSubscribing || userCredits < listing.credits_price}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Pay with Credits</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.credits_price} credits (You have: {userCredits})
                    </p>
                  </div>
                </Button>
              )}

              {listing.base_price && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleSubscribe("paystack")}
                  disabled={isSubscribing}
                >
                  💳
                  <div className="flex-1 text-left ml-2">
                    <p className="font-semibold">Pay with Card</p>
                    <p className="text-xs text-muted-foreground">
                      R{listing.base_price.toFixed(2)} via Paystack
                    </p>
                  </div>
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setSubscribeDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ListingDetail;

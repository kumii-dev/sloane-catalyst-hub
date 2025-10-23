import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useListingDetail } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Users, Coins, ArrowLeft, Shield, CheckCircle, Mail, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  
  // Use optimized query hook
  const { data: listing, isLoading, error: queryError } = useListingDetail(id);
  
  const [subscribeDialog, setSubscribeDialog] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [userCohorts, setUserCohorts] = useState<any[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const [isFundedListing, setIsFundedListing] = useState(false);

  useEffect(() => {
    if (queryError) {
      toast({
        title: "Error loading listing",
        description: "Failed to load listing details",
        variant: "destructive",
      });
      navigate("/services");
    }
  }, [queryError, toast, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchUserEligibility();
    }
  }, [user, id]);

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

  if (isLoading) {
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            {listing.thumbnail_url ? (
              <div className="w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <img
                  src={listing.thumbnail_url}
                  alt={listing.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-muted/50 to-muted rounded-xl flex items-center justify-center">
                <span className="text-6xl">💻</span>
              </div>
            )}

            {/* Category Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-sky-500 hover:bg-sky-600">
                {listing.listing_type === 'software' ? 'Startup Support & Advisory' : listing.listing_type}
              </Badge>
              {isFundedListing && (
                <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                  Cohort Partner
                </Badge>
              )}
            </div>

            {/* Title and Meta */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{listing.short_description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                {listing.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{listing.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({listing.total_reviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{listing.total_subscriptions} subscribers</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* About This Service */}
                <div>
                  <h2 className="text-xl font-bold mb-4">About This Service</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Target Industries */}
                {listing.tags && listing.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Target Industries</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cohort Benefits */}
                {isFundedListing && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Cohort Benefits</h2>
                    <p className="text-green-600 font-medium">
                      Cohort members receive 50% discount on first assessment and priority support
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Key Features</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">AI-powered analysis and recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Comprehensive assessment across multiple domains</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Instant credit scores and funding eligibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Share results securely with funders</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6">
                {listing.reviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No reviews yet. Be the first to review this service!
                    </CardContent>
                  </Card>
                ) : (
                  listing.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.user?.first_name?.[0] || 'U'}{review.user?.last_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold">
                                {review.user?.first_name || 'Anonymous'} {review.user?.last_name || ''}
                              </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-muted-foreground">{review.review_text}</p>
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
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Pricing</h3>
                  
                  {/* Subscription Packages */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-3">Kumii Credits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>1 Month</span>
                          <span className="font-semibold">{listing.credits_price || 20} Credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3 Months</span>
                          <span className="font-semibold">{listing.credits_price ? listing.credits_price * 2.5 : 50} Credits</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>6 Months</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{listing.credits_price ? listing.credits_price * 4.5 : 90} Credits</span>
                            <Badge variant="secondary" className="bg-sky-500 text-white text-xs">Save 10%</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {listing.base_price && (
                      <div>
                        <h4 className="font-semibold text-orange-600 mb-3">Credit Card (ZAR)</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>1 Month</span>
                            <span className="font-semibold">R{listing.base_price.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>3 Months</span>
                            <span className="font-semibold">R{(listing.base_price * 2.5).toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>6 Months</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">R{(listing.base_price * 4.5).toFixed(0)}</span>
                              <Badge variant="secondary" className="bg-sky-500 text-white text-xs">Save 10%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isFundedListing && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700">
                          Exclusive access for sponsored programme members
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                  onClick={() => setSubscribeDialog(true)}
                  disabled={!user}
                >
                  Subscribe
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    Sign in to subscribe
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Provider</h3>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-lg font-bold">
                      {listing.provider?.first_name?.[0] || 'P'}{listing.provider?.last_name?.[0] || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">
                        {listing.provider?.first_name || 'Provider'} {listing.provider?.last_name || ''}
                      </p>
                      {listing.rating >= 4 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold">{listing.rating.toFixed(0)}</span>
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Leading provider of innovative business solutions for startups and SMEs
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-orange-600" asChild>
                    <a href={`mailto:${listing.provider?.email || ''}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Email
                    </a>
                  </Button>
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

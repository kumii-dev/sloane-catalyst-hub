import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Users, Globe, Mail, Phone, Check, ExternalLink, ArrowLeft, CreditCard, Coins, UsersIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import kumiiLogo from "@/assets/kumi-logo.png";

interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  short_description: string;
  key_features: string[];
  target_industries: string[];
  service_type: string;
  pricing_type: string;
  base_price?: number;
  credits_price?: number;
  cohort_benefits?: string;
  rating: number;
  total_reviews: number;
  total_subscribers: number;
  banner_image_url?: string;
  demo_url?: string;
  documentation_url?: string;
  service_providers: {
    id: string;
    company_name: string;
    description?: string;
    logo_url?: string;
    website?: string;
    contact_email?: string;
    phone?: string;
    is_verified: boolean;
    is_cohort_partner: boolean;
    rating: number;
    total_reviews: number;
  };
  service_categories: {
    name: string;
    slug: string;
  };
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  profiles: {
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
  };
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchServiceDetail();
      fetchReviews();
    }
  }, [id]);

  const fetchServiceDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          service_providers (*),
          service_categories (name, slug)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("service_reviews")
        .select("*")
        .eq("service_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // For now, we'll create mock profile data since the relation doesn't exist yet
      const reviewsWithProfiles = (data || []).map(review => ({
        ...review,
        profiles: {
          first_name: "Anonymous",
          last_name: "User",
          profile_picture_url: undefined
        }
      }));
      
      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubscribe = async () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentMethod = (method: 'card' | 'credits' | 'cohort') => {
    setShowPaymentDialog(false);
    toast({
      title: "Feature Coming Soon",
      description: `${method === 'card' ? 'Credit card' : method === 'credits' ? 'Credits' : 'Cohort'} payment will be available soon!`,
    });
  };

  const formatPrice = () => {
    if (!service) return '';
    if (service.pricing_type === 'free') return 'Free';
    if (service.pricing_type === 'contact_for_pricing') return 'Contact for pricing';
    if (service.credits_price) return `${service.credits_price} credits`;
    if (service.base_price) return `$${service.base_price}`;
    return 'View pricing';
  };

  if (loading) {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-8">The service you're looking for doesn't exist or has been removed.</p>
          <Link to="/services">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link to="/services" className="hover:text-primary">Services</Link>
          <span>/</span>
          <Link to={`/services/category/${service.service_categories.slug}`} className="hover:text-primary">
            {service.service_categories.name}
          </Link>
          <span>/</span>
          <span>{service.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              {service.banner_image_url && (
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg mb-6 flex items-center justify-center p-8">
                  <img 
                    src={service.banner_image_url} 
                    alt={service.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{service.service_categories.name}</Badge>
                    {service.service_providers.is_cohort_partner && (
                      <Badge className="bg-orange-500">Cohort Partner</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
                  <p className="text-lg text-muted-foreground">{service.short_description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{service.rating}</span>
                  <span className="ml-1">({service.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{service.total_subscribers} subscribers</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{service.description}</p>
                  </CardContent>
                </Card>

                {service.target_industries && service.target_industries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Target Industries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {service.target_industries.map((industry, index) => (
                          <Badge key={index} variant="outline">{industry}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {service.cohort_benefits && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cohort Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-600">{service.cohort_benefits}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.key_features?.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarImage src={review.profiles?.profile_picture_url} />
                              <AvatarFallback>
                                {review.profiles?.first_name?.[0]}{review.profiles?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium">
                                  {review.profiles?.first_name} {review.profiles?.last_name}
                                </span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.title && (
                                <h4 className="font-medium mb-2">{review.title}</h4>
                              )}
                              {review.comment && (
                                <p className="text-muted-foreground">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No reviews yet. Be the first to review this service!
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  <div>
                    <h3 className="font-semibold mb-3">Subscription Packages</h3>
                    
                    {/* Kumii Credits Packages */}
                    <div className="space-y-2 mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">Kumii Credits</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>1 Month</span>
                          <span className="font-semibold">20 Credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3 Months</span>
                          <span className="font-semibold">50 Credits</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>6 Months</span>
                          <span className="font-semibold">90 Credits <Badge variant="secondary" className="ml-2 text-xs">Save 10%</Badge></span>
                        </div>
                      </div>
                    </div>

                    {/* Credit Card Packages */}
                    <div className="space-y-2 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-2">Credit Card (ZAR)</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>1 Month</span>
                          <span className="font-semibold">R200</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3 Months</span>
                          <span className="font-semibold">R500</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>6 Months</span>
                          <span className="font-semibold">R900 <Badge variant="secondary" className="ml-2 text-xs">Save 10%</Badge></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    ✓ Exclusive access for sponsored programme members
                  </div>
                </div>
                <Button className="w-full mb-4" onClick={handleSubscribe}>
                  {service.service_type === 'subscription' ? 'Subscribe' : 
                   service.service_type === 'session_based' ? 'Book Session' : 'Get Started'}
                </Button>
                {service.demo_url && (
                  <Button variant="outline" className="w-full mb-2" asChild>
                    <a href={service.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Demo
                    </a>
                  </Button>
                )}
                {service.documentation_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={service.documentation_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentation
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card>
              <CardHeader>
                <CardTitle>Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={kumiiLogo} 
                    alt="Kumii"
                    className="w-12 h-12 rounded object-contain"
                  />
                  <div>
                    <h3 className="font-semibold">Kumii</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{service.service_providers.rating}</span>
                      </div>
                      {service.service_providers.is_verified && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {service.service_providers.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.service_providers.description}
                  </p>
                )}

                <div className="space-y-2">
                  {service.service_providers.website && (
                    <a 
                      href={service.service_providers.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  )}
                  {service.service_providers.contact_email && (
                    <a 
                      href={`mailto:${service.service_providers.contact_email}`}
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Email
                    </a>
                  )}
                  {service.service_providers.phone && (
                    <a 
                      href={`tel:${service.service_providers.phone}`}
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {service.service_providers.phone}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Options Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select how you'd like to subscribe to {service?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* Credit Card Option */}
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handlePaymentMethod('card')}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Credit Card</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pay ${service?.base_price || 'TBD'} with your credit card
                    </p>
                    <Badge variant="outline">Secure Payment</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kumii Credits Option */}
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handlePaymentMethod('credits')}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-orange-500/10 p-3">
                    <Coins className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Kumii Credits</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pay {service?.credits_price || 'TBD'} Kumii credits
                    </p>
                    <Badge variant="outline">Instant Access</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cohort Member Access Option */}
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handlePaymentMethod('cohort')}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="rounded-full bg-green-500/10 p-3">
                    <UsersIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Cohort Member Access</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {service?.cohort_benefits || 'Exclusive access for SMME & startup cohort members'}
                    </p>
                    <Badge className="bg-green-500">Exclusive Benefit</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ServiceDetail;
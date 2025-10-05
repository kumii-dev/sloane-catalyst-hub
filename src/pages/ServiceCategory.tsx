import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, Users, Zap, Award, ArrowLeft, Plus, List, Coins, BarChart3, Gift } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  short_description: string;
  rating: number;
  total_reviews: number;
  total_subscribers: number;
  pricing_type: string;
  base_price?: number;
  credits_price?: number;
  is_featured: boolean;
  banner_image_url?: string;
  service_providers: {
    company_name: string;
    logo_url?: string;
    is_verified: boolean;
    is_cohort_partner: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

interface SubCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
}

const ServiceCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [pricingFilter, setPricingFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchServices();
    }
  }, [category, sortBy, pricingFilter, providerFilter, ratingFilter, searchQuery]);

  const fetchCategoryData = async () => {
    try {
      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from("service_categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (categoryError) throw categoryError;

      // Fetch subcategories
      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from("service_categories")
        .select("id, name, description, slug")
        .eq("parent_id", categoryData.id)
        .eq("is_active", true)
        .order("sort_order");

      if (subCategoriesError) throw subCategoriesError;

      setCategory(categoryData);
      setSubCategories(subCategoriesData || []);
    } catch (error) {
      console.error("Error fetching category:", error);
      toast({
        title: "Error",
        description: "Failed to load category data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    if (!category) return;

    try {
      let query = supabase
        .from("services")
        .select(`
          *,
          service_providers (company_name, logo_url, is_verified, is_cohort_partner)
        `)
        .eq("category_id", category.id)
        .eq("is_active", true);

      // Apply search filter
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      // Apply pricing filter
      if (pricingFilter !== "all") {
        query = query.eq("pricing_type", pricingFilter as any);
      }

      // Apply provider filter
      if (providerFilter === "verified") {
        query = query.eq("service_providers.is_verified", true);
      } else if (providerFilter === "cohort") {
        query = query.eq("service_providers.is_cohort_partner", true);
      }

      // Apply rating filter
      if (ratingFilter !== "all") {
        const minRating = parseFloat(ratingFilter);
        query = query.gte("rating", minRating);
      }

      // Apply sorting
      switch (sortBy) {
        case "featured":
          query = query.order("is_featured", { ascending: false }).order("rating", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "popular":
          query = query.order("total_subscribers", { ascending: false });
          break;
        case "price_low":
          query = query.order("base_price", { ascending: true, nullsFirst: false });
          break;
        case "price_high":
          query = query.order("base_price", { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (service: Service) => {
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
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
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
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <div className="text-primary font-semibold text-3xl">💻</div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Software Services
          </h1>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            CRM, ERP, Accounting, HR, Marketing, Security, Analytics, and AI Tools
          </p>
          
          {/* Search Bar with Enhanced Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Smart Search: Find CRM, ERP, HR tools and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            
            {/* Filter Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Provider Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="cohort">Cohort Partners</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pricingFilter} onValueChange={setPricingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pricing</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="credits_only">Credits Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Action Badge Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              className="rounded-full px-8 py-6 bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5 mr-3" />
              <span className="font-semibold text-lg">Post New Listings</span>
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="rounded-full px-8 py-6 bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <List className="h-5 w-5 mr-3" />
              <span className="font-semibold text-lg">My Listings</span>
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="rounded-full px-8 py-6 bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="h-5 w-5 mr-3" />
              <span className="font-semibold text-lg">Explore Software</span>
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="rounded-full px-8 py-6 bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <Coins className="h-5 w-5 mr-3" />
              <span className="font-semibold text-lg">Earn Credits</span>
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="rounded-full px-8 py-6 bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              <span className="font-semibold text-lg">Subscription Insight</span>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Subcategories */}
        {subCategories.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Browse Subcategories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subCategories.map((subCategory) => (
                <Link key={subCategory.id} to={`/services/category/${subCategory.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="text-center">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {subCategory.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {subCategory.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Services Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Available Software Services</h2>
            <Button variant="ghost" onClick={() => { setSearchQuery(""); setPricingFilter("all"); setProviderFilter("all"); setRatingFilter("all"); }}>
              Clear All Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link key={service.id} to={`/services/${service.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  {service.banner_image_url && (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg"></div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {category.name}
                      </Badge>
                      {service.service_providers.is_cohort_partner && (
                        <Badge className="text-xs bg-orange-500">Cohort Partner</Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-1">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {service.short_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="flex items-center mr-4">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{service.rating}</span>
                          <span className="ml-1">({service.total_reviews})</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{service.total_subscribers}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {service.service_providers.logo_url ? (
                          <img 
                            src={service.service_providers.logo_url} 
                            alt={service.service_providers.company_name}
                            className="w-6 h-6 rounded mr-2"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-muted rounded mr-2"></div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {service.service_providers.company_name}
                        </span>
                        {service.service_providers.is_verified && (
                          <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {formatPrice(service)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No services found matching your criteria.</p>
            <Button onClick={() => { setSearchQuery(""); setPricingFilter("all"); setProviderFilter("all"); setRatingFilter("all"); }}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Stats Section */}
        {services.length > 0 && (
          <section className="bg-muted/30 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Trusted by the Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">{services.length}+</div>
                <div className="text-muted-foreground">Services Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {new Set(services.map(s => s.service_providers.company_name)).size}+
                </div>
                <div className="text-muted-foreground">Trusted Providers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {services.reduce((acc, s) => acc + s.total_subscribers, 0)}+
                </div>
                <div className="text-muted-foreground">Active Subscribers</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ServiceCategory;
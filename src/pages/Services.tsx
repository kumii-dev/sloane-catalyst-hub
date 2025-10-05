import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, Users, Zap, Award, Plus, List, Coins, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  parent_id?: string;
  sort_order: number;
}

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
  service_categories: {
    name: string;
    slug: string;
  };
}

const Services = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch main categories (no parent_id)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("service_categories")
        .select("*")
        .is("parent_id", null)
        .eq("is_active", true)
        .order("sort_order");

      if (categoriesError) throw categoriesError;

      // Fetch featured services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select(`
          *,
          service_providers (company_name, logo_url, is_verified, is_cohort_partner),
          service_categories (name, slug)
        `)
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(6);

      if (servicesError) throw servicesError;

      setCategories(categoriesData || []);
      setFeaturedServices(servicesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load services data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group categories by tier
  const businessEssentials = categories.filter(cat => 
    ['business-operations', 'accounting-finance', 'hr-people', 'customer-sales', 'marketing-analytics'].includes(cat.slug)
  );

  const growthInnovation = categories.filter(cat => 
    ['data-ai-analytics', 'integration-automation', 'industry-specific', 'developer-tools', 'startup-support'].includes(cat.slug)
  );

  const securityCompliance = categories.filter(cat => 
    ['cybersecurity-compliance', 'legal-governance', 'cloud-infrastructure', 'project-management', 'ecommerce-retail'].includes(cat.slug)
  );

  const filteredCategories = (activeTab === "all" ? categories : 
    activeTab === "business" ? businessEssentials :
    activeTab === "growth" ? growthInnovation : securityCompliance
  ).filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Software & Services Marketplace
          </h1>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Discover the best tools and services to grow your startup or SMME
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search categories, services, or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Button 
              variant="secondary" 
              size="default"
              className="rounded-full px-6 py-3 bg-[hsl(200,50%,60%)] hover:bg-[hsl(200,50%,55%)] text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="font-semibold">Post New Listings</span>
            </Button>
            <Button 
              variant="secondary" 
              size="default"
              className="rounded-full px-6 py-3 bg-[hsl(200,50%,60%)] hover:bg-[hsl(200,50%,55%)] text-white shadow-md hover:shadow-lg transition-all"
            >
              <List className="h-4 w-4 mr-2" />
              <span className="font-semibold">My Listings</span>
            </Button>
            <Button 
              variant="secondary" 
              size="default"
              className="rounded-full px-6 py-3 bg-[hsl(200,50%,60%)] hover:bg-[hsl(200,50%,55%)] text-white shadow-md hover:shadow-lg transition-all"
            >
              <Coins className="h-4 w-4 mr-2" />
              <span className="font-semibold">Earn Credits</span>
            </Button>
            <Button 
              variant="secondary" 
              size="default"
              className="rounded-full px-6 py-3 bg-[hsl(200,50%,60%)] hover:bg-[hsl(200,50%,55%)] text-white shadow-md hover:shadow-lg transition-all"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="font-semibold">Subscription Insight</span>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              {categories.length} Categories
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Trusted Providers
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Cohort Benefits
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="business">🏢 Business</TabsTrigger>
            <TabsTrigger value="growth">💡 Growth</TabsTrigger>
            <TabsTrigger value="security">🛡️ Security</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Service Categories */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {activeTab === "all" ? "All Categories" :
               activeTab === "business" ? "Business Essentials" :
               activeTab === "growth" ? "Growth & Innovation" : "Security & Infrastructure"}
            </h2>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Link key={category.id} to={`/services/category/${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2 hover:border-primary/50">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all transform group-hover:scale-110">
                      <span className="text-4xl">{category.icon}</span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors text-xl">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-sm mt-2">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="ghost" className="w-full group-hover:bg-primary/10 group-hover:text-primary font-semibold">
                      Explore Services →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No categories found matching your search.</p>
            </div>
          )}
        </section>

        {/* Featured Services */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Services</h2>
            <Link to="/services/all">
              <Button variant="outline">View All Services</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Link key={service.id} to={`/services/${service.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  {service.banner_image_url && (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg"></div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {service.service_categories.name}
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

        {/* Stats Section */}
        <section className="bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Join the Growing Community</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Services Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Trusted Providers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Services;
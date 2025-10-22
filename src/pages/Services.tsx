import { useState } from "react";
import { Link } from "react-router-dom";
import { useFeaturedServices, useServiceCategories } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Users, Zap, Award, Code, Briefcase, TrendingUp, Headphones, GraduationCap, Building2, Palette, Megaphone, Scale, DollarSign, UserCheck, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ListServiceButton } from "@/components/ListServiceButton";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use optimized query hooks with caching
  const { data: categories = [], isLoading: categoriesLoading } = useServiceCategories();
  const { data: featuredServices = [], isLoading: servicesLoading } = useFeaturedServices();
  
  const loading = categoriesLoading || servicesLoading;

  const formatPrice = (service: Service) => {
    if (service.pricing_type === 'free') return 'Free';
    if (service.pricing_type === 'contact_for_pricing') return 'Contact for pricing';
    if (service.credits_price) return `${service.credits_price} credits`;
    if (service.base_price) return `R${service.base_price}`;
    return 'View pricing';
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, typeof Code> = {
      'Code': Code,
      'Briefcase': Briefcase,
      'TrendingUp': TrendingUp,
      'Headphones': Headphones,
      'GraduationCap': GraduationCap,
      'Building2': Building2,
      'Palette': Palette,
      'Megaphone': Megaphone,
      'Scale': Scale,
      'DollarSign': DollarSign,
      'UserCheck': UserCheck,
      'Sparkles': Sparkles,
    };
    return icons[iconName] || Briefcase;
  };

  const getCategoryColor = (iconName: string) => {
    const colors: Record<string, string> = {
      'Code': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'Briefcase': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'TrendingUp': 'bg-gradient-to-br from-orange-500 to-orange-600',
      'Headphones': 'bg-gradient-to-br from-pink-500 to-pink-600',
      'GraduationCap': 'bg-gradient-to-br from-green-500 to-green-600',
      'Building2': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'Palette': 'bg-gradient-to-br from-rose-500 to-rose-600',
      'Megaphone': 'bg-gradient-to-br from-amber-500 to-amber-600',
      'Scale': 'bg-gradient-to-br from-slate-500 to-slate-600',
      'DollarSign': 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'UserCheck': 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      'Sparkles': 'bg-gradient-to-br from-violet-500 to-violet-600',
    };
    return colors[iconName] || 'bg-gradient-to-br from-gray-500 to-gray-600';
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
      <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Services Marketplace
          </h1>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Discover essential services for your startup growth. From software solutions to professional services, 
            find everything you need in one place.
          </p>
          
          <div className="mb-8">
            <ListServiceButton size="lg" className="shadow-lg" />
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search services, providers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-12 text-lg"
            />
            <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              500+ Services
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
        {/* Service Categories */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover services organized by category to help you find exactly what you need for your business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.filter((category) => category.slug !== 'software-services').map((category) => {
              const IconComponent = getIconComponent(category.icon);
              const colorClass = getCategoryColor(category.icon);
              return (
                <Link
                  key={category.id}
                  to={`/services/category/${category.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/20">
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 rounded-xl ${colorClass} flex items-center justify-center mx-auto mb-4 relative`}>
                        <IconComponent className="h-8 w-8 text-white" />
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-background text-foreground border border-border">
                          0
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
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
              <Link key={service.id} to={`/services/${service.id}`} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/20">
                  {service.banner_image_url && (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg overflow-hidden">
                      <img 
                        src={service.banner_image_url} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {service.service_categories.name}
                      </Badge>
                      {service.service_providers.is_cohort_partner && (
                        <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                          Cohort Partner
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem]">
                      {service.short_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Ratings and Subscribers */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.rating}</span>
                          <span className="text-muted-foreground">({service.total_reviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{service.total_subscribers}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-border/50"></div>
                    
                    {/* Provider and Price */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {service.service_providers.logo_url ? (
                          <img 
                            src={service.service_providers.logo_url} 
                            alt={service.service_providers.company_name}
                            className="w-6 h-6 rounded-sm flex-shrink-0 object-contain"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-muted rounded-sm flex-shrink-0"></div>
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm text-muted-foreground truncate">
                            {service.service_providers.company_name}
                          </span>
                          {service.service_providers.is_verified && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-5 flex-shrink-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-primary text-sm">
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
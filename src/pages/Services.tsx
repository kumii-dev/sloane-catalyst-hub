import { useState } from "react";
import { Link } from "react-router-dom";
import { useListings, useServiceCategories } from "@/hooks/useListings";
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

interface Listing {
  id: string;
  title: string;
  short_description: string;
  rating: number;
  total_reviews: number;
  total_subscriptions: number;
  base_price?: number;
  credits_price?: number;
  is_featured?: boolean;
  thumbnail_url?: string;
  listing_type: string;
  status: string;
}

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use optimized query hooks with caching
  const { data: categories = [], isLoading: categoriesLoading } = useServiceCategories();
  const { data: listingsData, isLoading: listingsLoading } = useListings({ status: 'active' }, 0);
  const featuredListings = listingsData?.listings || [];
  
  const loading = categoriesLoading || listingsLoading;

  const formatPrice = (listing: Listing) => {
    if (listing.credits_price) return `${listing.credits_price} credits`;
    if (listing.base_price) return `R${listing.base_price}`;
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
              const linkTo = category.slug === 'professional-services' 
                ? '/find-advisor' 
                : `/services/category/${category.slug}`;
              return (
                <Link
                  key={category.id}
                  to={linkTo}
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
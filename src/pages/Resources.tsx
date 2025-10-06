import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, BookOpen, GraduationCap, Download, Users, HelpCircle, Star, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent_id: string | null;
  sort_order: number;
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  resource_type: string;
  access_level: string;
  thumbnail_url: string;
  duration_minutes: number;
  difficulty_level: string;
  rating: number;
  total_ratings: number;
  is_featured: boolean;
  cohort_benefits: string;
  sponsor_name: string;
  tags: string[];
  resource_categories: ResourceCategory;
}

const Resources = () => {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch main categories (parent_id is null)
      const { data: categoriesData } = await supabase
        .from('resource_categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('sort_order');

      // Fetch featured resources
      const { data: resourcesData } = await supabase
        .from('resources')
        .select(`
          *,
          resource_categories (*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6);

      setCategories(categoriesData || []);
      setFeaturedResources(resourcesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      GraduationCap,
      BookOpen,
      Download,
      Users,
      HelpCircle,
      Star,
      Clock,
      Award
    };
    return icons[iconName] || BookOpen;
  };

  const getCategoryColor = (slug: string) => {
    const colors: Record<string, string> = {
      'learning-hub': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'knowledge-library': 'bg-gradient-to-br from-green-500 to-green-600',
      'tools-downloads': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'community-networking': 'bg-gradient-to-br from-orange-500 to-orange-600',
      'support-help': 'bg-gradient-to-br from-pink-500 to-pink-600'
    };
    return colors[slug] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <Layout showSidebar={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="relative py-18 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Resources Hub
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to build, grow, and scale your startup. From learning resources to business tools and community support.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search resources, courses, tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-background/50 backdrop-blur-sm border-border/50"
              />
              <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Resource Categories Grid */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover resources organized by category to help you find exactly what you need for your startup journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Link
                  key={category.id}
                  to={`/resources/category/${category.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/20">
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 rounded-xl ${getCategoryColor(category.slug)} flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary">
                        Explore Resources
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Featured Resources</h2>
                <p className="text-muted-foreground">
                  Hand-picked resources to accelerate your startup growth
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/resources/featured">View All Featured</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource) => (
                <Link
                  key={resource.id}
                  to={`/resources/${resource.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      {resource.thumbnail_url ? (
                        <img
                          src={resource.thumbnail_url}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      {resource.cohort_benefits && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary">
                            Cohort
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.resource_type}
                        </Badge>
                        {resource.duration_minutes && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {resource.duration_minutes}min
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{resource.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({resource.total_ratings})
                          </span>
                        </div>
                        {resource.access_level !== 'public' && (
                          <Badge variant="outline" className="text-xs">
                            {resource.access_level === 'cohort_only' ? 'Cohort Only' : 'Premium'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Access Tabs */}
        <section>
          <Tabs defaultValue="learning" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="learning" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Digital Skills Courses
                    </CardTitle>
                    <CardDescription>
                      Master essential digital skills with our comprehensive course library
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link to="/resources/category/digital-skills">Browse Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Entrepreneurial Training
                    </CardTitle>
                    <CardDescription>
                      Build your business acumen with expert-led entrepreneurship programs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link to="/resources/category/entrepreneurial-skills">Start Learning</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Calculators</CardTitle>
                    <CardDescription>Financial planning and valuation tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link to="/resources/category/calculators">Access Tools</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Starter Kits</CardTitle>
                    <CardDescription>CRM, ERP, and business tool packages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link to="/resources/category/starter-kits">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Templates</CardTitle>
                    <CardDescription>Business documents and templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link to="/resources/category/templates">Download</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="community" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Connect & Grow Together
                  </CardTitle>
                  <CardDescription>
                    Join our vibrant community of entrepreneurs and innovators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" asChild>
                      <Link to="/resources/events">Upcoming Events</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/resources/network">Network Directory</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Help & Support
                    </CardTitle>
                    <CardDescription>
                      Get help when you need it most
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/resources/faq">Frequently Asked Questions</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/resources/tutorials">Video Tutorials</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/resources/contact">Contact Support</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>
                      New to the platform? Start here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link to="/resources/getting-started">Get Started Guide</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
};

export default Resources;
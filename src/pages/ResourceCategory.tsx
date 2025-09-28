import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, Filter, Star, Clock, Download, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent_id: string | null;
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
}

const ResourceCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<ResourceCategory | null>(null);
  const [subcategories, setSubcategories] = useState<ResourceCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, typeFilter, accessFilter]);

  const fetchCategoryData = async () => {
    try {
      // Fetch category info
      const { data: categoryData } = await supabase
        .from('resource_categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!categoryData) return;

      setCategory(categoryData);

      // Fetch subcategories
      const { data: subcategoriesData } = await supabase
        .from('resource_categories')
        .select('*')
        .eq('parent_id', categoryData.id)
        .eq('is_active', true)
        .order('sort_order');

      // Fetch resources for this category and its subcategories
      const categoryIds = [categoryData.id, ...(subcategoriesData?.map(sub => sub.id) || [])];
      
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      setSubcategories(subcategoriesData || []);
      setResources(resourcesData || []);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(resource => resource.resource_type === typeFilter);
    }

    // Access filter
    if (accessFilter !== "all") {
      filtered = filtered.filter(resource => resource.access_level === accessFilter);
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type: string) => {
    const icons: Record<string, any> = {
      article: BookOpen,
      video: BookOpen,
      course: Award,
      template: Download,
      tool: Download,
      calculator: Download,
      checklist: Download,
      case_study: Award,
      guide: BookOpen,
      webinar: BookOpen,
      podcast: BookOpen
    };
    return icons[type] || BookOpen;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-8">The resource category you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/resources">Back to Resources</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/resources" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Link>
            </Button>
          </div>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {category.description}
            </p>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="tool">Tools</SelectItem>
                  <SelectItem value="calculator">Calculators</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={accessFilter} onValueChange={setAccessFilter}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="Access Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Access</SelectItem>
                  <SelectItem value="public">Free</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="cohort_only">Cohort Only</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Subcategories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  to={`/resources/category/${subcategory.slug}`}
                  className="group"
                >
                  <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {subcategory.name}
                      </CardTitle>
                      <CardDescription>{subcategory.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Resources Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              Resources ({filteredResources.length})
            </h2>
          </div>

          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setAccessFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const IconComponent = getResourceIcon(resource.resource_type);
                return (
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
                          <IconComponent className="h-12 w-12 text-muted-foreground" />
                        )}
                        {resource.is_featured && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
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
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
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
                              {resource.access_level === 'cohort_only' ? 'Cohort Only' : 
                               resource.access_level === 'registered' ? 'Members' : 'Premium'}
                            </Badge>
                          )}
                        </div>
                        
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {resource.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {resource.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{resource.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResourceCategory;
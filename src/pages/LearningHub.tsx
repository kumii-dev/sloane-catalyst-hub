import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Star, Clock, Users, TrendingUp, Award, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const LearningHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, selectedCategory, selectedLevel, selectedMode],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          learning_providers (
            organization_name,
            logo_url,
            is_verified
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.textSearch('search_vector', searchQuery);
      }
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel);
      }
      if (selectedMode !== 'all') {
        query = query.eq('delivery_mode', selectedMode);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: featuredCourses } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          learning_providers (
            organization_name,
            logo_url,
            is_verified
          )
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: recommendations } = useQuery({
    queryKey: ['course-recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('course_recommendations')
        .select(`
          *,
          courses (
            *,
            learning_providers (
              organization_name,
              logo_url,
              is_verified
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('match_score', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Finance', label: 'Finance & Accounting' },
    { value: 'Marketing', label: 'Marketing & Sales' },
    { value: 'Tech', label: 'Technology & Dev' },
    { value: 'Legal', label: 'Legal & Compliance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Leadership', label: 'Leadership' },
    { value: 'Strategy', label: 'Strategy' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Kumii Learning Hub</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            Empower your entrepreneurial journey with expert-led courses, workshops, and learning paths designed for African startups and SMMEs
          </p>
          
          {/* Search Bar */}
          <div className="flex gap-4 mb-6 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search courses, topics, or providers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{courses?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">2,400+</p>
                  <p className="text-sm text-muted-foreground">Active Learners</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">1,200+</p>
                  <p className="text-sm text-muted-foreground">Certificates Issued</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="recommended">For You</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Delivery Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="self_paced">Self-Paced</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="blended">Blended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses?.map(course => (
                  <Link key={course.id} to={`/learning/courses/${course.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      {course.thumbnail_url && (
                        <div className="h-48 w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={course.is_free ? 'secondary' : 'default'}>
                            {course.is_free ? 'Free' : `${course.currency} ${course.price}`}
                          </Badge>
                          <Badge variant="outline">{course.level}</Badge>
                        </div>
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.short_description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration_text || `${course.duration_hours}h`}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.total_enrollments} enrolled</span>
                          </div>
                          {course.average_rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span>{course.average_rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        {course.learning_providers && (
                          <div className="flex items-center gap-2">
                            {course.learning_providers.logo_url && (
                              <img 
                                src={course.learning_providers.logo_url} 
                                alt={course.learning_providers.organization_name}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            )}
                            <span className="text-sm font-medium">
                              {course.learning_providers.organization_name}
                            </span>
                            {course.learning_providers.is_verified && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">View Course</Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommended" className="space-y-6">
            {recommendations && recommendations.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Recommended for You</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map(rec => (
                    <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge>Match Score: {rec.match_score}%</Badge>
                          <Badge variant="outline">{rec.recommendation_type.replace('_', ' ')}</Badge>
                        </div>
                        <CardTitle>{rec.courses.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {rec.courses.short_description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Why we recommend this:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {rec.match_reasons?.map((reason, idx) => (
                              <li key={idx}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link to={`/learning/courses/${rec.courses.slug}`} className="w-full">
                          <Button className="w-full">Explore Course</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recommendations yet. Complete your profile to get personalized course suggestions!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {featuredCourses && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCourses.map(course => (
                  <Link key={course.id} to={`/learning/courses/${course.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <div className="relative">
                        {course.thumbnail_url && (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <Badge className="absolute top-2 right-2 bg-primary">
                          Featured
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.short_description}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button className="w-full">Learn More</Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending">
            <p className="text-center text-muted-foreground py-12">Trending courses coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningHub;
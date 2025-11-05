import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, BookOpen, Star, Clock, Users, TrendingUp, Award, Filter, Sparkles, Target, Zap, GraduationCap } from 'lucide-react';
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
        .order('is_featured', { ascending: false })
        .order('average_rating', { ascending: false });

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
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: learningPaths } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_path_courses (
            courses (
              id,
              title,
              thumbnail_url
            )
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: userEnrollments } = useQuery({
    queryKey: ['user-enrollments-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id);
      
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
    { value: 'Strategy', label: 'Business Strategy' }
  ];

  const inProgress = userEnrollments?.filter(e => e.status === 'in_progress') || [];
  const completed = userEnrollments?.filter(e => e.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-background py-16 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-up">
              <div className="p-3 bg-primary/10 rounded-xl">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Learn. Grow. Succeed.
                </h1>
              </div>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Enterprise-grade learning for African entrepreneurs. Personalized paths, expert mentors, and recognized credentials.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="bg-card shadow-medium rounded-xl p-2 mb-8">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search courses, skills, or learning paths..."
                    className="pl-12 border-0 bg-transparent focus-visible:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Search
                </Button>
              </div>
            </div>

            {/* Personal Progress Stats */}
            {userEnrollments && userEnrollments.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{inProgress.length}</p>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <Award className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{completed.length}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Zap className="h-6 w-6 text-accent-dark" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {Math.round((completed.length / (userEnrollments?.length || 1)) * 100)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Personalized Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Recommended for You</h2>
              </div>
              <Button variant="ghost">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map(rec => (
                <Link key={rec.id} to={`/learning/courses/${rec.courses.slug}`}>
                  <Card className="h-full hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className="relative">
                      {rec.courses.thumbnail_url && (
                        <div className="h-48 w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={rec.courses.thumbnail_url} 
                            alt={rec.courses.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-primary shadow-lg">
                        {rec.match_score}% Match
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{rec.recommendation_type.replace('_', ' ')}</Badge>
                        {rec.courses.is_free ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : (
                          <Badge>{rec.courses.currency} {rec.courses.price}</Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {rec.courses.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {rec.courses.short_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{rec.courses.duration_text || `${rec.courses.duration_hours}h`}</span>
                        </div>
                        {rec.courses.average_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-rating text-rating" />
                            <span className="font-medium">{rec.courses.average_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Learning Paths */}
        {learningPaths && learningPaths.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Curated Learning Paths</h2>
              </div>
              <Link to="/learning/paths">
                <Button variant="ghost">View All Paths</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map(path => (
                <Card key={path.id} className="hover:shadow-medium transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-gradient-to-r from-primary to-accent">
                        Learning Path
                      </Badge>
                      <Badge variant="outline">{path.level}</Badge>
                    </div>
                    <CardTitle className="text-2xl">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{path.learning_path_courses?.length || 0} courses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{path.estimated_duration_hours} hours</span>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {path.learning_path_courses?.slice(0, 4).map((lpc, idx) => (
                          lpc.courses?.thumbnail_url && (
                            <div key={idx} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                              <img 
                                src={lpc.courses.thumbnail_url} 
                                alt={lpc.courses.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )
                        ))}
                        {(path.learning_path_courses?.length || 0) > 4 && (
                          <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                            +{(path.learning_path_courses?.length || 0) - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/learning/paths/${path.id}`} className="w-full">
                      <Button className="w-full" variant="outline">Explore Path</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Courses */}
        <section>
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-auto grid-cols-4">
                <TabsTrigger value="all">All Courses</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="new">New Releases</TabsTrigger>
                <TabsTrigger value="popular">Most Popular</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
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
                  <SelectTrigger className="w-[150px]">
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
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="self_paced">Self-Paced</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="blended">Blended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="h-48 w-full rounded-t-lg" />
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses?.map(course => (
                    <Link key={course.id} to={`/learning/courses/${course.slug}`}>
                      <Card className="h-full hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <div className="relative">
                          {course.thumbnail_url ? (
                            <div className="h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                              <img 
                                src={course.thumbnail_url} 
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                              <BookOpen className="h-16 w-16 text-primary/40" />
                            </div>
                          )}
                          {course.is_featured && (
                            <Badge className="absolute top-3 left-3 bg-rating shadow-lg">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={course.is_free ? 'secondary' : 'default'} className="text-xs">
                              {course.is_free ? 'Free' : `${course.currency} ${course.price}`}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">{course.level}</Badge>
                          </div>
                          <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{course.duration_text || `${course.duration_hours}h`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{course.total_enrollments}</span>
                            </div>
                            {course.average_rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-rating text-rating" />
                                <span className="font-medium">{course.average_rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {course.learning_providers && (
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {course.learning_providers.organization_name}
                              </div>
                              {course.learning_providers.is_verified && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1">✓</Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending">
              <p className="text-center text-muted-foreground py-12">Trending courses coming soon...</p>
            </TabsContent>

            <TabsContent value="new">
              <p className="text-center text-muted-foreground py-12">New releases coming soon...</p>
            </TabsContent>

            <TabsContent value="popular">
              <p className="text-center text-muted-foreground py-12">Popular courses coming soon...</p>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

export default LearningHub;

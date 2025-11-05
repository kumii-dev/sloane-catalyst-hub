import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Award, TrendingUp, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const MyLearning = () => {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            *,
            learning_providers (
              organization_name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: badges } = useQuery({
    queryKey: ['my-badges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          learning_badges (
            name,
            description,
            badge_image_url,
            issuer_name
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const inProgress = enrollments?.filter(e => e.status === 'in_progress') || [];
  const completed = enrollments?.filter(e => e.status === 'completed') || [];
  const totalProgress = enrollments?.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) || 0;
  const avgProgress = enrollments?.length ? Math.round(totalProgress / enrollments.length) : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-primary/10 rounded-xl">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">My Learning Journey</h1>
              <p className="text-xl text-muted-foreground">Track progress, earn badges, and achieve your goals</p>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card/80 backdrop-blur shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{enrollments?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total courses</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <div className="p-2 bg-accent/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-accent-dark" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent-dark">{inProgress.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Keep learning!</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{completed.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Well done!</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <div className="p-2 bg-rating/10 rounded-lg">
                  <Award className="h-5 w-5 text-rating" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-rating">{badges?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Achievements</p>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress Bar */}
          {enrollments && enrollments.length > 0 && (
            <Card className="mt-6 bg-card/80 backdrop-blur shadow-medium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Overall Progress</h3>
                    <p className="text-sm text-muted-foreground">Average completion across all courses</p>
                  </div>
                  <div className="text-3xl font-bold text-primary">{avgProgress}%</div>
                </div>
                <Progress value={avgProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  You're {avgProgress >= 80 ? 'crushing it!' : avgProgress >= 50 ? 'making great progress!' : 'just getting started!'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="in-progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="badges">Badges ({badges?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgress.map(enrollment => (
                <Card key={enrollment.id} className="hover:shadow-strong transition-all duration-300 hover:-translate-y-1 group">
                  <div className="relative">
                    {enrollment.courses.thumbnail_url ? (
                      <div className="h-40 w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={enrollment.courses.thumbnail_url}
                          alt={enrollment.courses.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg" />
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="bg-background/90 backdrop-blur px-3 py-1 rounded-full">
                        <span className="text-sm font-bold text-primary">{enrollment.progress_percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {enrollment.courses.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {enrollment.courses.learning_providers?.logo_url && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={enrollment.courses.learning_providers.logo_url} />
                          <AvatarFallback className="text-xs">
                            {enrollment.courses.learning_providers.organization_name[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <CardDescription className="text-xs">
                        {enrollment.courses.learning_providers?.organization_name}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Progress value={enrollment.progress_percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {enrollment.progress_percentage < 25 ? 'Just getting started' :
                         enrollment.progress_percentage < 50 ? 'Making progress' :
                         enrollment.progress_percentage < 75 ? 'More than halfway there!' :
                         'Almost done!'}
                      </p>
                    </div>
                    
                    {enrollment.last_accessed_at && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last accessed {new Date(enrollment.last_accessed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <Link to={`/learning/player/${enrollment.courses.slug}`}>
                      <Button className="w-full gap-2">
                        <PlayCircle className="h-4 w-4" />
                        Continue Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No courses in progress</p>
              <Link to="/learning">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {completed.map(enrollment => (
                <Card key={enrollment.id} className="hover:shadow-medium transition-shadow">
                  <div className="relative">
                    {enrollment.courses.thumbnail_url ? (
                      <div className="h-32 w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={enrollment.courses.thumbnail_url}
                          alt={enrollment.courses.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-gradient-to-br from-success/20 to-primary/20 rounded-t-lg" />
                    )}
                    <Badge className="absolute top-2 right-2 bg-success shadow-lg">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base">{enrollment.courses.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {enrollment.courses.learning_providers?.organization_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      ✓ Completed {new Date(enrollment.completed_at!).toLocaleDateString()}
                    </div>
                    
                    {enrollment.certificate_issued_at && (
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Award className="h-3 w-3" />
                        Certificate
                      </Button>
                    )}
                    
                    <Link to={`/learning/courses/${enrollment.courses.slug}`}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Review Course
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed courses yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4">
            {enrollments?.map(enrollment => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {enrollment.courses.thumbnail_url && (
                        <img 
                          src={enrollment.courses.thumbnail_url}
                          alt={enrollment.courses.title}
                          className="h-20 w-32 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{enrollment.courses.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {enrollment.courses.learning_providers?.organization_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                          <Badge variant={
                            enrollment.status === 'completed' ? 'default' : 
                            enrollment.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {enrollment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{enrollment.progress_percentage}%</div>
                        <div className="text-xs text-muted-foreground">Complete</div>
                      </div>
                      <Link to={`/learning/player/${enrollment.courses.slug}`}>
                        <Button>
                          {enrollment.status === 'completed' ? 'Review' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          {badges && badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {badges.map(userBadge => (
                <Card key={userBadge.id} className="text-center">
                  <CardHeader>
                    {userBadge.learning_badges.badge_image_url ? (
                      <img 
                        src={userBadge.learning_badges.badge_image_url}
                        alt={userBadge.learning_badges.name}
                        className="h-24 w-24 mx-auto mb-4 object-contain"
                      />
                    ) : (
                      <Award className="h-24 w-24 mx-auto mb-4 text-primary" />
                    )}
                    <CardTitle className="text-lg">{userBadge.learning_badges.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {userBadge.learning_badges.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      Issued by {userBadge.learning_badges.issuer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No badges earned yet</p>
              <p className="text-sm text-muted-foreground">Complete courses to earn badges and certificates!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default MyLearning;
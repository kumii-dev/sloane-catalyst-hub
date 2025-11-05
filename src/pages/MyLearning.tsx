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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Learning</h1>
        <p className="text-muted-foreground">Track your progress and continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="in-progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="badges">Badges ({badges?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgress.map(enrollment => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {enrollment.courses.learning_providers?.logo_url && (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={enrollment.courses.learning_providers.logo_url} />
                            <AvatarFallback>
                              {enrollment.courses.learning_providers.organization_name[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <CardTitle className="line-clamp-2">{enrollment.courses.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {enrollment.courses.learning_providers?.organization_name}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{enrollment.progress_percentage}%</span>
                      </div>
                      <Progress value={enrollment.progress_percentage} />
                    </div>
                    
                    {enrollment.last_accessed_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last accessed {new Date(enrollment.last_accessed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <Link to={`/learning/player/${enrollment.courses.slug}`}>
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-5 w-5" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map(enrollment => (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                    <CardTitle className="line-clamp-2">{enrollment.courses.title}</CardTitle>
                    <CardDescription>
                      {enrollment.courses.learning_providers?.organization_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Completed on {new Date(enrollment.completed_at!).toLocaleDateString()}
                    </div>
                    
                    {enrollment.certificate_issued_at && (
                      <Button variant="outline" className="w-full">
                        <Award className="mr-2 h-4 w-4" />
                        View Certificate
                      </Button>
                    )}
                    
                    <Link to={`/learning/courses/${enrollment.courses.slug}`}>
                      <Button variant="ghost" className="w-full">
                        View Course
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
  );
};

export default MyLearning;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BookOpen, Clock, TrendingUp, Trophy, Target, Play } from "lucide-react";
import { Link } from "react-router-dom";

const MyLearning = () => {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["my-all-enrollments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          courses (
            title,
            slug,
            thumbnail_url,
            duration_hours,
            category,
            level,
            certificate_enabled
          )
        `)
        .eq("user_id", user.id)
        .order("last_accessed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: badges } = useQuery({
    queryKey: ["my-badges"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          learning_badges (
            name,
            description,
            badge_image_url,
            badge_type,
            points
          )
        `)
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const inProgress = enrollments?.filter(e => e.status === "in_progress" || e.status === "enrolled") || [];
  const completed = enrollments?.filter(e => e.status === "completed") || [];
  
  const totalProgress = enrollments?.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) || 0;
  const avgProgress = enrollments && enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
  const totalLearningHours = enrollments?.reduce((sum, e) => sum + (e.courses?.duration_hours || 0), 0) || 0;
  const totalPoints = badges?.reduce((sum, b) => sum + (b.learning_badges?.points || 0), 0) || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Learning Journey</h1>
          <p className="text-muted-foreground">Track your progress and celebrate achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{enrollments?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{completed.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{totalLearningHours}h</p>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-info/10 rounded-lg">
                  <Award className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{badges?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Progress
            </CardTitle>
            <CardDescription>You're {avgProgress}% through your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={avgProgress} className="h-3" />
            <p className="mt-2 text-sm text-muted-foreground">
              Keep going! You're making great progress.
            </p>
          </CardContent>
        </Card>

        {/* Course Lists */}
        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="in-progress">
              In Progress ({inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="badges">
              Badges ({badges?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-4">
            {inProgress.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses in progress</h3>
                  <p className="text-muted-foreground mb-4">
                    Start learning something new today!
                  </p>
                  <Button asChild>
                    <Link to="/learning">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              inProgress.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    <img
                      src={enrollment.courses?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
                      alt={enrollment.courses?.title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link to={`/learning/courses/${enrollment.courses?.slug}`}>
                            <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                              {enrollment.courses?.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{enrollment.courses?.category}</Badge>
                            <Badge variant="outline">{enrollment.courses?.level}</Badge>
                          </div>
                        </div>
                        <Button asChild>
                          <Link to={`/learning/courses/${enrollment.courses?.slug}/learn`}>
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Link>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {enrollment.courses?.duration_hours}h total
                        </span>
                        {enrollment.last_accessed_at && (
                          <span>
                            Last accessed {new Date(enrollment.last_accessed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completed.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed courses yet</h3>
                  <p className="text-muted-foreground">
                    Complete your first course to earn a certificate!
                  </p>
                </CardContent>
              </Card>
            ) : (
              completed.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    <img
                      src={enrollment.courses?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
                      alt={enrollment.courses?.title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold">{enrollment.courses?.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{enrollment.courses?.category}</Badge>
                            <Badge className="bg-success">Completed</Badge>
                          </div>
                        </div>
                        {enrollment.courses?.certificate_enabled && (
                          <Button variant="outline">
                            <Award className="h-4 w-4 mr-2" />
                            View Certificate
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {enrollment.completed_at && (
                          <span>
                            Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {enrollment.courses?.duration_hours}h
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((userBadge) => (
                  <Card key={userBadge.id} className="text-center">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        {userBadge.learning_badges?.badge_image_url ? (
                          <img
                            src={userBadge.learning_badges.badge_image_url}
                            alt={userBadge.learning_badges.name}
                            className="h-24 w-24 object-contain"
                          />
                        ) : (
                          <div className="h-24 w-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                            <Award className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      <CardTitle>{userBadge.learning_badges?.name}</CardTitle>
                      <CardDescription>{userBadge.learning_badges?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="mb-2">
                        {userBadge.learning_badges?.badge_type?.replace("_", " ")}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                      </p>
                      {userBadge.learning_badges?.points > 0 && (
                        <p className="text-sm font-semibold text-primary mt-2">
                          +{userBadge.learning_badges.points} points
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No badges earned yet</h3>
                  <p className="text-muted-foreground">
                    Complete courses and achieve milestones to earn badges!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyLearning;
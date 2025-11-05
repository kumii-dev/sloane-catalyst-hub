import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Users, Award, PlayCircle, FileText, CheckCircle, BookOpen, Globe } from "lucide-react";
import { toast } from "sonner";

const CourseDetail = () => {
  const { slug } = useParams();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          learning_providers (
            organization_name,
            logo_url,
            bio,
            is_verified,
            website
          )
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: modules } = useQuery({
    queryKey: ["course-modules", course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      
      const { data, error } = await supabase
        .from("course_modules")
        .select(`
          *,
          course_lessons (*)
        `)
        .eq("course_id", course.id)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
    enabled: !!course?.id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["course-reviews", course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      
      const { data, error } = await supabase
        .from("course_reviews")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .eq("course_id", course.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!course?.id,
  });

  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to enroll");
      return;
    }

    const { error } = await supabase
      .from("course_enrollments")
      .insert({
        course_id: course.id,
        user_id: user.id,
        payment_status: course.is_free ? "paid" : "pending",
      });

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already enrolled in this course");
      } else {
        toast.error("Failed to enroll");
      }
    } else {
      toast.success("Successfully enrolled!");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg mb-8" />
            <div className="h-8 bg-muted rounded w-1/2 mb-4" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
        </div>
      </Layout>
    );
  }

  const totalLessons = modules?.reduce((sum, mod) => sum + (mod.course_lessons?.length || 0), 0) || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Badge>{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              {course.is_featured && <Badge className="bg-accent">Featured</Badge>}
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{course.short_description}</p>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={course.learning_providers?.logo_url} />
                  <AvatarFallback>{course.learning_providers?.organization_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{course.learning_providers?.organization_name}</span>
                    {course.learning_providers?.is_verified && (
                      <Award className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Course Provider</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{course.average_rating?.toFixed(1) || "New"}</span>
                {course.total_reviews > 0 && (
                  <span className="text-muted-foreground">({course.total_reviews} reviews)</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{course.total_enrollments} enrolled</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>{course.duration_hours} hours</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-5 w-5" />
                <span>{course.language === "en" ? "English" : course.language}</span>
              </div>
            </div>

            {course.video_preview_url && (
              <div className="mt-6">
                <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="lg" className="gap-2">
                      <PlayCircle className="h-6 w-6" />
                      Preview Course
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardHeader>
                {course.is_free ? (
                  <div className="text-3xl font-bold text-success">Free</div>
                ) : (
                  <div className="text-3xl font-bold">
                    {course.currency} {course.price}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg" onClick={handleEnroll}>
                  Enroll Now
                </Button>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Modules</span>
                    <span className="font-semibold">{modules?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lessons</span>
                    <span className="font-semibold">{totalLessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Certificate</span>
                    <span className="font-semibold">
                      {course.certificate_enabled ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
              </CardContent>
            </Card>

            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learning_outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>{modules?.length || 0} modules • {totalLessons} lessons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules?.map((module, idx) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{module.title}</h3>
                          {module.description && (
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{module.course_lessons?.length || 0} lessons</span>
                      </div>
                    </div>
                    
                    <div className="ml-11 space-y-2">
                      {module.course_lessons?.map((lesson, lessonIdx) => (
                        <div key={lesson.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            {lesson.content_type === "video" && <PlayCircle className="h-4 w-4 text-muted-foreground" />}
                            {lesson.content_type === "article" && <FileText className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm">{lesson.title}</span>
                            {lesson.is_preview && <Badge variant="outline" className="text-xs">Preview</Badge>}
                          </div>
                          {lesson.duration_minutes && (
                            <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>
                  {course.total_reviews} reviews • {course.average_rating?.toFixed(1)} average rating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews?.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={(review.profiles as any)?.profile_picture_url} />
                        <AvatarFallback>
                          {(review.profiles as any)?.first_name?.charAt(0)}
                          {(review.profiles as any)?.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">
                              {(review.profiles as any)?.first_name} {(review.profiles as any)?.last_name}
                            </p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-muted-foreground">{review.review_text}</p>
                        )}
                        {review.is_verified_completion && (
                          <Badge variant="outline" className="mt-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!reviews || reviews.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to review this course!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CourseDetail;
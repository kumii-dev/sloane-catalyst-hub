import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, Clock, Users, Star, Award, CheckCircle2, PlayCircle, 
  FileText, Video, Download, Share2, Heart, ChevronRight 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          learning_providers (
            id,
            organization_name,
            logo_url,
            is_verified,
            bio,
            website
          ),
          course_modules (
            id,
            title,
            description,
            duration_minutes,
            sort_order,
            course_lessons (
              id,
              title,
              content_type,
              duration_minutes,
              is_preview,
              sort_order
            )
          )
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', course!.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: reviews } = useQuery({
    queryKey: ['course-reviews', course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data: reviewsData, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', course!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      // Fetch profiles for reviewers
      if (reviewsData && reviewsData.length > 0) {
        const userIds = reviewsData.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url')
          .in('user_id', userIds);

        // Combine reviews with profiles
        return reviewsData.map(review => ({
          ...review,
          profile: profiles?.find(p => p.user_id === review.user_id) as any
        }));
      }
      
      return reviewsData?.map(r => ({ ...r, profile: null as any })) || [];
    }
  });

  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to enroll in this course',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: course!.id,
          user_id: user.id,
          payment_status: course!.is_free ? 'free' : 'pending',
          payment_amount: course!.is_free ? 0 : course!.price
        });

      if (error) throw error;

      toast({
        title: 'Enrollment Successful!',
        description: 'You have been enrolled in this course. Start learning now!'
      });

      // Redirect to course player or payment if needed
      if (course!.is_free) {
        navigate(`/learning/player/${course!.slug}`);
      } else {
        navigate(`/learning/payment/${course!.slug}`);
      }
    } catch (error: any) {
      toast({
        title: 'Enrollment Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <Button onClick={() => navigate('/learning')}>Back to Learning Hub</Button>
      </div>
    );
  }

  const totalLessons = course.course_modules?.reduce((sum, module) => 
    sum + (module.course_lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge>{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                {course.is_featured && <Badge className="bg-primary">Featured</Badge>}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{course.short_description}</p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  {course.learning_providers?.logo_url && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={course.learning_providers.logo_url} />
                      <AvatarFallback>
                        {course.learning_providers.organization_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-medium">{course.learning_providers?.organization_name}</p>
                    {course.learning_providers?.is_verified && (
                      <Badge variant="outline" className="text-xs">Verified Provider</Badge>
                    )}
                  </div>
                </div>
                
                {course.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${
                            i < Math.round(course.average_rating!) 
                              ? 'fill-primary text-primary' 
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{course.average_rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({course.total_reviews} reviews)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration_text || `${course.duration_hours} hours`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.total_enrollments} students enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>{course.certificate_enabled ? 'Certificate included' : 'No certificate'}</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <Card>
              <CardHeader>
                <div className="text-3xl font-bold mb-2">
                  {course.is_free ? (
                    <Badge variant="secondary" className="text-lg px-4 py-2">Free</Badge>
                  ) : (
                    `${course.currency} ${course.price}`
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollment ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Your Progress</span>
                        <span className="font-medium">{enrollment.progress_percentage}%</span>
                      </div>
                      <Progress value={enrollment.progress_percentage} />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/learning/player/${course.slug}`)}
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Continue Learning
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : (course.is_free ? 'Enroll for Free' : 'Enroll Now')}
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Mobile and desktop access</span>
                  </div>
                  {course.certificate_enabled && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Certificate of completion</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{course.description}</p>
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
                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
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
                            <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                {course.course_modules?.sort((a, b) => a.sort_order - b.sort_order).map((module, idx) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Module {idx + 1}: {module.title}
                      </CardTitle>
                      {module.description && (
                        <CardDescription>{module.description}</CardDescription>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{module.course_lessons?.length || 0} lessons</span>
                        {module.duration_minutes && (
                          <span>{module.duration_minutes} minutes</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {module.course_lessons?.sort((a, b) => a.sort_order - b.sort_order).map((lesson) => (
                          <li key={lesson.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              {lesson.content_type === 'video' && <Video className="h-5 w-5 text-muted-foreground" />}
                              {lesson.content_type === 'document' && <FileText className="h-5 w-5 text-muted-foreground" />}
                              {lesson.content_type === 'quiz' && <CheckCircle2 className="h-5 w-5 text-muted-foreground" />}
                              <span>{lesson.title}</span>
                              {lesson.is_preview && (
                                <Badge variant="outline" className="text-xs">Preview</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {lesson.duration_minutes} min
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={review.profile?.profile_picture_url} />
                              <AvatarFallback>
                                {review.profile?.first_name?.[0]}{review.profile?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {review.profile?.first_name} {review.profile?.last_name}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${
                                        i < review.rating 
                                          ? 'fill-primary text-primary' 
                                          : 'text-muted'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {review.is_verified_completion && (
                            <Badge variant="outline">Verified Purchase</Badge>
                          )}
                        </div>
                      </CardHeader>
                      {review.review_text && (
                        <CardContent>
                          <p>{review.review_text}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                )}
              </TabsContent>

              <TabsContent value="instructor">
                {course.learning_providers && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {course.learning_providers.logo_url && (
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={course.learning_providers.logo_url} />
                            <AvatarFallback>
                              {course.learning_providers.organization_name[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <CardTitle>{course.learning_providers.organization_name}</CardTitle>
                          {course.learning_providers.is_verified && (
                            <Badge variant="outline" className="mt-2">Verified Provider</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {course.learning_providers.bio && (
                        <p className="whitespace-pre-wrap">{course.learning_providers.bio}</p>
                      )}
                      {course.learning_providers.website && (
                        <div>
                          <a 
                            href={course.learning_providers.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Visit Website →
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Type</span>
                  <span className="font-medium">{course.delivery_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Mode</span>
                  <span className="font-medium">{course.delivery_mode.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">{course.language.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                {course.has_assessment && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passing Score</span>
                    <span className="font-medium">{course.passing_score}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {course.tags && course.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
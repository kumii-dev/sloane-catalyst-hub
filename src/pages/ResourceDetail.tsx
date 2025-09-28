import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, Download, BookOpen, Award, Users, Eye, Calendar, Tag, CheckCircle, PlayCircle, ExternalLink, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  resource_type: string;
  access_level: string;
  thumbnail_url: string;
  file_url: string;
  external_url: string;
  duration_minutes: number;
  difficulty_level: string;
  rating: number;
  total_ratings: number;
  is_featured: boolean;
  view_count: number;
  download_count: number;
  author_name: string;
  author_bio: string;
  tags: string[];
  prerequisites: string[];
  learning_outcomes: string[];
  cohort_benefits: string;
  sponsor_name: string;
  sponsor_logo_url: string;
  created_at: string;
  resource_categories: {
    name: string;
    slug: string;
  };
}

interface ResourceRating {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    profile_picture_url: string;
  };
}

interface UserProgress {
  progress_percentage: number;
  completed_at: string | null;
  last_accessed_at: string;
}

const ResourceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [resource, setResource] = useState<Resource | null>(null);
  const [ratings, setRatings] = useState<ResourceRating[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchResourceData();
    }
  }, [slug, user]);

  const fetchResourceData = async () => {
    try {
      // Fetch resource info
      const { data: resourceData } = await supabase
        .from('resources')
        .select(`
          *,
          resource_categories (name, slug)
        `)
        .eq('slug', slug)
        .single();

      if (!resourceData) return;

      setResource(resourceData);

      // Fetch ratings with user profiles
      const { data: ratingsData } = await supabase
        .from('resource_ratings')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          user_id
        `)
        .eq('resource_id', resourceData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch user profiles for ratings
      const ratingsWithProfiles = [];
      if (ratingsData) {
        for (const rating of ratingsData) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_picture_url')
            .eq('user_id', rating.user_id)
            .single();
          
          ratingsWithProfiles.push({
            ...rating,
            profiles: profile || { first_name: 'Anonymous', last_name: 'User', profile_picture_url: null }
          });
        }
      }

      setRatings(ratingsWithProfiles);

      // If user is logged in, fetch their progress and bookmark status
      if (user) {
        const { data: progressData } = await supabase
          .from('resource_progress')
          .select('*')
          .eq('resource_id', resourceData.id)
          .eq('user_id', user.id)
          .single();

        if (progressData) {
          setUserProgress(progressData);
        }

        const { data: bookmarkData } = await supabase
          .from('resource_bookmarks')
          .select('id')
          .eq('resource_id', resourceData.id)
          .eq('user_id', user.id)
          .single();

        setIsBookmarked(!!bookmarkData);

        // Check if user has already rated
        const { data: userRatingData } = await supabase
          .from('resource_ratings')
          .select('rating, review_text')
          .eq('resource_id', resourceData.id)
          .eq('user_id', user.id)
          .single();

        if (userRatingData) {
          setUserRating(userRatingData.rating);
          setReviewText(userRatingData.review_text || "");
        }

        // Update view count
        await supabase
          .from('resources')
          .update({ view_count: resourceData.view_count + 1 })
          .eq('id', resourceData.id);
      }
    } catch (error) {
      console.error('Error fetching resource data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user || !resource) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('resource_bookmarks')
          .delete()
          .eq('resource_id', resource.id)
          .eq('user_id', user.id);
        
        setIsBookmarked(false);
        toast({ title: "Bookmark removed" });
      } else {
        await supabase
          .from('resource_bookmarks')
          .insert({
            resource_id: resource.id,
            user_id: user.id
          });
        
        setIsBookmarked(true);
        toast({ title: "Resource bookmarked" });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({ title: "Error", description: "Failed to update bookmark", variant: "destructive" });
    }
  };

  const handleRating = async () => {
    if (!user || !resource || userRating === 0) return;

    try {
      await supabase
        .from('resource_ratings')
        .upsert({
          resource_id: resource.id,
          user_id: user.id,
          rating: userRating,
          review_text: reviewText
        });

      toast({ title: "Rating submitted successfully" });
      fetchResourceData(); // Refresh data
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" });
    }
  };

  const markProgress = async (percentage: number) => {
    if (!user || !resource) return;

    try {
      await supabase
        .from('resource_progress')
        .upsert({
          resource_id: resource.id,
          user_id: user.id,
          progress_percentage: percentage,
          completed_at: percentage === 100 ? new Date().toISOString() : null,
          last_accessed_at: new Date().toISOString()
        });

      setUserProgress({
        progress_percentage: percentage,
        completed_at: percentage === 100 ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString()
      });

      toast({ 
        title: percentage === 100 ? "Resource completed!" : "Progress saved",
        description: `Progress: ${percentage}%`
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading resource...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Resource Not Found</h1>
            <p className="text-muted-foreground mb-8">The resource you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/resources">Back to Resources</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-500',
      'intermediate': 'bg-yellow-500',
      'advanced': 'bg-red-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/resources/category/${resource.resource_categories.slug}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to {resource.resource_categories.name}
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resource Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{resource.resource_type}</Badge>
                {resource.is_featured && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {resource.cohort_benefits && (
                  <Badge className="bg-primary">Cohort Benefits</Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{resource.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {resource.author_name && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {resource.author_name}
                  </div>
                )}
                {resource.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {resource.duration_minutes} minutes
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {resource.view_count} views
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(resource.created_at).toLocaleDateString()}
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-6">{resource.description}</p>

              {/* User Progress */}
              {user && userProgress && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">{userProgress.progress_percentage}%</span>
                      </div>
                      <Progress value={userProgress.progress_percentage} className="h-2" />
                      {userProgress.completed_at && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Completed on {new Date(userProgress.completed_at).toLocaleDateString()}
                        </div>
                      )}
                      {userProgress.progress_percentage < 100 && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => markProgress(50)}>Mark 50%</Button>
                          <Button size="sm" onClick={() => markProgress(100)}>Mark Complete</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Resource Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                {resource.content ? (
                  <div className="prose max-w-none dark:prose-invert">
                    {resource.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Content will be available here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Outcomes */}
            {resource.learning_outcomes && resource.learning_outcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Learning Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resource.learning_outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* User Rating Section */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate this Resource</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="text-yellow-400 hover:text-yellow-500"
                          >
                            <Star 
                              className={`h-5 w-5 ${star <= userRating ? 'fill-current' : ''}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Write a review (optional)..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <Button onClick={handleRating} disabled={userRating === 0}>
                      Submit Rating
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {ratings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={rating.profiles?.profile_picture_url} />
                            <AvatarFallback>
                              {rating.profiles?.first_name?.[0]}{rating.profiles?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {rating.profiles?.first_name} {rating.profiles?.last_name}
                              </span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= rating.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(rating.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {rating.review_text && (
                              <p className="text-sm text-muted-foreground">{rating.review_text}</p>
                            )}
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {resource.external_url && (
                    <Button className="w-full" asChild>
                      <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access Resource
                      </a>
                    </Button>
                  )}
                  
                  {resource.file_url && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={resource.file_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download ({resource.download_count})
                      </a>
                    </Button>
                  )}

                  {user && (
                    <Button 
                      variant={isBookmarked ? "default" : "outline"} 
                      className="w-full"
                      onClick={handleBookmark}
                    >
                      <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resource Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{resource.rating}</span>
                    <span className="text-xs text-muted-foreground">({resource.total_ratings})</span>
                  </div>
                </div>

                {resource.difficulty_level && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Difficulty</span>
                    <Badge className={getDifficultyColor(resource.difficulty_level)}>
                      {resource.difficulty_level}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Access Level</span>
                  <Badge variant="outline">
                    {resource.access_level === 'cohort_only' ? 'Cohort Only' : 
                     resource.access_level === 'registered' ? 'Members' : 
                     resource.access_level === 'premium' ? 'Premium' : 'Free'}
                  </Badge>
                </div>

                {resource.tags && resource.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {resource.prerequisites && resource.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {resource.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Cohort Benefits */}
            {resource.cohort_benefits && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cohort Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{resource.cohort_benefits}</p>
                  {resource.sponsor_name && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-primary/10 rounded-lg">
                      {resource.sponsor_logo_url && (
                        <img 
                          src={resource.sponsor_logo_url} 
                          alt={resource.sponsor_name}
                          className="h-8 w-8 object-contain"
                        />
                      )}
                      <span className="text-sm font-medium">Sponsored by {resource.sponsor_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Author Info */}
            {resource.author_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">{resource.author_name}</h4>
                    {resource.author_bio && (
                      <p className="text-sm text-muted-foreground">{resource.author_bio}</p>
                    )}
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

export default ResourceDetail;
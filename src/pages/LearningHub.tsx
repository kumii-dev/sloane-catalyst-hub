import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, Users, TrendingUp, Award, Target, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const LearningHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Fetch published courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", selectedCategory, selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select(`
          *,
          learning_providers (
            organization_name,
            logo_url,
            is_verified
          )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (selectedLevel !== "all") {
        query = query.eq("level", selectedLevel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's enrollments and progress
  const { data: myEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          courses (
            title,
            thumbnail_url,
            duration_hours
          )
        `)
        .eq("user_id", user.id)
        .in("status", ["enrolled", "in_progress"])
        .order("last_accessed_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  // Fetch AI recommendations
  const { data: recommendations } = useQuery({
    queryKey: ["course-recommendations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("course_recommendations")
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
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("match_score", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  // Fetch learning paths
  const { data: learningPaths } = useQuery({
    queryKey: ["learning-paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_paths")
        .select(`
          *,
          learning_providers (
            organization_name,
            logo_url
          )
        `)
        .eq("is_published", true)
        .order("total_enrollments", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const filteredCourses = courses?.filter((course) =>
    searchQuery === "" ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ["all", "Business", "Technology", "Finance", "Marketing", "Legal", "Operations"];
  const levels = ["all", "beginner", "intermediate", "advanced", "expert"];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Learn, Grow, and Prove It
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your journey to measurable skills growth starts here. Premium content, AI-powered recommendations, and recognized credentials.
          </p>
          
          {/* Personal Progress Stats */}
          {myEnrollments && myEnrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold">{myEnrollments.length}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold">
                        {myEnrollments.filter(e => e.progress_percentage === 100).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold">
                        {Math.round(myEnrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / myEnrollments.length)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-info" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold">
                        {myEnrollments.reduce((sum, e) => sum + (e.courses?.duration_hours || 0), 0)}h
                      </p>
                      <p className="text-sm text-muted-foreground">Learning Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-bold">Recommended for You</h2>
              <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <Link key={rec.id} to={`/learning/courses/${rec.courses.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={rec.courses.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
                        alt={rec.courses.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-accent">
                        {rec.match_score}% Match
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{rec.courses.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {rec.match_reasons?.join(" • ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {rec.courses.duration_hours}h
                        </span>
                        <Badge variant="outline">{rec.courses.level}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Continue Learning */}
        {myEnrollments && myEnrollments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myEnrollments.map((enrollment) => (
                <Link key={enrollment.id} to={`/learning/courses/${enrollment.courses.title}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <img
                      src={enrollment.courses.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
                      alt={enrollment.courses.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{enrollment.courses.title}</CardTitle>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Learning Paths */}
        {learningPaths && learningPaths.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Curated Learning Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learningPaths.map((path) => (
                <Card key={path.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <img
                    src={path.thumbnail_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"}
                    alt={path.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{path.category}</Badge>
                      <Badge variant="outline">{path.level}</Badge>
                    </div>
                    <CardTitle>{path.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {path.total_courses} courses
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {path.total_enrollments} enrolled
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course Catalog */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Courses</h2>
          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCourses?.map((course) => (
                <Link key={course.id} to={`/learning/courses/${course.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {course.is_featured && (
                        <Badge className="absolute top-2 left-2 bg-accent">Featured</Badge>
                      )}
                      {course.is_free && (
                        <Badge className="absolute top-2 right-2 bg-success">Free</Badge>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {course.learning_providers?.is_verified && (
                          <Award className="h-4 w-4 text-accent" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {course.learning_providers?.organization_name}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.short_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {course.average_rating?.toFixed(1) || "New"}
                          </span>
                          {course.total_reviews > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({course.total_reviews})
                            </span>
                          )}
                        </div>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration_hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.total_enrollments}
                        </span>
                      </div>
                      {!course.is_free && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-lg font-bold">
                            {course.currency} {course.price}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LearningHub;
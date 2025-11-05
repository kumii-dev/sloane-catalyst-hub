import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  BookOpen, 
  Video, 
  Award, 
  TrendingUp, 
  Clock, 
  Users, 
  Star,
  Play,
  CheckCircle2,
  Target,
  Zap,
  Brain,
  Rocket,
  Trophy,
  Sparkles,
  BarChart3,
  Calendar,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Layers,
  GraduationCap,
  Lightbulb,
  Flame
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  id: string;
  title: string;
  provider: string;
  providerLogo: string;
  thumbnail: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  enrolled: number;
  rating: number;
  reviews: number;
  price: number;
  isFree: boolean;
  progress?: number;
  tags: string[];
  deliveryMode: "Video" | "Live" | "Hybrid" | "Self-Paced";
  nextSession?: string;
  trending?: boolean;
  aiRecommended?: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: number;
  duration: string;
  completionRate: number;
  badge: string;
  level: string;
}

const LearningHub = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("discover");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");

  const mockCourses: Course[] = [
    {
      id: "1",
      title: "Financial Modeling for Startups",
      provider: "22 On Sloane",
      providerLogo: "/avatars/mafika-profile.png",
      thumbnail: "/services/credit-scoring-banner.jpg",
      category: "Finance",
      level: "Intermediate",
      duration: "8 weeks",
      enrolled: 1240,
      rating: 4.8,
      reviews: 342,
      price: 1299,
      isFree: false,
      progress: 65,
      tags: ["Financial Planning", "Excel", "Projections"],
      deliveryMode: "Hybrid",
      nextSession: "2025-11-08",
      aiRecommended: true,
      trending: true
    },
    {
      id: "2",
      title: "Digital Marketing Masterclass",
      provider: "Growth Academy",
      providerLogo: "/avatars/mafika-profile.png",
      thumbnail: "/assets/marketplace-network.jpg",
      category: "Marketing",
      level: "Beginner",
      duration: "6 weeks",
      enrolled: 2150,
      rating: 4.9,
      reviews: 567,
      price: 0,
      isFree: true,
      tags: ["SEO", "Social Media", "Content"],
      deliveryMode: "Video",
      trending: true
    },
    {
      id: "3",
      title: "Fundraising Strategy & Pitch Deck Design",
      provider: "Nedbank",
      providerLogo: "/assets/nedbank-logo.png",
      thumbnail: "/services/credit-scoring-banner.jpg",
      category: "Fundraising",
      level: "Advanced",
      duration: "4 weeks",
      enrolled: 890,
      rating: 4.7,
      reviews: 203,
      price: 2499,
      isFree: false,
      progress: 30,
      tags: ["Pitch Deck", "VC", "Investment"],
      deliveryMode: "Live",
      nextSession: "2025-11-10",
      aiRecommended: true
    },
    {
      id: "4",
      title: "Business Model Canvas Workshop",
      provider: "Microsoft for Startups",
      providerLogo: "/assets/microsoft-logo.png",
      thumbnail: "/assets/marketplace-network.jpg",
      category: "Strategy",
      level: "Beginner",
      duration: "2 weeks",
      enrolled: 3420,
      rating: 4.9,
      reviews: 891,
      price: 0,
      isFree: true,
      tags: ["Strategy", "Business Model", "Lean"],
      deliveryMode: "Self-Paced"
    }
  ];

  const mockPaths: LearningPath[] = [
    {
      id: "1",
      title: "Startup Fundamentals Track",
      description: "Master the essentials of building and scaling a startup from ideation to funding",
      courses: 8,
      duration: "16 weeks",
      completionRate: 45,
      badge: "Certified Founder",
      level: "Beginner to Intermediate"
    },
    {
      id: "2",
      title: "Financial Excellence Path",
      description: "Comprehensive financial management, modeling, and fundraising skills",
      courses: 6,
      duration: "12 weeks",
      completionRate: 20,
      badge: "Financial Expert",
      level: "Intermediate to Advanced"
    },
    {
      id: "3",
      title: "Digital Transformation Journey",
      description: "Navigate digital marketing, analytics, and growth hacking strategies",
      courses: 10,
      duration: "20 weeks",
      completionRate: 0,
      badge: "Digital Pioneer",
      level: "All Levels"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {/* Hero Section with AI-Powered Recommendations */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 via-primary to-accent/80 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('/assets/hero-bg.jpg')] opacity-10 mix-blend-overlay" />
          <div className="container relative py-16 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Learning Platform</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Learn, Grow, and <span className="text-accent-light">Prove It</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Enterprise-grade learning ecosystem designed for startups, SMMEs, mentors, and advisors.
                Measurable skills growth, trusted content, and real business outcomes.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mt-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search courses, skills, providers, or learning paths..."
                    className="pl-12 pr-4 h-14 bg-background/95 backdrop-blur-sm border-primary/20 text-foreground placeholder:text-muted-foreground"
                  />
                  <Button className="absolute right-2 top-1/2 -translate-y-1/2">
                    Search
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                {[
                  { icon: BookOpen, label: "Courses", value: "500+" },
                  { icon: Users, label: "Learners", value: "12K+" },
                  { icon: Award, label: "Certificates", value: "8K+" },
                  { icon: Trophy, label: "Success Rate", value: "94%" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <stat.icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 bg-card p-2 rounded-lg shadow-sm">
              <TabsTrigger value="discover" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Rocket className="w-4 h-4 mr-2" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="my-learning" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <GraduationCap className="w-4 h-4 mr-2" />
                My Learning
              </TabsTrigger>
              <TabsTrigger value="paths" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Layers className="w-4 h-4 mr-2" />
                Learning Paths
              </TabsTrigger>
              <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Live Sessions
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Trophy className="w-4 h-4 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-8">
              {/* AI Recommendations Banner */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">AI-Recommended For You</CardTitle>
                        <CardDescription>Based on your profile, goals, and learning history</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="w-3 h-3" />
                      Smart Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {mockCourses.filter(c => c.aiRecommended).map((course) => (
                      <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-primary/90 backdrop-blur-sm">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Pick
                            </Badge>
                          </div>
                          {course.progress !== undefined && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                              <Progress value={course.progress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={course.providerLogo} />
                              <AvatarFallback>{course.provider[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{course.provider}</span>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Star className="w-4 h-4 fill-rating text-rating" />
                            <span className="font-medium text-foreground">{course.rating}</span>
                            <span>({course.reviews})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{course.level}</Badge>
                            <span className="text-lg font-bold text-primary">
                              {course.isFree ? "Free" : `R${course.price}`}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filters and View Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="strategy">Strategy</SelectItem>
                      <SelectItem value="fundraising">Fundraising</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
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

                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Delivery Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="live">Live Sessions</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="self-paced">Self-Paced</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    More Filters
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Trending Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-destructive" />
                  <h2 className="text-2xl font-bold">Trending Now</h2>
                </div>
                <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
                  {mockCourses.map((course) => (
                    <Link to={`/learning/course/${course.id}`} key={course.id}>
                      <Card className="group hover:shadow-xl transition-all duration-300 h-full border-border/50 hover:border-primary/50">
                        <div className="relative overflow-hidden">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              viewMode === "grid" ? "h-48" : "h-32"
                            }`}
                          />
                          <div className="absolute top-2 left-2 right-2 flex justify-between">
                            {course.trending && (
                              <Badge className="bg-destructive/90 backdrop-blur-sm">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm ml-auto">
                              {course.deliveryMode}
                            </Badge>
                          </div>
                          {course.progress !== undefined && (
                            <div className="absolute bottom-0 left-0 right-0">
                              <Progress value={course.progress} className="h-2 rounded-none" />
                              <div className="bg-background/95 backdrop-blur-sm px-2 py-1 text-xs font-medium">
                                {course.progress}% Complete
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={course.providerLogo} />
                              <AvatarFallback>{course.provider[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{course.provider}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {course.category}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>

                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-rating text-rating" />
                              <span className="font-medium text-foreground">{course.rating}</span>
                              <span>({course.reviews})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{course.enrolled.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {course.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{course.duration}</span>
                            </div>
                            <span className="text-lg font-bold text-primary">
                              {course.isFree ? "Free" : `R${course.price}`}
                            </span>
                          </div>

                          {course.nextSession && (
                            <div className="mt-3 p-2 bg-accent/10 rounded-md flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-accent" />
                              <span className="text-foreground">Next: {course.nextSession}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* My Learning Tab */}
            <TabsContent value="my-learning" className="space-y-6">
              {/* Progress Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { icon: BookOpen, label: "Courses Enrolled", value: "12", color: "text-primary" },
                  { icon: CheckCircle2, label: "Completed", value: "8", color: "text-success" },
                  { icon: Flame, label: "Current Streak", value: "7 days", color: "text-destructive" },
                  { icon: Target, label: "Learning Hours", value: "47h", color: "text-accent" }
                ].map((stat, idx) => (
                  <Card key={idx} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        <Badge variant="secondary">{stat.value}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Learning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    Continue Learning
                  </CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCourses.filter(c => c.progress !== undefined).map((course) => (
                      <Link to={`/learning/course/${course.id}`} key={course.id}>
                        <Card className="group hover:shadow-md transition-all border-border/50 hover:border-primary/30">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-32 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                      {course.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{course.provider}</p>
                                  </div>
                                  <Badge>{course.level}</Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress} className="h-2" />
                                  <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm text-muted-foreground">
                                      Estimated time remaining: {Math.ceil((100 - (course.progress || 0)) / 10)} hours
                                    </span>
                                    <Button size="sm" className="gap-2">
                                      Continue
                                      <ArrowRight className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Next Steps */}
              <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    Recommended Next Steps
                  </CardTitle>
                  <CardDescription>AI-curated courses to accelerate your learning journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {mockCourses.slice(0, 3).map((course) => (
                      <Card key={course.id} className="group hover:shadow-lg transition-all">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover" />
                          <Badge className="absolute top-2 right-2 bg-accent/90 backdrop-blur-sm">
                            Next Step
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{course.provider}</p>
                          <Button className="w-full" variant="outline">
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Paths Tab */}
            <TabsContent value="paths" className="space-y-6">
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl">Structured Learning Journeys</CardTitle>
                  <CardDescription>
                    Follow curated learning paths designed by industry experts to master complete skill sets
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-6">
                {mockPaths.map((path) => (
                  <Card key={path.id} className="group hover:shadow-xl transition-all border-border/50 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {path.title}
                              </h3>
                              <p className="text-muted-foreground">{path.description}</p>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                              {path.level}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Layers className="w-5 h-5 text-primary" />
                              <div>
                                <div className="text-sm text-muted-foreground">Courses</div>
                                <div className="font-semibold">{path.courses}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-primary" />
                              <div>
                                <div className="text-sm text-muted-foreground">Duration</div>
                                <div className="font-semibold">{path.duration}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-primary" />
                              <div>
                                <div className="text-sm text-muted-foreground">Certificate</div>
                                <div className="font-semibold text-sm">{path.badge}</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Your Progress</span>
                              <span className="font-medium">{path.completionRate}%</span>
                            </div>
                            <Progress value={path.completionRate} className="h-3" />
                          </div>
                        </div>

                        <div className="flex flex-col justify-between gap-4 md:w-48">
                          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-2 text-primary" />
                            <div className="text-sm font-medium">Earn Badge</div>
                            <div className="text-xs text-muted-foreground mt-1">{path.badge}</div>
                          </div>
                          <Button className="w-full gap-2">
                            {path.completionRate > 0 ? "Continue Path" : "Start Path"}
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Live Sessions Tab */}
            <TabsContent value="live" className="space-y-6">
              <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-background">
                <CardHeader>
                  <CardTitle className="text-2xl">Upcoming Live Sessions</CardTitle>
                  <CardDescription>
                    Join expert-led live workshops, masterclasses, and Q&A sessions
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                {mockCourses.filter(c => c.nextSession).map((course) => (
                  <Card key={course.id} className="group hover:shadow-xl transition-all border-border/50">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-4 min-w-[80px]">
                          <div className="text-3xl font-bold text-primary">08</div>
                          <div className="text-sm text-muted-foreground">NOV</div>
                          <div className="text-xs text-muted-foreground mt-1">14:00</div>
                        </div>
                        <div className="flex-1">
                          <Badge className="mb-2">Live Session</Badge>
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={course.providerLogo} />
                              <AvatarFallback>{course.provider[0]}</AvatarFallback>
                            </Avatar>
                            <span>{course.provider}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{course.enrolled} registered</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>2 hours</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1">Register Now</Button>
                            <Button variant="outline" size="icon">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Badges Earned */}
                <Card className="border-success/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-success" />
                      Badges Earned
                    </CardTitle>
                    <CardDescription>Your learning achievements and certifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((badge) => (
                        <div key={badge} className="text-center group cursor-pointer">
                          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-full p-6 mb-2 group-hover:scale-110 transition-transform">
                            <Trophy className="w-8 h-8 text-primary mx-auto" />
                          </div>
                          <div className="text-xs font-medium">Badge {badge}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Stats */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Learning Analytics
                    </CardTitle>
                    <CardDescription>Your progress and performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Course Completion Rate</span>
                          <span className="font-medium">67%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Average Quiz Score</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Learning Streak</span>
                          <span className="font-medium">7 days</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default LearningHub;
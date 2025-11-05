import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Star, 
  Users, 
  Clock, 
  Award, 
  PlayCircle, 
  CheckCircle2,
  BookOpen,
  Download,
  Share2,
  Heart,
  Calendar,
  Globe,
  TrendingUp,
  Target,
  MessageSquare,
  ChevronRight,
  Lock,
  Video,
  FileText,
  Code,
  Trophy,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import aiCertBanner from "@/assets/ai-cert-banner.png";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // Mock data until database types regenerate
  const isLoading = false;
  
  // Course data based on ID
  const getCourseData = (courseId: string) => {
    if (courseId === "ai-cert-1") {
      return {
        id: "ai-cert-1",
        title: "Artificial Intelligence International Certification",
        slug: "artificial-intelligence-certification",
        description: "Master Artificial Intelligence with this comprehensive 24-week certification program. Learn machine learning, neural networks, natural language processing, and computer vision. IITPSA accredited with live instructor-led classes and hands-on projects.",
        provider: "Digital Regenesys",
        instructor_name: "Dr. AI Expert Faculty",
        instructor_title: "Senior AI Research Scientist",
        instructor_bio: "Leading AI researcher with 15+ years of experience in machine learning, deep learning, and neural networks. Published author and industry expert.",
        instructor_avatar: "/avatars/mafika-profile.png",
        price: 15999,
        duration: "24 weeks",
        level: "Advanced",
        rating: 4.7,
        students: 500000,
        thumbnail_url: aiCertBanner,
        category: "Technology",
        delivery_mode: "Live",
        whatYouLearn: [
          "Programming Foundations for AI using Python",
          "Applied Programming for AI Applications",
          "Predictive Modeling with Regression Techniques",
          "Classification & Clustering Algorithms",
          "Deep Learning & Neural Network Architectures",
          "Natural Language Processing (NLP)",
          "Computer Vision and Image Recognition",
          "Real-world AI Project Implementation"
        ],
        prerequisites: [
          "No prior programming experience required - we start from basics",
          "Basic mathematics understanding (high school level)",
          "Laptop with minimum 8GB RAM (required for software)"
        ],
        curriculum: [
          {
            module: 1,
            title: "Introductory AI - Programming Foundations",
            duration: "4 weeks",
            lessons: [
              { title: "Introduction to Python Programming", type: "video", duration: "2 hours", isCompleted: false, isLocked: false },
              { title: "Data Structures & Algorithms", type: "video", duration: "3 hours", isCompleted: false, isLocked: false },
              { title: "NumPy & Pandas Basics", type: "video", duration: "2 hours", isCompleted: false, isLocked: false },
              { title: "Project: Data Analysis with Python", type: "assignment", duration: "5 hours", isCompleted: false, isLocked: false }
            ]
          },
          {
            module: 2,
            title: "Applied Programming for AI",
            duration: "4 weeks",
            lessons: [
              { title: "Advanced Python for AI", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Data Visualization with Matplotlib & Seaborn", type: "video", duration: "2 hours", isCompleted: false, isLocked: true },
              { title: "Introduction to Machine Learning", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Project: Build Your First ML Model", type: "assignment", duration: "6 hours", isCompleted: false, isLocked: true }
            ]
          },
          {
            module: 3,
            title: "Intermediate AI - Predictive Modeling",
            duration: "4 weeks",
            lessons: [
              { title: "Linear & Logistic Regression", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Model Evaluation & Validation", type: "video", duration: "2 hours", isCompleted: false, isLocked: true },
              { title: "Classification Algorithms", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Clustering Techniques", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Project: Predictive Analytics Application", type: "assignment", duration: "8 hours", isCompleted: false, isLocked: true }
            ]
          },
          {
            module: 4,
            title: "Advanced AI - Deep Learning & Neural Networks",
            duration: "6 weeks",
            lessons: [
              { title: "Introduction to Neural Networks", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "TensorFlow & Keras Frameworks", type: "video", duration: "4 hours", isCompleted: false, isLocked: true },
              { title: "Convolutional Neural Networks (CNN)", type: "video", duration: "4 hours", isCompleted: false, isLocked: true },
              { title: "Recurrent Neural Networks (RNN)", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Project: Image Classification System", type: "assignment", duration: "10 hours", isCompleted: false, isLocked: true }
            ]
          },
          {
            module: 5,
            title: "Natural Language Processing",
            duration: "3 weeks",
            lessons: [
              { title: "Text Processing & Tokenization", type: "video", duration: "2 hours", isCompleted: false, isLocked: true },
              { title: "Sentiment Analysis", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Language Models & Transformers", type: "video", duration: "4 hours", isCompleted: false, isLocked: true },
              { title: "Project: Build a Chatbot", type: "assignment", duration: "8 hours", isCompleted: false, isLocked: true }
            ]
          },
          {
            module: 6,
            title: "Computer Vision",
            duration: "3 weeks",
            lessons: [
              { title: "Image Processing with OpenCV", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Object Detection & Recognition", type: "video", duration: "4 hours", isCompleted: false, isLocked: true },
              { title: "Face Recognition Systems", type: "video", duration: "3 hours", isCompleted: false, isLocked: true },
              { title: "Capstone Project: AI Vision Application", type: "assignment", duration: "12 hours", isCompleted: false, isLocked: true }
            ]
          }
        ],
        totalHours: "240+ hours",
        providerLogo: "/avatars/mafika-profile.png",
        instructor: "Dr. AI Expert Faculty",
        instructorTitle: "Senior AI Research Scientist",
        instructorBio: "Leading AI researcher with 15+ years of experience in machine learning, deep learning, and neural networks.",
        reviewsList: [
          {
            id: "1",
            user: "Thabo Mokoena",
            avatar: "/avatars/mafika-profile.png",
            rating: 5,
            date: "2025-10-20",
            comment: "This course transformed my career! The practical projects and industry expert faculty made all the difference. Highly recommend!",
            helpful: 45
          },
          {
            id: "2",
            user: "Lerato Dlamini",
            avatar: "/avatars/mafika-profile.png",
            rating: 5,
            date: "2025-10-15",
            comment: "Excellent curriculum covering everything from basics to advanced AI. The live classes and hands-on approach are outstanding.",
            helpful: 32
          },
          {
            id: "3",
            user: "John Ndlovu",
            avatar: "/avatars/mafika-profile.png",
            rating: 4,
            date: "2025-10-10",
            comment: "Great course with comprehensive coverage. The 24-week format allows for deep learning. IITPSA accreditation adds credibility.",
            helpful: 28
          }
        ],
        reviews: 55,
        liveSessions: [
          {
            id: "1",
            title: "Introduction to AI & Machine Learning",
            date: "2025-11-15",
            time: "18:00 - 20:00 CAT",
            instructor: "Dr. AI Expert Faculty",
            description: "Join us for an introductory live session covering the fundamentals of AI and machine learning. Perfect for understanding the course structure and expectations.",
            registered: 245,
            maxCapacity: 500
          },
          {
            id: "2",
            title: "Deep Learning Workshop",
            date: "2025-11-22",
            time: "18:00 - 21:00 CAT",
            instructor: "Dr. AI Expert Faculty",
            description: "Hands-on workshop building your first neural network. Bring your laptop and code along with the instructor.",
            registered: 189,
            maxCapacity: 500
          },
          {
            id: "3",
            title: "NLP & Computer Vision Masterclass",
            date: "2025-11-29",
            time: "17:00 - 20:00 CAT",
            instructor: "Industry Expert Panel",
            description: "Learn advanced techniques in natural language processing and computer vision from industry experts working at top tech companies.",
            registered: 312,
            maxCapacity: 500
          }
        ]
      };
    }
    
    // Default course (Financial Modeling)
    return {
      id: id || "1",
      title: "Financial Modeling for Startups",
      slug: id || "financial-modeling",
      description: "Learn how to build comprehensive financial models for your startup, including revenue projections, expense tracking, and investor presentations.",
      provider: "22 On Sloane",
      instructor_name: "John Smith",
      instructor_title: "CFO & Financial Advisor",
      instructor_bio: "20+ years of experience in startup finance and investment banking.",
      instructor_avatar: "/avatars/mafika-profile.png",
      price: 1299,
      duration: "8 weeks",
      level: "Intermediate",
      rating: 4.8,
      students: 1240,
      thumbnail_url: "/services/credit-scoring-banner.jpg",
      category: "Finance",
      delivery_mode: "Hybrid",
      whatYouLearn: [
        "Build a complete 3-statement financial model",
        "Create revenue and expense projections",
        "Understand key financial metrics",
        "Prepare investor-ready financials"
      ],
      prerequisites: [
        "Basic understanding of business finance",
        "Familiarity with spreadsheets (Excel/Google Sheets)"
      ],
      curriculum: [
        {
          module: 1,
          title: "Introduction to Financial Modeling",
          duration: "2 hours",
          lessons: [
            { title: "Getting Started", type: "video", duration: "15 min", isCompleted: false, isLocked: false },
            { title: "Core Concepts", type: "video", duration: "25 min", isCompleted: false, isLocked: false },
            { title: "Exercise: Build Your First Model", type: "assignment", duration: "45 min", isCompleted: false, isLocked: false }
          ]
        }
      ],
      totalHours: "24 hours",
      providerLogo: "/avatars/mafika-profile.png",
      instructor: "John Smith",
      instructorTitle: "CFO & Financial Advisor",
      instructorBio: "20+ years of experience in startup finance and investment banking.",
      reviewsList: [
        {
          id: "1",
          user: "Sarah Johnson",
          avatar: "/avatars/mafika-profile.png",
          rating: 5,
          date: "2025-10-15",
          comment: "Excellent course! Very practical and hands-on.",
        helpful: 24
      }
    ],
    reviews: 342,
    liveSessions: [
      {
        id: "1",
        title: "Q&A Session: Financial Modeling Best Practices",
        date: "2025-12-15T18:00:00",
        time: "6:00 PM - 7:30 PM SAST",
        duration: "90 minutes",
        description: "Join us for an interactive Q&A session where we'll discuss financial modeling best practices and answer your questions.",
        registered: 45,
        maxCapacity: 100
      },
      {
        id: "2",
        title: "Live Workshop: Building Your First Revenue Model",
        date: "2025-12-20T15:00:00",
        time: "3:00 PM - 5:00 PM SAST",
        duration: "120 minutes",
        description: "Hands-on workshop where we'll build a complete revenue projection model together.",
        registered: 62,
        maxCapacity: 80
      },
      {
        id: "3",
        title: "Guest Speaker: Fundraising & Financial Modeling",
        date: "2026-01-10T17:00:00",
        time: "5:00 PM - 6:30 PM SAST",
        duration: "90 minutes",
        description: "Special session with a successful VC-backed founder sharing insights on financial modeling for fundraising.",
        registered: 28,
        maxCapacity: 100
      }
    ]
  };
};

const course = getCourseData(id || "1");

  const enrollment = isEnrolled ? { progress: 45 } : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
            <Link to="/learning">
              <Button>Back to Learning Hub</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const mockCurriculum = course.curriculum;

  const totalLessons = mockCurriculum.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = mockCurriculum.reduce(
    (acc, module) => acc + module.lessons.filter((l: any) => l.isCompleted).length,
    0
  );
  const progressPercent = enrollment?.progress || 0;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "quiz": return <Target className="w-4 h-4" />;
      case "assignment": return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary/90 to-accent/80 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('/assets/hero-bg.jpg')] opacity-10 mix-blend-overlay" />
          <div className="container relative py-12 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Link to="/learning" className="text-sm hover:underline opacity-90">Learning Hub</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-sm">{course.category}</span>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <Badge className="bg-white/20 backdrop-blur-sm">{course.level}</Badge>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    {course.title}
                  </h1>
                  <p className="text-xl opacity-90">{course.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border-2 border-white/30">
                        <AvatarImage src={course.instructor_avatar || undefined} />
                        <AvatarFallback>{course.provider[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{course.instructor_name || course.provider}</div>
                        <div className="text-xs opacity-75">{course.instructor_title || "Instructor"}</div>
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-8 bg-white/30" />
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-rating text-rating" />
                      <span className="font-bold">{course.rating}</span>
                      <span className="opacity-75">(reviews)</span>
                    </div>
                    <Separator orientation="vertical" className="h-8 bg-white/30" />
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()} enrolled</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm border-white/20">
                      {course.category}
                    </Badge>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <Card className="sticky top-4 bg-background/95 backdrop-blur-sm shadow-xl">
                    <img 
                      src={course.thumbnail_url || "/services/credit-scoring-banner.jpg"} 
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <CardContent className="p-6 space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {course.price === 0 ? "Free" : `R${course.price}`}
                        </div>
                        {course.price > 0 && (
                          <div className="text-sm text-muted-foreground">One-time payment</div>
                        )}
                      </div>

                      {isEnrolled ? (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Your Progress</span>
                              <span className="font-medium">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                            <div className="text-xs text-muted-foreground text-center">
                              {completedLessons} of {totalLessons} lessons completed
                            </div>
                          </div>
                           <Button 
                             className="w-full gap-2" 
                             size="lg"
                             onClick={() => {
                               const curriculumTab = document.querySelector('[value="curriculum"]');
                               if (curriculumTab) {
                                 (curriculumTab as HTMLElement).click();
                                 setTimeout(() => {
                                   const firstLesson = document.querySelector('.hover\\:bg-accent\\/10');
                                   if (firstLesson) {
                                     firstLesson.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                   }
                                 }, 100);
                               }
                               toast.success("Opening course content...");
                             }}
                           >
                             <PlayCircle className="w-5 h-5" />
                             Continue Learning
                           </Button>
                        </>
                      ) : (
                        <Button 
                          className="w-full gap-2" 
                          size="lg"
                          onClick={() => {
                            if (!user) {
                              toast.error("Please log in to enroll");
                              return;
                            }
                            setIsEnrolled(true);
                            toast.success("Successfully enrolled in course!");
                          }}
                        >
                          <Award className="w-5 h-5" />
                          Enroll Now
                        </Button>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Heart className="w-4 h-4" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total Hours</span>
                          <span className="font-medium">{course.totalHours}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Delivery Mode</span>
                          <span className="font-medium">{course.delivery_mode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Language</span>
                          <span className="font-medium">English</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Certificate</span>
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-card shadow-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="live">Live Sessions</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      What You'll Learn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {course.whatYouLearn.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.prerequisites.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Course Curriculum</CardTitle>
                        <CardDescription>
                          {course.curriculum.length} modules • {totalLessons} lessons • {course.totalHours}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download Syllabus
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.curriculum.map((module) => (
                      <Collapsible key={module.module} defaultOpen={module.module === 1}>
                        <Card className="border-border/50">
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                                    {module.module}
                                  </div>
                                  <div className="text-left">
                                    <CardTitle className="text-base">{module.title}</CardTitle>
                                    <CardDescription className="text-sm">
                                      {module.lessons.length} lessons • {module.duration}
                                    </CardDescription>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 transition-transform group-data-[state=open]:rotate-90" />
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                {module.lessons.map((lesson, idx) => (
                                  <div 
                                    key={idx}
                                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                      lesson.isLocked 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:bg-accent/10 cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {lesson.isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-success" />
                                      ) : lesson.isLocked ? (
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                                      )}
                                      <div className="flex items-center gap-2">
                                        {getLessonIcon(lesson.type)}
                                        <span className="text-sm font-medium">{lesson.title}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                      {!lesson.isLocked && !lesson.isCompleted && (
                                        <Button size="sm" variant="ghost">
                                          <PlayCircle className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Instructor Tab */}
              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={course.providerLogo} />
                        <AvatarFallback>{course.instructor[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">{course.instructor}</h3>
                        <p className="text-muted-foreground mb-4">{course.instructorTitle} at {course.provider}</p>
                        <p className="text-sm leading-relaxed mb-4">{course.instructorBio}</p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>12,450 students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span>15 courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-rating text-rating" />
                            <span>4.9 rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary mb-2">{course.rating}</div>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-5 h-5 fill-rating text-rating" />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">{course.reviewsList.length} reviews</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm w-12">{stars} stars</span>
                            <Progress value={stars === 5 ? 80 : stars === 4 ? 15 : 5} className="h-2" />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {stars === 5 ? "80%" : stars === 4 ? "15%" : "5%"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <Card key={review}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Avatar>
                            <AvatarFallback>U{review}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-semibold">Student Name</div>
                                <div className="text-sm text-muted-foreground">2 weeks ago</div>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-4 h-4 fill-rating text-rating" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed">
                              Excellent course! The financial modeling techniques are practical and immediately applicable. 
                              The instructor explains complex concepts in an easy-to-understand way.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Live Sessions Tab */}
              <TabsContent value="live" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Live Sessions</CardTitle>
                    <CardDescription>
                      Join interactive sessions with the instructor and fellow learners
                    </CardDescription>
                  </CardHeader>
                </Card>

                {course.liveSessions.length > 0 ? (
                  <div className="space-y-4">
                    {course.liveSessions.map((session, idx) => (
                      <Card key={idx} className="border-accent/20 hover:border-primary/30 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Date Badge */}
                            <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-4 min-w-[90px] h-fit">
                              <div className="text-3xl font-bold text-primary">
                                {new Date(session.date).getDate()}
                              </div>
                              <div className="text-sm font-medium text-muted-foreground">
                                {new Date(session.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </div>
                            </div>

                            {/* Session Details */}
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {session.description}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {session.time}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Video className="w-4 h-4" />
                                  {session.duration}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Globe className="w-4 h-4" />
                                  Online
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4" />
                                  {session.registered}/{session.maxCapacity} registered
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                {isEnrolled ? (
                                  <>
                                    <Button 
                                      className="gap-2"
                                      onClick={() => {
                                        toast.success("Session added to your calendar!");
                                      }}
                                    >
                                      <Calendar className="w-4 h-4" />
                                      Add to Calendar
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => {
                                        toast.info("You'll receive session details via email closer to the date.");
                                      }}
                                    >
                                      Register
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    variant="outline"
                                    disabled
                                  >
                                    Enroll to Register
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Upcoming Sessions</h3>
                      <p className="text-sm text-muted-foreground">
                        Check back later for new live sessions
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
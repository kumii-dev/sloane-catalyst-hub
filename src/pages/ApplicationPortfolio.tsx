import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle } from "lucide-react";
import { generateApplicationPortfolioPdf } from "@/utils/applicationPortfolioPdfGenerator";
import { useToast } from "@/hooks/use-toast";

const ApplicationPortfolio = () => {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    try {
      await generateApplicationPortfolioPdf();
      toast({
        title: "Success",
        description: "Application Portfolio PDF downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const systems = [
    {
      category: "Core Platform Systems",
      color: "bg-primary/10 text-primary border-primary/20",
      applications: [
        {
          name: "Authentication & User Management",
          description: "Comprehensive multi-role authentication system supporting startups, mentors, advisors, funders, service providers, and administrators.",
          features: [
            "Email, phone, and Google sign-in integration",
            "Role-based access control (RBAC)",
            "Persona-based permissions and workflows",
            "JWT token management and session handling",
            "Password reset and account recovery"
          ]
        },
        {
          name: "Profile Management",
          description: "Dynamic persona-specific profile system with progressive profiling capabilities.",
          features: [
            "Multi-persona profile types (Startup, Mentor, Advisor, Funder, Service Provider)",
            "Progressive profiling with smart recommendations",
            "Profile optimization scoring and suggestions",
            "Sector and industry tagging with SETA integration",
            "Public and private profile visibility controls"
          ]
        },
        {
          name: "Credits & Wallet System",
          description: "Digital currency platform for seamless transactions and value exchange.",
          features: [
            "Virtual wallet with balance tracking",
            "Credits earning through platform activities",
            "Transaction history and audit trails",
            "Cohort-based credit allocations",
            "Automated credit deduction for services"
          ]
        },
        {
          name: "File Management",
          description: "Secure document storage, organization, and collaboration system.",
          features: [
            "Encrypted file upload and storage",
            "Folder organization with custom categories",
            "File sharing with permission controls",
            "Document tagging and search",
            "Recent files and shared files tracking"
          ]
        },
        {
          name: "Messaging Hub",
          description: "Real-time communication platform for all user interactions.",
          features: [
            "Direct messaging between users",
            "Conversation threading and context",
            "File attachments and rich media support",
            "Read receipts and typing indicators",
            "Message search and filtering"
          ]
        },
        {
          name: "Notifications System",
          description: "Intelligent alert system keeping users informed of platform activities.",
          features: [
            "Real-time push notifications",
            "Email notification integration",
            "Notification preferences and controls",
            "Activity feed with action items",
            "Priority-based notification routing"
          ]
        }
      ]
    },
    {
      category: "Marketplace & Services",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      applications: [
        {
          name: "Services Marketplace",
          description: "Comprehensive platform for listing, discovering, and booking professional services.",
          features: [
            "Service listing creation and management",
            "Advanced search with filters and categories",
            "Booking calendar and scheduling",
            "Integrated payment processing",
            "Service reviews and ratings"
          ]
        },
        {
          name: "Mentorship Platform",
          description: "AI-powered mentorship matching and session management system.",
          features: [
            "Smart mentor-mentee matching algorithm",
            "Session booking with availability management",
            "Video conferencing integration (Daily.co)",
            "Session notes and follow-up tracking",
            "Mentorship journey mapping and progress tracking"
          ]
        },
        {
          name: "Advisory Platform",
          description: "Expert advisory services with vetting and quality assurance.",
          features: [
            "Advisor vetting and approval workflow",
            "Expertise area categorization",
            "Hourly rate management in ZAR",
            "Session scheduling and reminders",
            "Advisory session reviews and feedback"
          ]
        },
        {
          name: "Funding Hub",
          description: "Central platform for funding opportunities and portfolio management.",
          features: [
            "Funding opportunity discovery and matching",
            "Application submission and tracking",
            "Portfolio tracking for funders",
            "Investment pipeline management",
            "Funding analytics and reporting"
          ]
        }
      ]
    },
    {
      category: "Learning & Development",
      color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      applications: [
        {
          name: "Learning Management System (LMS)",
          description: "Full-featured course platform with certification capabilities.",
          features: [
            "Course creation with modules and lessons",
            "Multiple content types (video, text, documents)",
            "Progress tracking and completion certificates",
            "Course recommendations based on profile",
            "Interactive assessments and quizzes"
          ]
        },
        {
          name: "Event Management",
          description: "Platform for hosting and managing webinars, workshops, and events.",
          features: [
            "Event creation and scheduling",
            "Registration management with capacity limits",
            "Virtual and in-person event support",
            "Attendance tracking and certificates",
            "Event reminders and notifications"
          ]
        }
      ]
    },
    {
      category: "Financial Tools",
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      applications: [
        {
          name: "Credit Scoring Engine",
          description: "Multi-domain business credit assessment system with AI analysis.",
          features: [
            "10-domain credit assessment framework",
            "AI-powered analysis and recommendations",
            "Risk banding and funding eligibility ranges",
            "Document upload and verification",
            "Shareable credit reports with consent"
          ]
        },
        {
          name: "Financial Model Builder",
          description: "Interactive financial modeling tool for business planning.",
          features: [
            "Revenue projection modeling",
            "COGS and OPEX calculations",
            "Cash flow forecasting",
            "Working capital analysis",
            "Excel export functionality"
          ]
        },
        {
          name: "Valuation Model",
          description: "Business valuation calculator with multiple methodologies.",
          features: [
            "DCF (Discounted Cash Flow) analysis",
            "Comparable company analysis",
            "Market-based valuation methods",
            "Scenario modeling",
            "Valuation report generation"
          ]
        }
      ]
    },
    {
      category: "AI & Automation",
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      applications: [
        {
          name: "AI Copilot",
          description: "OpenAI-powered intelligent business assistant for startups.",
          features: [
            "Natural language business queries",
            "Contextual recommendations",
            "Document analysis and summarization",
            "Business strategy suggestions",
            "Integration with platform data"
          ]
        },
        {
          name: "AI Matching Engine",
          description: "Machine learning-based matching system for optimal connections.",
          features: [
            "Smart mentor-mentee matching",
            "Service provider recommendations",
            "Course recommendations based on profile",
            "Match score calculation",
            "Continuous learning from user interactions"
          ]
        },
        {
          name: "Voice Narration",
          description: "ElevenLabs text-to-speech integration for accessibility.",
          features: [
            "Multi-lingual voice synthesis",
            "South African accent support",
            "High-quality voice generation",
            "Document narration capabilities",
            "Customizable voice settings"
          ]
        }
      ]
    },
    {
      category: "Communication & Collaboration",
      color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
      applications: [
        {
          name: "Video Conferencing",
          description: "Daily.co integration for high-quality video sessions.",
          features: [
            "One-click video room creation",
            "Screen sharing capabilities",
            "Recording functionality",
            "Secure video token generation",
            "Integration with booking system"
          ]
        },
        {
          name: "Document Generator",
          description: "Multi-format document generation for reports and presentations.",
          features: [
            "PDF generation with custom branding",
            "Word document export (DOCX)",
            "PowerPoint presentation creation (PPTX)",
            "Journey map visualizations",
            "System documentation exports"
          ]
        }
      ]
    },
    {
      category: "Admin & Governance",
      color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      applications: [
        {
          name: "Admin Dashboard",
          description: "Comprehensive administrative control panel.",
          features: [
            "User management and role assignment",
            "Platform analytics and metrics",
            "Financial overview and reporting",
            "System health monitoring",
            "Bulk operations and data management"
          ]
        },
        {
          name: "Cohort Management",
          description: "Sponsor-funded program administration system.",
          features: [
            "Cohort creation and configuration",
            "Member enrollment and tracking",
            "Credits allocation per cohort",
            "Funded service listings",
            "Cohort analytics and reporting"
          ]
        },
        {
          name: "Audit Logging",
          description: "Comprehensive activity tracking for compliance.",
          features: [
            "All user actions logging",
            "IP address and session tracking",
            "Resource access history",
            "Security event monitoring",
            "Audit trail exports"
          ]
        }
      ]
    },
    {
      category: "Supporting Systems",
      color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-600 border-yellow-500/20",
      applications: [
        {
          name: "Calendar & Scheduling",
          description: "Availability management and appointment scheduling.",
          features: [
            "Personal calendar management",
            "Availability slot configuration",
            "Time zone support",
            "Booking conflict prevention",
            "Calendar sync and reminders"
          ]
        },
        {
          name: "System Status & Monitoring",
          description: "Platform health tracking and incident management.",
          features: [
            "Real-time service status monitoring",
            "Uptime tracking and reporting",
            "Incident history and resolution",
            "Scheduled maintenance notifications",
            "Performance metrics dashboard"
          ]
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Application Portfolio</h1>
                <p className="text-muted-foreground text-lg">
                  Comprehensive overview of Kumii's 25 integrated systems and applications
                </p>
              </div>
              <Button onClick={handleDownloadPDF} size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold">25</CardTitle>
                  <CardDescription>Total Systems</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold">8</CardTitle>
                  <CardDescription>System Categories</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold">100+</CardTitle>
                  <CardDescription>Core Features</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold">5</CardTitle>
                  <CardDescription>User Personas</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Systems by Category */}
          <div className="space-y-12">
            {systems.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3 mb-6">
                  <Badge className={`text-base px-4 py-2 ${category.color}`}>
                    {category.category}
                  </Badge>
                  <span className="text-muted-foreground">
                    {category.applications.length} {category.applications.length === 1 ? 'System' : 'Systems'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {category.applications.map((app, appIdx) => (
                    <Card key={appIdx} className="border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">{app.name}</CardTitle>
                            <CardDescription className="text-base">{app.description}</CardDescription>
                          </div>
                          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 ml-4" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                            Key Features
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {app.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Technology Stack Summary */}
          <Card className="mt-12 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Technology Stack</CardTitle>
              <CardDescription>Core technologies powering Kumii's ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Frontend</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• React 18.3+ with TypeScript</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• TanStack Query for state management</li>
                    <li>• React Router for navigation</li>
                    <li>• Radix UI component library</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Backend</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• PostgreSQL (Supabase)</li>
                    <li>• Supabase Auth & Storage</li>
                    <li>• Edge Functions (Deno)</li>
                    <li>• Real-time subscriptions</li>
                    <li>• Row Level Security (RLS)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Third-Party Services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• OpenAI for AI capabilities</li>
                    <li>• ElevenLabs for voice synthesis</li>
                    <li>• Daily.co for video calls</li>
                    <li>• Resend for email delivery</li>
                    <li>• Sentry for error tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationPortfolio;

import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, Rocket, Users, Building2, Briefcase, TrendingUp } from "lucide-react";

interface Feature {
  name: string;
  status: 'implemented' | 'coming-soon' | 'planned' | 'partial';
  description: string;
  benefits: string[];
  availableFor?: string[];
}

const startupFeatures: Feature[] = [
  {
    name: "AI Copilot & Chat Support",
    status: "implemented",
    description: "24/7 intelligent AI assistant that helps you navigate the platform, answer questions, and provide guidance on your startup journey.",
    benefits: [
      "Instant answers to platform questions",
      "Personalized guidance based on your startup stage",
      "Available across all pages via floating chat button",
      "Context-aware assistance"
    ]
  },
  {
    name: "Credit Score Assessment",
    status: "implemented",
    description: "Comprehensive credit scoring system that evaluates your startup's creditworthiness based on multiple factors including technical capability, market potential, and financial health.",
    benefits: [
      "Detailed breakdown of scoring factors",
      "Technical, financial, and market scores",
      "Actionable recommendations for improvement",
      "Visible to potential funders"
    ]
  },
  {
    name: "Financial Model Builder",
    status: "implemented",
    description: "Professional-grade financial modeling tool with support for IFRS and US GAAP standards, allowing you to create comprehensive financial projections.",
    benefits: [
      "Income statements, balance sheets, and cash flow",
      "Scenario planning (Base, Best, Worst case)",
      "Export to Excel",
      "Validation and error checking"
    ]
  },
  {
    name: "Mentorship Matching",
    status: "implemented",
    description: "AI-powered matching system that connects you with experienced mentors based on your industry, challenges, and goals.",
    benefits: [
      "Smart matching algorithm",
      "View mentor profiles and expertise",
      "Book sessions directly",
      "Track mentorship progress"
    ]
  },
  {
    name: "Service Marketplace",
    status: "implemented",
    description: "Access affordable professional services from verified providers including CRM, ERP, HR, marketing tools, and consulting services.",
    benefits: [
      "Vetted service providers",
      "Transparent pricing",
      "Service categories from legal to marketing",
      "Direct booking and payment"
    ]
  },
  {
    name: "Funding Hub",
    status: "implemented",
    description: "Central platform to discover funding opportunities, submit applications, and track your funding pipeline.",
    benefits: [
      "AI-matched funding opportunities",
      "Application management",
      "Track application status",
      "Direct funder communication"
    ]
  },
  {
    name: "Secure Messaging",
    status: "implemented",
    description: "Encrypted messaging system for secure communication with mentors, funders, and service providers.",
    benefits: [
      "End-to-end encrypted conversations",
      "File sharing capabilities",
      "Contact management",
      "Message history and search"
    ]
  },
  {
    name: "Document Management",
    status: "implemented",
    description: "Secure cloud storage for all your startup documents including pitch decks, financial statements, and legal documents.",
    benefits: [
      "Organized file storage with folders",
      "Share documents securely",
      "Version control",
      "Search and filter capabilities"
    ]
  },
  {
    name: "Video Consultations",
    status: "implemented",
    description: "High-quality video calling for remote meetings with mentors, advisors, and investors.",
    benefits: [
      "HD video and audio",
      "Screen sharing",
      "Session recording",
      "Calendar integration"
    ]
  },
  {
    name: "Progress Tracking Dashboard",
    status: "implemented",
    description: "Comprehensive dashboard showing your startup's progress, applications, matches, and key metrics.",
    benefits: [
      "Real-time statistics",
      "Application tracking",
      "Match notifications",
      "Profile completion status"
    ]
  }
];

const mentorFeatures: Feature[] = [
  {
    name: "Profile Creation & Setup",
    status: "implemented",
    description: "Create a comprehensive mentor profile showcasing your expertise, experience, and areas where you can provide guidance.",
    benefits: [
      "Highlight your expertise and credentials",
      "Set your availability and pricing",
      "Upload profile picture and bio",
      "Specify industries and topics"
    ]
  },
  {
    name: "Smart Matching Algorithm",
    status: "implemented",
    description: "AI-powered system that matches you with startups that align with your expertise and availability.",
    benefits: [
      "Receive quality match suggestions",
      "Filter by industry and stage",
      "View match compatibility scores",
      "Accept or decline matches"
    ]
  },
  {
    name: "Calendar & Availability",
    status: "implemented",
    description: "Manage your mentoring schedule with an integrated calendar system that syncs with your availability.",
    benefits: [
      "Set recurring availability",
      "Block out busy times",
      "Automatic booking confirmations",
      "Calendar export/sync"
    ]
  },
  {
    name: "Video Call Integration",
    status: "implemented",
    description: "Built-in video calling for seamless mentorship sessions without external tools.",
    benefits: [
      "One-click session join",
      "High-quality video/audio",
      "Screen sharing for demos",
      "Session recordings available"
    ]
  },
  {
    name: "Session Management",
    status: "implemented",
    description: "Complete session lifecycle management from booking to completion and follow-up.",
    benefits: [
      "View upcoming sessions",
      "Session notes and materials",
      "Post-session reviews",
      "Reschedule or cancel options"
    ]
  },
  {
    name: "Secure Messaging",
    status: "implemented",
    description: "Private messaging with mentees for ongoing support between sessions.",
    benefits: [
      "Encrypted communications",
      "File sharing",
      "Message history",
      "Quick responses"
    ]
  },
  {
    name: "Impact Analytics Dashboard",
    status: "implemented",
    description: "Track your mentorship impact with detailed analytics and mentee progress metrics.",
    benefits: [
      "Total mentees and sessions",
      "Average ratings",
      "Impact metrics",
      "Mentee success stories"
    ]
  },
  {
    name: "Revenue & Payment System",
    status: "coming-soon",
    description: "Integrated payment system for paid mentorship sessions with automatic invoicing and earnings tracking.",
    benefits: [
      "Automatic payment processing",
      "Earnings dashboard",
      "Invoice generation",
      "Multiple payment methods"
    ]
  },
  {
    name: "Review & Rating System",
    status: "implemented",
    description: "Collect and showcase reviews from mentees to build your reputation and credibility.",
    benefits: [
      "Star ratings and written reviews",
      "Display on profile",
      "Response to reviews",
      "Build credibility"
    ]
  },
  {
    name: "Community Forums",
    status: "coming-soon",
    description: "Participate in mentor community forums to share insights, best practices, and collaborate with other mentors.",
    benefits: [
      "Knowledge sharing",
      "Best practice discussions",
      "Mentor networking",
      "Collaborative learning"
    ]
  }
];

const providerFeatures: Feature[] = [
  {
    name: "Service Listing Platform",
    status: "implemented",
    description: "Create and manage professional service listings with detailed descriptions, pricing, and packages.",
    benefits: [
      "Multiple service listings",
      "Rich text descriptions",
      "Pricing tiers and packages",
      "Category organization"
    ]
  },
  {
    name: "Smart Search & Filtering",
    status: "implemented",
    description: "Help clients find your services through intelligent search and filtering capabilities.",
    benefits: [
      "Category-based discovery",
      "Keyword search optimization",
      "Filter by price and type",
      "Featured listings"
    ]
  },
  {
    name: "Profile Optimization Tools",
    status: "implemented",
    description: "Tools and guidance to optimize your provider profile for maximum visibility and client attraction.",
    benefits: [
      "Profile completeness percentage tracker",
      "Interactive checklist with required and recommended items",
      "Real-time optimization tips",
      "Visual progress tracking"
    ]
  },
  {
    name: "AI-Powered Client Matching",
    status: "planned",
    description: "Get matched with potential clients whose needs align with your service offerings.",
    benefits: [
      "Proactive client suggestions",
      "Match quality scores",
      "Lead generation",
      "Targeted outreach"
    ]
  },
  {
    name: "Booking & Scheduling System",
    status: "implemented",
    description: "Integrated booking system allowing clients to schedule consultations and service delivery.",
    benefits: [
      "Real-time availability",
      "Automated confirmations",
      "Calendar sync",
      "Booking management"
    ]
  },
  {
    name: "Payment Processing",
    status: "planned",
    description: "Secure payment processing for service transactions with multiple payment methods.",
    benefits: [
      "Credit card processing",
      "Kumii credits integration",
      "Automatic invoicing",
      "Transaction history"
    ]
  },
  {
    name: "Client Communication Hub",
    status: "implemented",
    description: "Centralized messaging system for client communications and project updates.",
    benefits: [
      "Secure messaging",
      "File sharing",
      "Project updates",
      "Communication history"
    ]
  },
  {
    name: "Service Delivery Tools",
    status: "coming-soon",
    description: "Tools to manage and deliver your services including project management and collaboration features.",
    benefits: [
      "Project milestones",
      "Deliverable tracking",
      "Client collaboration",
      "Progress reporting"
    ]
  },
  {
    name: "Performance Analytics",
    status: "implemented",
    description: "Track your service performance with detailed analytics on views, bookings, and revenue.",
    benefits: [
      "View and engagement metrics",
      "Booking conversion rates",
      "Revenue tracking",
      "Client feedback analysis"
    ]
  },
  {
    name: "CRM & Client Management",
    status: "coming-soon",
    description: "Built-in CRM system to manage client relationships, track interactions, and nurture leads.",
    benefits: [
      "Client database",
      "Interaction history",
      "Lead pipeline",
      "Follow-up reminders"
    ]
  }
];

const funderFeatures: Feature[] = [
  {
    name: "Funding Opportunities Management",
    status: "implemented",
    description: "Create and manage funding opportunities with detailed requirements and application workflows.",
    benefits: [
      "Multiple funding programs",
      "Custom application forms",
      "Status tracking",
      "Application deadlines"
    ]
  },
  {
    name: "Application Management",
    status: "implemented",
    description: "Streamlined system to receive, review, and manage funding applications from startups.",
    benefits: [
      "Centralized inbox",
      "Application filtering",
      "Review workflows",
      "Status updates"
    ]
  },
  {
    name: "Pipeline Visualization & Workflow",
    status: "coming-soon",
    description: "Visual pipeline management with kanban-style boards to track deals through stages.",
    benefits: [
      "Drag-and-drop stages",
      "Visual deal flow",
      "Stage progression tracking",
      "Team collaboration"
    ]
  },
  {
    name: "Smart Startup Matching",
    status: "implemented",
    description: "AI-powered matching to discover startups that align with your investment thesis and criteria.",
    benefits: [
      "Automatic matching",
      "Compatibility scores",
      "Custom filters",
      "Match notifications"
    ]
  },
  {
    name: "Advanced Search & Filters",
    status: "coming-soon",
    description: "Powerful search and filtering tools to discover startups by sector, stage, location, and more.",
    benefits: [
      "Multi-criteria search",
      "Saved searches",
      "Custom filters",
      "Export capabilities"
    ]
  },
  {
    name: "Due Diligence Tools",
    status: "coming-soon",
    description: "Comprehensive tools to conduct thorough due diligence on potential investments.",
    benefits: [
      "Document checklists",
      "Verification workflows",
      "Team collaboration",
      "Audit trails"
    ]
  },
  {
    name: "Credit Score Access",
    status: "implemented",
    description: "View detailed credit assessments and scores for startups you're considering for funding.",
    benefits: [
      "Comprehensive scoring",
      "Risk assessment",
      "Historical data",
      "Score breakdowns"
    ]
  },
  {
    name: "Financial Model Review",
    status: "implemented",
    description: "Access and analyze startup financial models including projections and scenarios.",
    benefits: [
      "Full model access",
      "Scenario analysis",
      "Export capabilities",
      "Comments and notes"
    ]
  },
  {
    name: "Secure Data Room",
    status: "implemented",
    description: "Secure virtual data room for confidential document sharing and due diligence materials.",
    benefits: [
      "Encrypted storage",
      "Access controls",
      "Document versioning",
      "Activity tracking"
    ]
  },
  {
    name: "Investment Management",
    status: "coming-soon",
    description: "Manage your investment lifecycle from commitment to exit with comprehensive tracking.",
    benefits: [
      "Deal structuring",
      "Investment tracking",
      "Milestone management",
      "Reporting automation"
    ]
  },
  {
    name: "Portfolio Tracking",
    status: "coming-soon",
    description: "Monitor and track all your portfolio companies with performance metrics and updates.",
    benefits: [
      "Portfolio dashboard",
      "Performance metrics",
      "Company updates",
      "ROI tracking"
    ]
  },
  {
    name: "Startup Communication Hub",
    status: "implemented",
    description: "Direct messaging and communication tools for ongoing engagement with portfolio companies.",
    benefits: [
      "Secure messaging",
      "Group conversations",
      "File sharing",
      "Communication history"
    ]
  },
  {
    name: "Cohort Manager",
    status: "partial",
    description: "Create and manage cohorts with bulk subscription capabilities and email-based auto-assignment. Core functionality is available; linking individual mentees to active programmes is coming soon.",
    benefits: [
      "Create and manage multiple cohorts ✓",
      "Bulk assign listings to cohorts ✓",
      "Email-based auto-assignment ✓",
      "Track cohort status and members ✓",
      "Link individual mentees to programmes (coming soon)"
    ]
  }
];

const StatusBadge = ({ status }: { status: 'implemented' | 'coming-soon' | 'planned' | 'partial' }) => {
  const config = {
    implemented: {
      icon: Check,
      label: "Available Now",
      variant: "default" as const,
      className: "bg-green-500 hover:bg-green-600"
    },
    'coming-soon': {
      icon: Clock,
      label: "Coming Soon",
      variant: "secondary" as const,
      className: "bg-orange-500 hover:bg-orange-600 text-white"
    },
    planned: {
      icon: Rocket,
      label: "Planned",
      variant: "outline" as const,
      className: "border-primary text-primary"
    },
    partial: {
      icon: Clock,
      label: "Partially Available",
      variant: "secondary" as const,
      className: "bg-blue-500 hover:bg-blue-600 text-white"
    }
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <Badge className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

const FeatureCard = ({ feature }: { feature: Feature }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{feature.name}</CardTitle>
            <CardDescription className="text-sm">{feature.description}</CardDescription>
          </div>
          <StatusBadge status={feature.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Key Benefits:</h4>
          <ul className="space-y-1">
            {feature.benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

const FeatureDocumentation = () => {
  return (
    <Layout showSidebar={true}>
      <div className="max-w-7xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <Badge variant="outline" className="px-4 py-2 text-base">
              <Rocket className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Complete Feature Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive overview of all Kumii platform features, their capabilities, and implementation status across all user types.
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">Feature Implementation Status</h2>
          </div>
          
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Total Features</div>
                  <div className="text-4xl font-bold text-primary">43</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Implemented</div>
                  <div className="text-4xl font-bold text-green-600">30</div>
                  <div className="text-xs text-muted-foreground mt-1">70%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Coming Soon</div>
                  <div className="text-4xl font-bold text-orange-500">10</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Planned</div>
                  <div className="text-4xl font-bold text-slate-400">2</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features by User Type */}
        <Tabs defaultValue="startup" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="startup" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Startup
            </TabsTrigger>
            <TabsTrigger value="mentor" className="gap-2">
              <Users className="w-4 h-4" />
              Mentor
            </TabsTrigger>
            <TabsTrigger value="provider" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="funder" className="gap-2">
              <Building2 className="w-4 h-4" />
              Funder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="startup" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Startup Features</h2>
              <p className="text-muted-foreground">
                Comprehensive toolkit to help startups grow from idea to scale
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <Badge variant="outline">{startupFeatures.length} Total Features</Badge>
                <Badge className="bg-green-500">
                  {startupFeatures.filter(f => f.status === 'implemented').length} Available
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {startupFeatures.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentor" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Mentor Features</h2>
              <p className="text-muted-foreground">
                Tools to share your expertise and build a successful mentoring practice
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <Badge variant="outline">{mentorFeatures.length} Total Features</Badge>
                <Badge className="bg-green-500">
                  {mentorFeatures.filter(f => f.status === 'implemented').length} Available
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentorFeatures.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="provider" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Service Provider Features</h2>
              <p className="text-muted-foreground">
                Everything you need to list, manage, and grow your service business
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <Badge variant="outline">{providerFeatures.length} Total Features</Badge>
                <Badge className="bg-green-500">
                  {providerFeatures.filter(f => f.status === 'implemented').length} Available
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providerFeatures.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="funder" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Funder Features</h2>
              <p className="text-muted-foreground">
                Sophisticated tools to discover, evaluate, and manage investments
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <Badge variant="outline">{funderFeatures.length} Total Features</Badge>
                <Badge className="bg-green-500">
                  {funderFeatures.filter(f => f.status === 'implemented').length} Available
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {funderFeatures.map((feature, idx) => (
                <FeatureCard key={idx} feature={feature} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-center">Feature Status Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <StatusBadge status="implemented" />
                <p className="text-sm text-muted-foreground">
                  Feature is live and available for use
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status="coming-soon" />
                <p className="text-sm text-muted-foreground">
                  Feature is in development and launching soon
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status="planned" />
                <p className="text-sm text-muted-foreground">
                  Feature is on our roadmap for future development
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status="partial" />
                <p className="text-sm text-muted-foreground">
                  Feature is partially implemented with core functionality available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="text-2xl font-bold">Have Feature Requests?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're constantly improving the platform. Share your feedback and feature requests to help us build what you need.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FeatureDocumentation;

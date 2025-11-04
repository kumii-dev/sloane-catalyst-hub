import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeatureMapping {
  feature: string;
  stages: {
    [key: string]: boolean;
  };
}

const startupFeatures: FeatureMapping[] = [
  {
    feature: "AI Copilot & Chat Support",
    stages: { "Awareness": true, "Onboarding": true, "Engagement": true, "Growth": true, "Advocacy": true }
  },
  {
    feature: "Credit Score Assessment",
    stages: { "Awareness": true, "Onboarding": true, "Engagement": true, "Growth": true, "Advocacy": false }
  },
  {
    feature: "Financial Model Builder",
    stages: { "Awareness": false, "Onboarding": true, "Engagement": true, "Growth": true, "Advocacy": false }
  },
  {
    feature: "Mentorship Matching",
    stages: { "Awareness": false, "Onboarding": true, "Engagement": true, "Growth": true, "Advocacy": false }
  },
  {
    feature: "Service Marketplace",
    stages: { "Awareness": true, "Onboarding": false, "Engagement": true, "Growth": true, "Advocacy": false }
  },
  {
    feature: "Funding Hub",
    stages: { "Awareness": true, "Onboarding": false, "Engagement": true, "Growth": true, "Advocacy": false }
  },
  {
    feature: "Secure Messaging",
    stages: { "Awareness": false, "Onboarding": true, "Engagement": true, "Growth": true, "Advocacy": true }
  },
  {
    feature: "Document Management",
    stages: { "Awareness": false, "Onboarding": true, "Engagement": true, "Growth": true, "Advocacy": false }
  },
  {
    feature: "Video Consultations",
    stages: { "Awareness": false, "Onboarding": false, "Engagement": true, "Growth": true, "Advocacy": false }
  },
  {
    feature: "Progress Tracking Dashboard",
    stages: { "Awareness": false, "Onboarding": true, "Engagement": true, "Growth": true, "Advocacy": true }
  }
];

const mentorFeatures: FeatureMapping[] = [
  {
    feature: "Profile Creation & Setup",
    stages: { "Awareness": false, "Registration": true, "Matching": true, "Mentoring": false, "Growth": false }
  },
  {
    feature: "Smart Matching Algorithm",
    stages: { "Awareness": false, "Registration": false, "Matching": true, "Mentoring": true, "Growth": false }
  },
  {
    feature: "Calendar & Availability",
    stages: { "Awareness": false, "Registration": true, "Matching": false, "Mentoring": true, "Growth": true }
  },
  {
    feature: "Video Call Integration",
    stages: { "Awareness": false, "Registration": false, "Matching": false, "Mentoring": true, "Growth": false }
  },
  {
    feature: "Session Management",
    stages: { "Awareness": false, "Registration": false, "Matching": false, "Mentoring": true, "Growth": true }
  },
  {
    feature: "Secure Messaging",
    stages: { "Awareness": false, "Registration": false, "Matching": true, "Mentoring": true, "Growth": true }
  },
  {
    feature: "Impact Analytics Dashboard",
    stages: { "Awareness": false, "Registration": false, "Matching": false, "Mentoring": true, "Growth": true }
  },
  {
    feature: "Revenue & Payment System",
    stages: { "Awareness": false, "Registration": false, "Matching": false, "Mentoring": true, "Growth": true }
  },
  {
    feature: "Review & Rating System",
    stages: { "Awareness": false, "Registration": false, "Matching": false, "Mentoring": true, "Growth": true }
  },
  {
    feature: "Community Forums",
    stages: { "Awareness": true, "Registration": false, "Matching": false, "Mentoring": false, "Growth": true }
  }
];

const providerFeatures: FeatureMapping[] = [
  {
    feature: "Service Listing Platform",
    stages: { "Discovery": true, "Setup": true, "Acquisition": true, "Delivery": false, "Retention": false }
  },
  {
    feature: "Smart Search & Filtering",
    stages: { "Discovery": true, "Setup": false, "Acquisition": true, "Delivery": false, "Retention": false }
  },
  {
    feature: "Profile Optimization Tools",
    stages: { "Discovery": false, "Setup": true, "Acquisition": true, "Delivery": false, "Retention": true }
  },
  {
    feature: "AI-Powered Client Matching",
    stages: { "Discovery": false, "Setup": false, "Acquisition": true, "Delivery": false, "Retention": false }
  },
  {
    feature: "Booking & Scheduling System",
    stages: { "Discovery": false, "Setup": true, "Acquisition": true, "Delivery": true, "Retention": false }
  },
  {
    feature: "Payment Processing",
    stages: { "Discovery": false, "Setup": true, "Acquisition": false, "Delivery": true, "Retention": false }
  },
  {
    feature: "Client Communication Hub",
    stages: { "Discovery": false, "Setup": false, "Acquisition": true, "Delivery": true, "Retention": true }
  },
  {
    feature: "Service Delivery Tools",
    stages: { "Discovery": false, "Setup": false, "Acquisition": false, "Delivery": true, "Retention": false }
  },
  {
    feature: "Performance Analytics",
    stages: { "Discovery": false, "Setup": false, "Acquisition": false, "Delivery": true, "Retention": true }
  },
  {
    feature: "CRM & Client Management",
    stages: { "Discovery": false, "Setup": false, "Acquisition": false, "Delivery": true, "Retention": true }
  }
];

const funderFeatures: FeatureMapping[] = [
  {
    feature: "Deal Flow Dashboard",
    stages: { "Awareness": true, "Registration": false, "Discovery": true, "Evaluation": true, "Investment": false, "Portfolio": false }
  },
  {
    feature: "Smart Startup Matching",
    stages: { "Awareness": false, "Registration": false, "Discovery": true, "Evaluation": false, "Investment": false, "Portfolio": false }
  },
  {
    feature: "Advanced Search & Filters",
    stages: { "Awareness": false, "Registration": false, "Discovery": true, "Evaluation": false, "Investment": false, "Portfolio": false }
  },
  {
    feature: "Due Diligence Tools",
    stages: { "Awareness": false, "Registration": false, "Discovery": false, "Evaluation": true, "Investment": false, "Portfolio": false }
  },
  {
    feature: "Credit Score Access",
    stages: { "Awareness": false, "Registration": false, "Discovery": true, "Evaluation": true, "Investment": false, "Portfolio": false }
  },
  {
    feature: "Financial Model Review",
    stages: { "Awareness": false, "Registration": false, "Discovery": false, "Evaluation": true, "Investment": false, "Portfolio": false }
  },
  {
    feature: "Secure Data Room",
    stages: { "Awareness": false, "Registration": false, "Discovery": false, "Evaluation": true, "Investment": true, "Portfolio": false }
  },
  {
    feature: "Investment Management",
    stages: { "Awareness": false, "Registration": false, "Discovery": false, "Evaluation": false, "Investment": true, "Portfolio": true }
  },
  {
    feature: "Portfolio Tracking",
    stages: { "Awareness": false, "Registration": false, "Discovery": false, "Evaluation": false, "Investment": false, "Portfolio": true }
  },
  {
    feature: "Startup Communication Hub",
    stages: { "Awareness": false, "Registration": false, "Discovery": false, "Evaluation": true, "Investment": true, "Portfolio": true }
  }
];

interface MatrixTableProps {
  features: FeatureMapping[];
  stages: string[];
}

const MatrixTable = ({ features, stages }: MatrixTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-semibold min-w-[200px] sticky left-0 bg-background z-10">
              Platform Feature
            </th>
            {stages.map((stage) => (
              <th key={stage} className="text-center p-4 font-semibold min-w-[120px]">
                {stage}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={feature.feature} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
              <td className="p-4 font-medium sticky left-0 bg-background z-10">
                {feature.feature}
              </td>
              {stages.map((stage) => (
                <td key={stage} className="text-center p-4">
                  {feature.stages[stage] && (
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FeaturesMappingMatrix = () => {
  return (
    <div className="w-full py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Platform Features Mapping</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          See how our comprehensive platform features support every stage of your journey
        </p>
      </div>

      <Tabs defaultValue="startup" className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
          <TabsTrigger value="startup">Startup</TabsTrigger>
          <TabsTrigger value="mentor">Mentor</TabsTrigger>
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="funder">Funder</TabsTrigger>
        </TabsList>

        <TabsContent value="startup" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Startup Journey Support</CardTitle>
              <CardDescription>
                Platform features mapped to each stage of the startup journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatrixTable 
                features={startupFeatures} 
                stages={["Awareness", "Onboarding", "Engagement", "Growth", "Advocacy"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentor" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Journey Support</CardTitle>
              <CardDescription>
                Platform features mapped to each stage of the mentor journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatrixTable 
                features={mentorFeatures} 
                stages={["Awareness", "Registration", "Matching", "Mentoring", "Growth"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Service Provider Journey Support</CardTitle>
              <CardDescription>
                Platform features mapped to each stage of the service provider journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatrixTable 
                features={providerFeatures} 
                stages={["Discovery", "Setup", "Acquisition", "Delivery", "Retention"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funder" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Funder Journey Support</CardTitle>
              <CardDescription>
                Platform features mapped to each stage of the funder journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatrixTable 
                features={funderFeatures} 
                stages={["Awareness", "Registration", "Discovery", "Evaluation", "Investment", "Portfolio"]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground italic">
          ✓ indicates the platform feature actively supports this journey stage
        </p>
      </div>
    </div>
  );
};

export default FeaturesMappingMatrix;

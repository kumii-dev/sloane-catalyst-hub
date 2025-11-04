import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Search, Truck, Award } from "lucide-react";

interface JourneyStage {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  touchpoints: string[];
  actions: string[];
  emotions: string;
  painPoints: string[];
  opportunities: string[];
}

const journeyStages: JourneyStage[] = [
  {
    title: "Discovery",
    icon: <Search className="h-8 w-8" />,
    gradient: "from-blue-400 to-cyan-500",
    touchpoints: ["B2B Marketing", "Partner Network", "Direct Outreach"],
    actions: ["Learns about marketplace", "Evaluates opportunity"],
    emotions: "Interested, Analytical, Cautious",
    painPoints: ["Commission concerns", "Market fit uncertainty"],
    opportunities: ["Clear pricing model", "Target audience data"]
  },
  {
    title: "Setup",
    icon: <FileText className="h-8 w-8" />,
    gradient: "from-cyan-500 to-teal-500",
    touchpoints: ["Provider Registration", "Service Listing", "Portfolio Upload"],
    actions: ["Creates provider profile", "Lists services"],
    emotions: "Focused, Detail-oriented, Hopeful",
    painPoints: ["Listing complexity", "Portfolio formatting"],
    opportunities: ["Templates", "Pricing guidance"]
  },
  {
    title: "Acquisition",
    icon: <Briefcase className="h-8 w-8" />,
    gradient: "from-teal-500 to-emerald-500",
    touchpoints: ["Marketplace Visibility", "Search Rankings", "Client Inquiries"],
    actions: ["Responds to inquiries", "Sends proposals"],
    emotions: "Eager, Competitive, Proactive",
    painPoints: ["Low visibility", "Price competition"],
    opportunities: ["Featured listings", "Reviews system"]
  },
  {
    title: "Delivery",
    icon: <Truck className="h-8 w-8" />,
    gradient: "from-emerald-500 to-amber-400",
    touchpoints: ["Project Management", "Communication", "Payment Processing"],
    actions: ["Delivers services", "Updates clients"],
    emotions: "Professional, Committed, Results-driven",
    painPoints: ["Scope creep", "Payment delays"],
    opportunities: ["Clear agreements", "Milestone payments"]
  },
  {
    title: "Retention",
    icon: <Award className="h-8 w-8" />,
    gradient: "from-amber-400 to-orange-500",
    touchpoints: ["Client Reviews", "Repeat Business", "Referrals"],
    actions: ["Receives reviews", "Builds reputation"],
    emotions: "Satisfied, Established, Growing",
    painPoints: ["Client churn", "Market saturation"],
    opportunities: ["Loyalty rewards", "Featured provider status"]
  }
];

const SectionContent = ({ title, items, color }: { title: string; items: string[] | string; color: string }) => (
  <div className="mb-4">
    <h4 className={`font-semibold mb-2 ${color}`}>
      {title}:
    </h4>
    {Array.isArray(items) ? (
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm leading-relaxed">• {item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm italic leading-relaxed">{items}</p>
    )}
  </div>
);

const ServiceProviderJourneyMap = () => {
  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            🎯 Service Provider Journey Map
          </h2>
          <p className="text-lg text-muted-foreground">
            "From Discovery to Retention" – Empowering service providers to build lasting client relationships
          </p>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden lg:flex items-start justify-between gap-6 mb-8">
          {journeyStages.map((stage, index) => (
            <div key={stage.title} className="flex items-start flex-1 min-w-0">
              <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className={`bg-gradient-to-br ${stage.gradient} text-white rounded-t-2xl p-6`}>
                  <div className="flex items-center justify-center mb-3">
                    {stage.icon}
                  </div>
                  <CardTitle className="text-center text-xl">{stage.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6 px-5 space-y-4">
                  <SectionContent title="Touchpoints" items={stage.touchpoints} color="text-blue-600" />
                  <SectionContent title="Actions" items={stage.actions} color="text-amber-600" />
                  <SectionContent title="Emotions" items={stage.emotions} color="text-pink-600" />
                  <SectionContent title="Pain Points" items={stage.painPoints} color="text-destructive" />
                  <SectionContent title="Opportunities" items={stage.opportunities} color="text-emerald-600" />
                </CardContent>
              </Card>
              {index < journeyStages.length - 1 && (
                <div className="flex items-center justify-center mx-3 mt-24 flex-shrink-0">
                  <span className="text-4xl text-primary animate-pulse">→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Vertical Layout */}
        <div className="lg:hidden space-y-6">
          {journeyStages.map((stage, index) => (
            <div key={stage.title}>
              <Card className="shadow-lg">
                <CardHeader className={`bg-gradient-to-br ${stage.gradient} text-white rounded-t-2xl`}>
                  <div className="flex items-center justify-center mb-3">
                    {stage.icon}
                  </div>
                  <CardTitle className="text-center text-xl">{stage.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <SectionContent title="Touchpoints" items={stage.touchpoints} color="text-blue-600" />
                  <SectionContent title="Actions" items={stage.actions} color="text-amber-600" />
                  <SectionContent title="Emotions" items={stage.emotions} color="text-pink-600" />
                  <SectionContent title="Pain Points" items={stage.painPoints} color="text-destructive" />
                  <SectionContent title="Opportunities" items={stage.opportunities} color="text-emerald-600" />
                </CardContent>
              </Card>
              {index < journeyStages.length - 1 && (
                <div className="flex items-center justify-center my-4">
                  <span className="text-4xl text-primary animate-pulse rotate-90 inline-block">→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg font-semibold text-primary">
            "Empowering every service provider to succeed, deliver, and grow."
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderJourneyMap;

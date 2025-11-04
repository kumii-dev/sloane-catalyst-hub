import { Card } from "@/components/ui/card";
import { Search, FileText, ShoppingCart, Briefcase, Award, ArrowRight } from "lucide-react";

interface JourneyStage {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  touchpoints: string[];
  actions: string[];
  emotions: string[];
  painPoints: string[];
  opportunities: string[];
}

const journeyStages: JourneyStage[] = [
  {
    title: "Discovery",
    icon: <Search className="w-8 h-8" />,
    gradient: "from-teal-400 via-cyan-400 to-blue-400",
    touchpoints: ["B2B Marketing", "Partner Network", "Direct Outreach"],
    actions: ["Learns about marketplace", "Evaluates opportunity"],
    emotions: ["Interested", "Analytical", "Cautious"],
    painPoints: ["Commission concerns", "Market fit uncertainty"],
    opportunities: ["Clear pricing model", "Target audience data"],
  },
  {
    title: "Setup",
    icon: <FileText className="w-8 h-8" />,
    gradient: "from-blue-400 via-indigo-400 to-purple-400",
    touchpoints: ["Provider Registration", "Service Listing", "Portfolio Upload"],
    actions: ["Creates provider profile", "Lists services"],
    emotions: ["Focused", "Detail-oriented", "Hopeful"],
    painPoints: ["Listing complexity", "Portfolio formatting"],
    opportunities: ["Templates", "Pricing guidance"],
  },
  {
    title: "Acquisition",
    icon: <ShoppingCart className="w-8 h-8" />,
    gradient: "from-purple-400 via-pink-400 to-rose-400",
    touchpoints: ["Marketplace Visibility", "Search Rankings", "Client Inquiries"],
    actions: ["Responds to inquiries", "Sends proposals"],
    emotions: ["Eager", "Competitive", "Proactive"],
    painPoints: ["Low visibility", "Price competition"],
    opportunities: ["Featured listings", "Reviews system"],
  },
  {
    title: "Delivery",
    icon: <Briefcase className="w-8 h-8" />,
    gradient: "from-rose-400 via-orange-400 to-amber-400",
    touchpoints: ["Project Management", "Communication", "Payment Processing"],
    actions: ["Delivers services", "Updates clients"],
    emotions: ["Professional", "Committed", "Results-driven"],
    painPoints: ["Scope creep", "Payment delays"],
    opportunities: ["Clear agreements", "Milestone payments"],
  },
  {
    title: "Retention",
    icon: <Award className="w-8 h-8" />,
    gradient: "from-amber-400 via-yellow-400 to-green-400",
    touchpoints: ["Client Reviews", "Repeat Business", "Referrals"],
    actions: ["Receives reviews", "Builds reputation"],
    emotions: ["Satisfied", "Established", "Growing"],
    painPoints: ["Client churn", "Market saturation"],
    opportunities: ["Loyalty rewards", "Featured provider status"],
  },
];

const SectionContent = ({ title, items, color }: { title: string; items: string[]; color: string }) => (
  <div className="space-y-2">
    <h4 className={`font-semibold text-sm ${color}`}>{title}</h4>
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
          <span className="text-primary mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const ServiceProviderJourneyMap = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          🏢 Service Provider Journey Map
        </h1>
        <p className="text-xl text-muted-foreground italic">
          "From Discovery to Recognition"
        </p>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto">
          Empowering service providers to connect with clients, deliver excellence, and grow their business.
        </p>
      </div>

      {/* Journey Stages - Horizontal Flow */}
      <div className="relative">
        {/* Desktop View - Horizontal */}
        <div className="hidden lg:flex items-start justify-center gap-4 relative">
          {journeyStages.map((stage, index) => (
            <div key={stage.title} className="flex items-start">
              {/* Stage Card */}
              <Card className="w-64 hover:scale-105 transition-all duration-300 hover:shadow-2xl shadow-lg">
                <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${stage.gradient}`} />
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white shadow-lg`}>
                      {stage.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{stage.title}</h3>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-4">
                    <SectionContent title="📍 Touchpoints" items={stage.touchpoints} color="text-blue-600 dark:text-blue-400" />
                    <SectionContent title="⚡ Actions" items={stage.actions} color="text-purple-600 dark:text-purple-400" />
                    <SectionContent title="❤️ Emotions" items={stage.emotions} color="text-cyan-600 dark:text-cyan-400" />
                    <SectionContent title="⚠️ Pain Points" items={stage.painPoints} color="text-red-600 dark:text-red-400" />
                    <div className="space-y-2 pt-2 border-t border-primary/20">
                      <h4 className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="animate-pulse">✨</span>
                        Opportunities
                      </h4>
                      <ul className="space-y-1.5">
                        {stage.opportunities.map((item, idx) => (
                          <li key={idx} className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                            <span className="text-emerald-500">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Arrow Between Stages */}
              {index < journeyStages.length - 1 && (
                <div className="flex items-center justify-center px-2 pt-32">
                  <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet View - Vertical */}
        <div className="lg:hidden space-y-8">
          {journeyStages.map((stage, index) => (
            <div key={stage.title} className="space-y-4">
              <Card className="hover:scale-[1.02] transition-all duration-300 shadow-lg">
                <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${stage.gradient}`} />
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                      {stage.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{stage.title}</h3>
                  </div>

                  {/* Content Sections */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SectionContent title="📍 Touchpoints" items={stage.touchpoints} color="text-blue-600 dark:text-blue-400" />
                    <SectionContent title="⚡ Actions" items={stage.actions} color="text-purple-600 dark:text-purple-400" />
                    <SectionContent title="❤️ Emotions" items={stage.emotions} color="text-cyan-600 dark:text-cyan-400" />
                    <SectionContent title="⚠️ Pain Points" items={stage.painPoints} color="text-red-600 dark:text-red-400" />
                  </div>

                  <div className="space-y-2 pt-4 border-t-2 border-primary/20">
                    <h4 className="font-semibold text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <span className="animate-pulse text-lg">✨</span>
                      Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {stage.opportunities.map((item, idx) => (
                        <li key={idx} className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                          <span className="text-emerald-500 text-lg">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Arrow Between Stages */}
              {index < journeyStages.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-8 h-8 text-primary animate-pulse rotate-90" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Tagline */}
      <div className="mt-16 text-center py-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/20">
        <p className="text-xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          "Empowering service providers to connect with clients, deliver excellence, and grow their business."
        </p>
      </div>
    </div>
  );
};

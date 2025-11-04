import { Card } from "@/components/ui/card";
import { Lightbulb, UserPlus, Compass, ClipboardCheck, Handshake, BarChart3, ArrowRight } from "lucide-react";

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
    title: "Awareness",
    icon: <Lightbulb className="w-8 h-8" />,
    gradient: "from-slate-500 via-slate-600 to-slate-700",
    touchpoints: ["Investment Networks", "Industry Reports", "Platform Demo"],
    actions: ["Evaluates deal flow platform", "Reviews startup quality"],
    emotions: ["Analytical", "Strategic", "Cautious"],
    painPoints: ["Deal flow quality", "Due diligence overhead"],
    opportunities: ["Curated startups", "Pre-vetted opportunities"],
  },
  {
    title: "Registration",
    icon: <UserPlus className="w-8 h-8" />,
    gradient: "from-slate-600 via-slate-700 to-slate-800",
    touchpoints: ["Funder Profile", "Investment Criteria", "Verification"],
    actions: ["Creates profile", "Sets criteria"],
    emotions: ["Professional", "Selective", "Thorough"],
    painPoints: ["Time investment", "Platform learning curve"],
    opportunities: ["Quick setup", "Investment thesis templates"],
  },
  {
    title: "Discovery",
    icon: <Compass className="w-8 h-8" />,
    gradient: "from-slate-700 via-blue-600 to-blue-700",
    touchpoints: ["Funding Hub", "Startup Profiles", "Financial Models"],
    actions: ["Browses opportunities", "Reviews financials"],
    emotions: ["Curious", "Evaluative", "Opportunistic"],
    painPoints: ["Information gaps", "Too many options"],
    opportunities: ["Advanced filters", "Credit scores"],
  },
  {
    title: "Evaluation",
    icon: <ClipboardCheck className="w-8 h-8" />,
    gradient: "from-blue-700 via-indigo-600 to-indigo-700",
    touchpoints: ["Due Diligence Tools", "Video Calls", "Document Review"],
    actions: ["Conducts due diligence", "Meets founders"],
    emotions: ["Focused", "Critical", "Engaged"],
    painPoints: ["Incomplete documentation", "Slow responses"],
    opportunities: ["Document vault", "Scheduled meetings"],
  },
  {
    title: "Investment",
    icon: <Handshake className="w-8 h-8" />,
    gradient: "from-indigo-700 via-purple-600 to-purple-700",
    touchpoints: ["Deal Management", "Legal Processing", "Payment Gateway"],
    actions: ["Negotiates terms", "Executes agreements"],
    emotions: ["Decisive", "Committed", "Optimistic"],
    painPoints: ["Legal complexity", "Transaction security"],
    opportunities: ["Legal templates", "Secure payments"],
  },
  {
    title: "Portfolio Management",
    icon: <BarChart3 className="w-8 h-8" />,
    gradient: "from-purple-700 via-violet-600 to-violet-700",
    touchpoints: ["Dashboard", "Performance Reports", "Startup Updates"],
    actions: ["Monitors investments", "Tracks KPIs"],
    emotions: ["Invested", "Supportive", "Results-focused"],
    painPoints: ["Limited visibility", "Reporting inconsistency"],
    opportunities: ["Portfolio dashboard", "Automated reports"],
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

export const FunderJourneyMap = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          💼 Funder Journey Map
        </h1>
        <p className="text-xl text-muted-foreground italic">
          "From Awareness to Portfolio Management"
        </p>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto">
          Empowering funders to discover high-potential startups, conduct efficient due diligence, and manage successful portfolios.
        </p>
      </div>

      {/* Journey Stages - Horizontal Flow */}
      <div className="relative overflow-visible">
        {/* Desktop View - Horizontal */}
        <div className="hidden lg:flex items-start justify-start gap-4 relative pb-4">
          {journeyStages.map((stage, index) => (
            <div key={stage.title} className="flex items-start flex-shrink-0">
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
                    <SectionContent title="❤️ Emotions" items={stage.emotions} color="text-slate-600 dark:text-slate-400" />
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
                    <SectionContent title="❤️ Emotions" items={stage.emotions} color="text-slate-600 dark:text-slate-400" />
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
          "Empowering funders to discover high-potential startups, conduct efficient due diligence, and manage successful portfolios."
        </p>
      </div>
    </div>
  );
};

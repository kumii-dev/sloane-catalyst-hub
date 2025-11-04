import { Card } from "@/components/ui/card";
import { Globe, PenTool, Users, Rocket, Trophy, ArrowRight } from "lucide-react";

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
    icon: <Globe className="w-8 h-8" />,
    gradient: "from-blue-400 via-cyan-400 to-teal-400",
    touchpoints: ["Landing Page", "Social Media", "Referrals"],
    actions: ["Discovers Kumii", "Reviews features"],
    emotions: ["Curious", "Hopeful", "Uncertain"],
    painPoints: ["Lack of funding access", "No business connections"],
    opportunities: ["Clear value proposition", "Success stories"],
  },
  {
    title: "Onboarding",
    icon: <PenTool className="w-8 h-8" />,
    gradient: "from-cyan-400 via-teal-400 to-emerald-400",
    touchpoints: ["Registration", "Profile Setup", "KYC Process"],
    actions: ["Creates account", "Completes profile"],
    emotions: ["Excited", "Engaged", "Slightly overwhelmed"],
    painPoints: ["Complex forms", "Document requirements"],
    opportunities: ["Progressive profiling", "Clear guidance"],
  },
  {
    title: "Engagement",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-teal-400 via-emerald-500 to-green-500",
    touchpoints: ["Dashboard", "Mentorship", "Services Marketplace"],
    actions: ["Books mentor sessions", "Explores services"],
    emotions: ["Motivated", "Supported", "Confident"],
    painPoints: ["Information overload", "Decision paralysis"],
    opportunities: ["Smart matching", "Personalized recommendations"],
  },
  {
    title: "Growth",
    icon: <Rocket className="w-8 h-8" />,
    gradient: "from-emerald-500 via-yellow-400 to-amber-500",
    touchpoints: ["Financial Model", "Credit Score", "Copilot"],
    actions: ["Builds financial models", "Improves credit score"],
    emotions: ["Empowered", "Accomplished", "Ambitious"],
    painPoints: ["Scaling challenges", "Resource limitations"],
    opportunities: ["Advanced tools", "Network expansion"],
  },
  {
    title: "Advocacy",
    icon: <Trophy className="w-8 h-8" />,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    touchpoints: ["Reviews", "Referrals", "Community Events"],
    actions: ["Shares success story", "Refers others"],
    emotions: ["Grateful", "Proud", "Loyal"],
    painPoints: ["Limited time", "Busy schedule"],
    opportunities: ["Rewards program", "Recognition"],
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

export const StartupJourneyMap = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          🌍 Startup / SMME Journey Map
        </h1>
        <p className="text-xl text-muted-foreground italic">
          "From Discovery to Advocacy"
        </p>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto">
          Empowering every entrepreneur to grow, connect, and inspire.
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
                    <SectionContent title="❤️ Emotions" items={stage.emotions} color="text-rose-600 dark:text-rose-400" />
                    <SectionContent title="⚠️ Pain Points" items={stage.painPoints} color="text-amber-600 dark:text-amber-400" />
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
                    <SectionContent title="❤️ Emotions" items={stage.emotions} color="text-rose-600 dark:text-rose-400" />
                    <SectionContent title="⚠️ Pain Points" items={stage.painPoints} color="text-amber-600 dark:text-amber-400" />
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
          "Empowering every entrepreneur to grow, connect, and inspire."
        </p>
      </div>
    </div>
  );
};

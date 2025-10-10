import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Video, Download, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Extract all narration text from the script
  const scriptText = `Every day, thousands of brilliant entrepreneurs across Africa have game-changing ideas. But 70% of startups fail—not because they lack potential, but because they lack access. Access to funding. Access to markets. Access to the right guidance at the right time.

Introducing the all-in-one ecosystem designed specifically for African SMMEs and startups. We've built a platform that doesn't just connect you to opportunities—it prepares you for them, matches you with the right partners, and gives you the tools to succeed.

Let's start with Access to Market—your gateway to growth.

First, our Credit Score Check gives you a standardized assessment of your business readiness. No more guessing where you stand. Get technical, financial, and market readiness scores that funders actually trust.

Need investor-ready documents? Our AI-powered Document Generator creates professional business plans, pitch decks, and financial reports in minutes—not weeks.

The Financial Model Builder lets you create dynamic 3-statement financial models with both IFRS and US GAAP support. Impress investors with professional-grade projections.

And with our Universal Valuation Model, you can value your business using multiple proven methodologies—DCF, comparables, and more. Know your worth before you negotiate.

But here's where it gets revolutionary. Our Smart Matching engine uses AI to connect you with the right suppliers, buyers, and funders based on your profile, industry, stage, and needs.

Browse hundreds of Funding Opportunities—from grants and loans to equity investments and corporate programs. Filter by industry, amount, stage, and apply directly through the platform.

Our Funder Directory features verified banks, impact investors, venture funds, and sponsor programs—all actively looking for businesses like yours.

Success isn't just about tools—it's about people. Connect with experienced mentors who've walked your path. Get guidance on strategy, fundraising, operations, and growth.

Access our comprehensive Resource Library with guides, templates, case studies, and training materials. Learn at your own pace, whenever you need it.

And when you need expert help, our Services Marketplace connects you with vetted legal, accounting, marketing, and technical service providers who understand startups.

The platform works for everyone in the ecosystem. If you're a startup, get the tools and connections you need to grow. Funders, discover and evaluate high-potential businesses efficiently. Mentors, share your expertise and build your legacy. Service providers, reach clients actively building the future.

We're trusted by leading organizations across Africa. Microsoft for Startups, Nedbank, 22 On Sloane, and many others partner with us because they believe in democratizing access to opportunity.

Join thousands of entrepreneurs who are already building their future on our platform. Together, we've facilitated millions in funding connections and countless success stories.

Your journey to growth starts today. Create your free account, complete your profile, and unlock access to tools that used to cost tens of thousands. Get your credit score, build your financial model, and start connecting with funders who want to support businesses like yours.

No hidden fees. No gatekeepers. Just the resources, connections, and support you need to turn your vision into reality.

Because when African entrepreneurs succeed, we all win. Welcome to the future of startup support. Welcome home.`;

  const startNarration = async () => {
    try {
      setIsLoading(true);
      toast.loading("Generating professional narration...");

      const { data, error } = await supabase.functions.invoke('generate-narration', {
        body: { text: scriptText }
      });

      if (error) throw error;

      // Create audio element from response
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => {
        setIsNarrating(true);
        setIsLoading(false);
        toast.dismiss();
        toast.success("Narration started");
      };
      
      audio.onended = () => {
        setIsNarrating(false);
        URL.revokeObjectURL(audioUrl);
        toast.info("Narration completed");
      };
      
      audio.onerror = () => {
        setIsNarrating(false);
        setIsLoading(false);
        toast.dismiss();
        toast.error("Audio playback error");
      };
      
      await audio.play();
    } catch (error: any) {
      console.error('Narration error:', error);
      setIsLoading(false);
      toast.dismiss();
      toast.error(error.message || "Failed to generate narration");
    }
  };

  const pauseNarration = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      toast.info("Narration paused");
    }
  };

  const resumeNarration = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      toast.success("Narration resumed");
    }
  };

  const stopNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsNarrating(false);
      toast.info("Narration stopped");
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup: stop narration when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Video className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Marketing Video Script</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              5-Minute Platform Overview
            </h1>
            <p className="text-lg text-muted-foreground">
              A comprehensive script showcasing the platform's features and benefits
            </p>
          </div>

          {/* Script Content */}
          <Card className="border-2">
            <CardContent className="p-8 space-y-8">
              
              {/* Scene 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 1: Opening Hook
                  </div>
                  <span className="text-sm text-muted-foreground">[0:00 - 0:20]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Dynamic montage of African entrepreneurs working, startups growing, success celebrations]</p>
                  <p>
                    <strong>Narrator:</strong> "Every day, thousands of brilliant entrepreneurs across Africa have game-changing ideas. 
                    But 70% of startups fail—not because they lack potential, but because they lack access. Access to funding. Access to 
                    markets. Access to the right guidance at the right time."
                  </p>
                  <p className="italic text-muted-foreground">[Text on screen: "What if there was a better way?"]</p>
                </div>
              </section>

              {/* Scene 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 2: The Solution
                  </div>
                  <span className="text-sm text-muted-foreground">[0:20 - 0:45]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Platform interface appears, sleek and modern]</p>
                  <p>
                    <strong>Narrator:</strong> "Introducing the all-in-one ecosystem designed specifically for African SMMEs and startups. 
                    We've built a platform that doesn't just connect you to opportunities—it prepares you for them, matches you with the 
                    right partners, and gives you the tools to succeed."
                  </p>
                  <p className="italic text-muted-foreground">[Logo animation with tagline: "Empowering African Innovation"]</p>
                </div>
              </section>

              {/* Scene 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 3: Access To Market
                  </div>
                  <span className="text-sm text-muted-foreground">[0:45 - 1:45]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Access to Market dashboard with features highlighted]</p>
                  <p>
                    <strong>Narrator:</strong> "Let's start with Access to Market—your gateway to growth."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Credit Score interface]</p>
                  <p>
                    "First, our <strong>Credit Score Check</strong> gives you a standardized assessment of your business readiness. 
                    No more guessing where you stand. Get technical, financial, and market readiness scores that funders actually trust."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Document Generator creating a business plan]</p>
                  <p>
                    "Need investor-ready documents? Our AI-powered <strong>Document Generator</strong> creates professional business plans, 
                    pitch decks, and financial reports in minutes—not weeks."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Financial Model Builder with charts and projections]</p>
                  <p>
                    "The <strong>Financial Model Builder</strong> lets you create dynamic 3-statement financial models with both IFRS and 
                    US GAAP support. Impress investors with professional-grade projections."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Valuation Model showing multiple methodologies]</p>
                  <p>
                    "And with our <strong>Universal Valuation Model</strong>, you can value your business using multiple proven methodologies—DCF, 
                    comparables, and more. Know your worth before you negotiate."
                  </p>
                </div>
              </section>

              {/* Scene 4 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 4: Smart Matching & Funding
                  </div>
                  <span className="text-sm text-muted-foreground">[1:45 - 2:30]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: AI matching algorithm connecting startups with funders]</p>
                  <p>
                    <strong>Narrator:</strong> "But here's where it gets revolutionary. Our <strong>Smart Matching</strong> engine uses AI to 
                    connect you with the right suppliers, buyers, and funders based on your profile, industry, stage, and needs."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Funding Opportunities feed with various options]</p>
                  <p>
                    "Browse hundreds of <strong>Funding Opportunities</strong>—from grants and loans to equity investments and corporate programs. 
                    Filter by industry, amount, stage, and apply directly through the platform."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Verified funder profiles]</p>
                  <p>
                    "Our <strong>Funder Directory</strong> features verified banks, impact investors, venture funds, and sponsor programs—all 
                    actively looking for businesses like yours."
                  </p>
                </div>
              </section>

              {/* Scene 5 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 5: Mentorship & Community
                  </div>
                  <span className="text-sm text-muted-foreground">[2:30 - 3:15]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Mentorship platform with profiles and video calls]</p>
                  <p>
                    <strong>Narrator:</strong> "Success isn't just about tools—it's about people. Connect with experienced mentors who've 
                    walked your path. Get guidance on strategy, fundraising, operations, and growth."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Resource library and learning materials]</p>
                  <p>
                    "Access our comprehensive <strong>Resource Library</strong> with guides, templates, case studies, and training materials. 
                    Learn at your own pace, whenever you need it."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Service marketplace with providers]</p>
                  <p>
                    "And when you need expert help, our <strong>Services Marketplace</strong> connects you with vetted legal, accounting, 
                    marketing, and technical service providers who understand startups."
                  </p>
                </div>
              </section>

              {/* Scene 6 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 6: For Everyone
                  </div>
                  <span className="text-sm text-muted-foreground">[3:15 - 3:45]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Different user types: startups, mentors, funders, service providers]</p>
                  <p>
                    <strong>Narrator:</strong> "The platform works for everyone in the ecosystem. If you're a startup, get the tools and 
                    connections you need to grow. Funders, discover and evaluate high-potential businesses efficiently. Mentors, share your 
                    expertise and build your legacy. Service providers, reach clients actively building the future."
                  </p>
                </div>
              </section>

              {/* Scene 7 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 7: Trusted Partners
                  </div>
                  <span className="text-sm text-muted-foreground">[3:45 - 4:10]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Logos of Microsoft, Nedbank, 22 On Sloane, Kumi, etc.]</p>
                  <p>
                    <strong>Narrator:</strong> "We're trusted by leading organizations across Africa. Microsoft for Startups, Nedbank, 
                    22 On Sloane, and many others partner with us because they believe in democratizing access to opportunity."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Statistics and success metrics]</p>
                  <p>
                    "Join thousands of entrepreneurs who are already building their future on our platform. Together, we've facilitated 
                    millions in funding connections and countless success stories."
                  </p>
                </div>
              </section>

              {/* Scene 8 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 8: Call to Action
                  </div>
                  <span className="text-sm text-muted-foreground">[4:10 - 4:45]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Platform interface with "Get Started" button]</p>
                  <p>
                    <strong>Narrator:</strong> "Your journey to growth starts today. Create your free account, complete your profile, 
                    and unlock access to tools that used to cost tens of thousands. Get your credit score, build your financial model, 
                    and start connecting with funders who want to support businesses like yours."
                  </p>
                  <p className="italic text-muted-foreground">[Visual: Happy entrepreneurs using the platform]</p>
                  <p>
                    "No hidden fees. No gatekeepers. Just the resources, connections, and support you need to turn your vision into reality."
                  </p>
                </div>
              </section>

              {/* Scene 9 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded text-sm font-semibold text-primary">
                    SCENE 9: Closing
                  </div>
                  <span className="text-sm text-muted-foreground">[4:45 - 5:00]</span>
                </div>
                <div className="pl-6 space-y-2 text-foreground/90 leading-relaxed">
                  <p className="italic text-muted-foreground">[Visual: Logo with tagline and website URL]</p>
                  <p>
                    <strong>Narrator:</strong> "Because when African entrepreneurs succeed, we all win. Welcome to the future of startup 
                    support. Welcome home."
                  </p>
                  <p className="italic text-muted-foreground">[Text on screen: "Get Started Today" + website URL]</p>
                  <p className="italic text-muted-foreground">[Uplifting music swells]</p>
                </div>
              </section>

              {/* Production Notes */}
              <section className="space-y-3 border-t pt-6">
                <div className="px-3 py-1 bg-secondary rounded text-sm font-semibold inline-block">
                  PRODUCTION NOTES
                </div>
                <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Tone:</strong> Inspirational, professional, empowering</p>
                  <p><strong>Music:</strong> Uplifting African-inspired instrumental, building throughout</p>
                  <p><strong>Visuals:</strong> Mix of platform UI demos, real user testimonials, and dynamic motion graphics</p>
                  <p><strong>Pacing:</strong> ~150-160 words per minute (natural conversational pace)</p>
                  <p><strong>Total Word Count:</strong> ~750 words (approximately 5 minutes)</p>
                  <p><strong>Languages:</strong> Consider versions in English, French, Swahili, Portuguese for pan-African reach</p>
                </div>
              </section>

            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            {!isNarrating ? (
              <Button size="lg" onClick={startNarration} disabled={isLoading}>
                <Play className="w-4 h-4 mr-2" />
                {isLoading ? "Generating..." : "Start Professional Narration"}
              </Button>
            ) : (
              <>
                {audioRef.current?.paused ? (
                  <Button size="lg" onClick={resumeNarration}>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button size="lg" onClick={pauseNarration}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button size="lg" variant="destructive" onClick={stopNarration}>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            <Button size="lg" variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Download Script
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
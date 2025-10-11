import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Video, Download, Play, Pause, Square, Database, Table, Map, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const About = () => {
  const navigate = useNavigate();
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("TTY70JqFvDxeExufZ1za");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const journeyMapsRef = useRef<HTMLDivElement | null>(null);

  // Extract all narration text from the script
  const scriptText = `Every day, thousands of brilliant entrepreneurs across Africa have game-changing ideas. But 70% of startups fail—not because they lack potential, but because they lack access. Access to funding. Access to markets. Access to the right guidance at the right time.

Introducing the all-in-one ecosystem designed specifically for African SMMEs and startups. We've built a platform that doesn't just connect you to opportunities—it prepares you for them, matches you with the right partners, and gives you the tools to succeed.

Let's start with Access to Market—your gateway to growth.

First, our Credit Score Check gives you a standardized assessment of your business readiness powered by Koomee. No more guessing where you stand. Get technical, financial, and market readiness scores that funders actually trust. And if your readiness score is low, don't worry—Koomee is your one-stop platform with comprehensive intervention programs, mentorship, resources, and tools designed to help boost your score and prepare you for funding success.

Need investor-ready documents? Our AI-powered Document Generator creates professional business plans, pitch decks, and financial reports in minutes—not weeks.

The Financial Model Builder lets you create dynamic 3-statement financial models with both IFRS and US GAAP support. Impress investors with professional-grade projections.

And with our Universal Valuation Model, you can value your business using multiple proven methodologies—DCF, comparables, and more. Know your worth before you negotiate.

But here's where it gets revolutionary. Our Smart Matching engine uses AI to connect you with the right suppliers, buyers, and funders based on your profile, industry, stage, and needs.

Browse hundreds of Funding Opportunities—from grants and loans to equity investments and corporate programs. Filter by industry, amount, stage, and apply directly through the platform.

Our Funder Directory features verified banks, impact investors, venture funds, and sponsor programs—all actively looking for businesses like yours.

This is what makes Koomee truly powerful—we're your one-stop platform for SMMEs and Startups. Everything you need to build, grow, and fund your business is right here. No more juggling multiple platforms or services.

Success isn't just about tools—it's about people. Connect with experienced mentors who've walked your path. Get guidance on strategy, fundraising, operations, and growth.

Access our comprehensive Resource Library with guides, templates, case studies, and training materials. Learn at your own pace, whenever you need it.

And when you need expert help, our Services Marketplace connects you with vetted legal, accounting, marketing, and technical service providers who understand startups.

The platform works for everyone in the ecosystem. If you're a startup, get the tools and connections you need to grow. Funders, discover and evaluate high-potential businesses efficiently. Mentors, share your expertise and build your legacy. Service providers, reach clients actively building the future.

We're trusted by leading organizations across Africa. Microsoft for Startups, 22 On Sloane, and many others partner with us because they believe in democratizing access to opportunity.

Join thousands of entrepreneurs who are already building their future on our platform. Together, we've facilitated millions in funding connections and countless success stories.

Your journey to growth starts today. Create your free account, complete your profile, and unlock access to tools that used to cost tens of thousands. Get your credit score, build your financial model, and start connecting with funders who want to support businesses like yours.

No hidden fees. No gatekeepers. Just the resources, connections, and support you need to turn your vision into reality—all in one place.

Because when African entrepreneurs succeed, we all win. Welcome to the future of startup support. Koomee... Building Your Business. Welcome home.`;

  const startNarration = async () => {
    try {
      setIsLoading(true);
      toast.loading("Generating professional narration...");

      // Use fetch directly for binary audio data
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-narration`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ text: scriptText, voiceId: selectedVoice }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate narration');
      }

      // Get audio blob from response
      const audioBlob = await response.blob();
      
      // Convert blob to base64 data URL for persistent storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        localStorage.setItem('narrationAudioUrl', base64Audio);
      };
      reader.readAsDataURL(audioBlob);
      
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(newAudioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => {
        setIsNarrating(true);
        setIsLoading(false);
        toast.dismiss();
        toast.success("Narration started");
      };
      
      audio.onended = () => {
        setIsNarrating(false);
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

  const downloadNarration = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'platform-narration.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading narration");
    }
  };

  const exportJourneyMapsToPDF = async () => {
    if (!journeyMapsRef.current) return;
    
    try {
      toast.loading("Generating PDF...");
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const diagrams = journeyMapsRef.current.querySelectorAll('.journey-diagram');
      
      for (let i = 0; i < diagrams.length; i++) {
        const diagram = diagrams[i] as HTMLElement;
        
        // Capture the diagram as canvas
        const canvas = await html2canvas(diagram, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        // Calculate dimensions to fit A4
        const imgWidth = 190; // A4 width minus margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add new page if not first diagram
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      }
      
      // Save PDF
      pdf.save('mentorship-journey-maps.pdf');
      toast.dismiss();
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.dismiss();
      toast.error("Failed to export PDF");
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup: stop narration and revoke URL when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    // Load mermaid library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.mermaid) {
        // @ts-ignore
        window.mermaid.initialize({ 
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose'
        });
        // @ts-ignore
        window.mermaid.contentLoaded();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              About Platform
            </h1>
            <p className="text-lg text-muted-foreground">
              Platform overview, database structure, and more
            </p>
          </div>

          <Tabs defaultValue="script" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
              <TabsTrigger value="script" className="gap-2">
                <Video className="w-4 h-4" />
                Video Script
              </TabsTrigger>
              <TabsTrigger value="database" className="gap-2">
                <Database className="w-4 h-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="journeys" className="gap-2">
                <Map className="w-4 h-4" />
                Journey Maps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-8 mt-8">

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
                    "First, our <strong>Credit Score Check</strong> gives you a standardized assessment of your business readiness powered by 
                    Koomee. No more guessing where you stand. Get technical, financial, and market readiness scores that funders actually trust. 
                    And if your readiness score is low, don't worry—Koomee is your one-stop platform with comprehensive intervention programs, 
                    mentorship, resources, and tools designed to help boost your score and prepare you for funding success."
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
                  <p className="italic text-muted-foreground">[Visual: Platform features coming together]</p>
                  <p>
                    "This is what makes Koomee truly powerful—we're your one-stop platform for SMMEs and Startups. Everything you need to build, 
                    grow, and fund your business is right here. No more juggling multiple platforms or services."
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
                  <p className="italic text-muted-foreground">[Visual: Logos of Microsoft, 22 On Sloane, Koomee, etc.]</p>
                  <p>
                    <strong>Narrator:</strong> "We're trusted by leading organizations across Africa. Microsoft for Startups, 
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
                    "No hidden fees. No gatekeepers. Just the resources, connections, and support you need to turn your vision into reality—all in one place."
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
                    support. Koomee... Building Your Business. Welcome home."
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

          {/* Voice Selection */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Narration Voice</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a voice" />
                  </SelectTrigger>
                  <SelectContent>
              <SelectItem value="BcpjRWrYhDBHmOnetmBl">South African Accent - Professional & Warm</SelectItem>
              <SelectItem value="fPVZbr0RJBH9KL47pnxU">Alternative Voice - Clear & Engaging</SelectItem>
              <SelectItem value="3yJq5VpFXdeyF5oOBl2e">Natural Voice - Conversational & Friendly</SelectItem>
              <SelectItem value="9Dbo4hEvXQ5l7MXGZFQA">Voice 4 - Dynamic & Energetic</SelectItem>
              <SelectItem value="qVpGLzi5EhjW3WGVhOa9">Voice 5 - Smooth & Professional</SelectItem>
              <SelectItem value="nJvj5shg2xu1GKGxqfkE">Voice 6 - Confident & Authoritative</SelectItem>
              <SelectItem value="RAVWJW17BPoSIf05iXxf">Voice 7 - Friendly & Approachable</SelectItem>
              <SelectItem value="atf1ppeJGCYFBlCLZ26e">Voice 8 - Clear & Articulate</SelectItem>
              <SelectItem value="TTY70JqFvDxeExufZ1za">Voice 9 - Warm & Inviting</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the voice that best represents your brand
                </p>
              </div>
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
            {audioUrl && (
              <>
                <Button size="lg" variant="outline" onClick={downloadNarration}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Narration
                </Button>
                <Button size="lg" onClick={() => navigate('/video-creator')}>
                  <Video className="w-4 h-4 mr-2" />
                  Create Video
                </Button>
              </>
            )}
            <Button size="lg" variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Download Script
            </Button>
          </div>
            </TabsContent>

            <TabsContent value="database" className="space-y-8 mt-8">
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-8 h-8 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold">Database Structure</h2>
                      <p className="text-muted-foreground">Complete overview of all tables and relationships</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">38</div>
                      <div className="text-sm text-muted-foreground">Total Tables</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">8</div>
                      <div className="text-sm text-muted-foreground">Custom Functions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">3</div>
                      <div className="text-sm text-muted-foreground">Storage Buckets</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Table className="w-5 h-5 text-primary" />
                        Database Tables
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { name: "cohort_funded_listings", desc: "Links cohorts to funded listings" },
                          { name: "cohort_memberships", desc: "Tracks user memberships in cohorts" },
                          { name: "cohorts", desc: "Sponsored cohort programs" },
                          { name: "credit_assessments", desc: "Business credit score assessments" },
                          { name: "credits_transactions", desc: "Platform credits transaction history" },
                          { name: "credits_wallet", desc: "User credit balance management" },
                          { name: "event_registrations", desc: "User event registrations" },
                          { name: "events", desc: "Platform events and webinars" },
                          { name: "funders", desc: "Funder organization profiles" },
                          { name: "funding_applications", desc: "Funding opportunity applications" },
                          { name: "funding_matches", desc: "AI-matched funding opportunities" },
                          { name: "funding_opportunities", desc: "Available funding opportunities" },
                          { name: "listing_categories", desc: "Categories for marketplace listings" },
                          { name: "listing_reviews", desc: "User reviews for listings" },
                          { name: "listings", desc: "Marketplace listings (services/products)" },
                          { name: "mentor_availability", desc: "Mentor weekly availability schedule" },
                          { name: "mentor_categories", desc: "Links mentors to expertise areas" },
                          { name: "mentor_date_overrides", desc: "Specific date availability overrides" },
                          { name: "mentoring_categories", desc: "Mentorship expertise categories" },
                          { name: "mentoring_sessions", desc: "Scheduled mentorship sessions" },
                          { name: "mentors", desc: "Mentor profiles and availability" },
                          { name: "messages", desc: "User notifications and messages" },
                          { name: "profiles", desc: "User profile information" },
                          { name: "progressive_profile_data", desc: "Progressive profiling data" },
                          { name: "resource_bookmarks", desc: "User bookmarked resources" },
                          { name: "resource_categories", desc: "Categories for learning resources" },
                          { name: "resource_progress", desc: "User progress on resources" },
                          { name: "resource_ratings", desc: "User ratings for resources" },
                          { name: "resources", desc: "Learning resources and materials" },
                          { name: "score_sharing", desc: "Credit score sharing with funders" },
                          { name: "scoring_criteria", desc: "Assessment scoring criteria" },
                          { name: "service_categories", desc: "Service provider categories" },
                          { name: "service_providers", desc: "Service provider profiles" },
                          { name: "service_reviews", desc: "Reviews for services" },
                          { name: "service_subscriptions", desc: "User service subscriptions" },
                          { name: "services", desc: "Professional services offered" },
                          { name: "startup_profiles", desc: "Startup business profiles" },
                          { name: "user_roles", desc: "User role assignments (admin, etc.)" },
                        ].map((table) => (
                          <div key={table.name} className="p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors">
                            <div className="font-mono text-sm font-semibold text-primary">{table.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{table.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Key Table Relationships</h3>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">User & Authentication:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>profiles → stores user information</li>
                            <li>user_roles → manages admin/moderator/user roles</li>
                            <li>progressive_profile_data → tracks onboarding progress</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Funding Ecosystem:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>funders → funding organizations</li>
                            <li>funding_opportunities → available funding</li>
                            <li>funding_applications → application submissions</li>
                            <li>funding_matches → AI-generated matches</li>
                            <li>credit_assessments → business readiness scores</li>
                            <li>score_sharing → share scores with funders</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Mentorship:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>mentors → mentor profiles</li>
                            <li>mentoring_categories → expertise areas</li>
                            <li>mentor_categories → links mentors to categories</li>
                            <li>mentor_availability → weekly schedule (day/time)</li>
                            <li>mentor_date_overrides → specific date exceptions</li>
                            <li>mentoring_sessions → scheduled sessions with booking flow</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Marketplace:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>listings → services/products for sale</li>
                            <li>listing_categories → marketplace categories</li>
                            <li>listing_reviews → customer reviews</li>
                            <li>service_subscriptions → active subscriptions</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Services:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>service_providers → professional service providers</li>
                            <li>services → services offered</li>
                            <li>service_categories → service types</li>
                            <li>service_reviews → service ratings</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Resources & Learning:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>resources → learning materials</li>
                            <li>resource_categories → resource organization</li>
                            <li>resource_progress → user learning progress</li>
                            <li>resource_bookmarks → saved resources</li>
                            <li>resource_ratings → resource reviews</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Cohorts & Programs:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>cohorts → sponsored programs</li>
                            <li>cohort_memberships → member enrollment</li>
                            <li>cohort_funded_listings → cohort-exclusive listings</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Credits System:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>credits_wallet → user credit balances</li>
                            <li>credits_transactions → credit transaction log</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Events:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>events → platform events</li>
                            <li>event_registrations → user registrations</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-card border rounded-lg">
                          <strong className="text-primary">Messaging & Notifications:</strong>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-2">
                            <li>messages → user notifications system</li>
                            <li>Real-time updates via Supabase subscriptions</li>
                            <li>Session confirmations, updates, and reminders</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Storage Buckets</h3>
                      <div className="space-y-2">
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-sm font-semibold text-primary">assessment-documents</div>
                            <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded">Private</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Stores credit assessment documents</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-sm font-semibold text-primary">listing-images</div>
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded">Public</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Marketplace listing images and media</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-sm font-semibold text-primary">profile-pictures</div>
                            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded">Public</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">User profile pictures and avatars</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Database Functions</h3>
                      <div className="space-y-2 text-sm">
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="font-mono text-sm font-semibold text-primary">handle_new_user()</div>
                          <div className="text-xs text-muted-foreground mt-1">Automatically creates profile when new user signs up</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="font-mono text-sm font-semibold text-primary">has_role(user_id, role)</div>
                          <div className="text-xs text-muted-foreground mt-1">Checks if user has a specific role (admin, moderator, user)</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="font-mono text-sm font-semibold text-primary">is_assessment_owner(assessment_id, user_id)</div>
                          <div className="text-xs text-muted-foreground mt-1">Validates assessment ownership for RLS policies</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="font-mono text-sm font-semibold text-primary">has_funder_assessment_access(assessment_id, user_id)</div>
                          <div className="text-xs text-muted-foreground mt-1">Checks if funder has access to shared credit scores</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="font-mono text-sm font-semibold text-primary">deduct_credits(user_id, amount, description, reference_id)</div>
                          <div className="text-xs text-muted-foreground mt-1">Safely deducts credits from user wallet with transaction logging</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="font-mono text-sm font-semibold text-primary">add_credits(user_id, amount, description, reference_id)</div>
                          <div className="text-xs text-muted-foreground mt-1">Adds credits to user wallet with transaction logging</div>
                        </div>
                        <div className="p-3 bg-card border rounded-lg">
                          <div className="font-mono text-sm font-semibold text-primary">update_updated_at_column()</div>
                          <div className="text-xs text-muted-foreground mt-1">Automatically updates updated_at timestamp on row changes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="journeys" className="space-y-8 mt-8">
              <div className="flex justify-end mb-4">
                <Button onClick={exportJourneyMapsToPDF} size="lg" className="gap-2">
                  <FileDown className="w-4 h-4" />
                  Export All to PDF
                </Button>
              </div>

              <div ref={journeyMapsRef} className="space-y-8">
                {/* Journey 1 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">1. Mentee Booking Journey</h3>
                    <p className="text-muted-foreground mb-6">Complete flow from discovering mentors to confirmed booking</p>
                    <pre className="mermaid bg-background p-4 rounded-lg overflow-auto">
{`graph TD
    A[Browse Mentors] --> B[View Mentor Profile]
    B --> C[Click Book Session]
    C --> D[Select Date from Calendar]
    D --> E{Date Available?}
    E -->|Yes| F[Select Time Slot]
    E -->|No| D
    F --> G{Slot Available?}
    G -->|Yes| H[Enter Session Details]
    G -->|No| F
    H --> I[Choose Payment Method]
    I --> J{Payment Type?}
    J -->|Card| K[Enter Card Details]
    J -->|Credits| L[Check Credit Balance]
    J -->|Sponsored| M[Verify Cohort Membership]
    K --> N[Confirm Booking]
    L --> O{Sufficient Credits?}
    O -->|Yes| N
    O -->|No| P[Show Error]
    M --> Q{Is Member?}
    Q -->|Yes| N
    Q -->|No| P
    N --> R[Create Session Record]
    R --> S[Deduct Credits if applicable]
    S --> T[Show Success]
    T --> U[Navigate to Dashboard]
    U --> V[View Booked Sessions]`}
                    </pre>
                  </CardContent>
                </Card>

                {/* Journey 2 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">2. Mentor Session Management Journey</h3>
                    <p className="text-muted-foreground mb-6">How mentors manage incoming session requests</p>
                    <pre className="mermaid bg-background p-4 rounded-lg overflow-auto">
{`graph TD
    A[Mentor Dashboard] --> B[View Pending Sessions]
    B --> C{Session Action}
    C -->|Confirm| D[Update Status to Confirmed]
    C -->|Decline| E[Update Status to Declined]
    C -->|View Details| F[See Session Info]
    D --> G[Create Notification for Mentee]
    E --> H[Create Notification for Mentee]
    G --> I[Real-time Notification Sent]
    H --> I
    I --> J[Mentee Receives Bell Notification]
    F --> K[View Mentee Profile]
    K --> L{Need to Update?}
    L -->|Yes| M[Manage Availability]
    L -->|No| B`}
                    </pre>
                  </CardContent>
                </Card>

                {/* Journey 3 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">3. Mentor Availability Management Journey</h3>
                    <p className="text-muted-foreground mb-6">Setting up weekly schedules and date-specific overrides</p>
                    <pre className="mermaid bg-background p-4 rounded-lg overflow-auto">
{`graph TD
    A[Mentor Availability Page] --> B{Choose Tab}
    B -->|Weekly Schedule| C[View Days of Week]
    B -->|Date Overrides| D[View Calendar]
    C --> E[Toggle Day Active/Inactive]
    E --> F[Set Start/End Time]
    F --> G[Save Weekly Schedule]
    G --> H[Delete Old Availability]
    H --> I[Insert New Schedule]
    I --> J[Show Success Toast]
    D --> K[Select Specific Date]
    K --> L{Override Type}
    L -->|Available| M[Set Custom Times]
    L -->|Unavailable| N[Mark as Blocked]
    M --> O[Save Date Override]
    N --> O
    O --> P[Update/Insert Override]
    P --> J`}
                    </pre>
                  </CardContent>
                </Card>

                {/* Journey 4 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">4. Real-time Notification System Flow</h3>
                    <p className="text-muted-foreground mb-6">How notifications are delivered in real-time via Supabase</p>
                    <pre className="mermaid bg-background p-4 rounded-lg overflow-auto">
{`sequenceDiagram
    participant M as Mentor
    participant DB as Database
    participant RT as Realtime Channel
    participant N as NotificationBell
    participant ME as Mentee
    
    M->>DB: Confirm/Decline Session
    DB->>DB: Insert into messages table
    DB->>RT: Broadcast postgres_changes
    RT->>N: Real-time update event
    N->>N: Update unread count
    N->>ME: Show toast notification
    ME->>N: Click bell icon
    N->>N: Show notification dropdown
    ME->>N: Click notification
    N->>DB: Mark as read
    N->>ME: Navigate to dashboard`}
                    </pre>
                  </CardContent>
                </Card>

                {/* Journey 5 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">5. Complete System Architecture</h3>
                    <p className="text-muted-foreground mb-6">How all mentorship components connect together</p>
                    <pre className="mermaid bg-background p-4 rounded-lg overflow-auto">
{`graph TB
    subgraph Frontend
        A[Mentorship Page]
        B[Find Mentor]
        C[Mentor Profile]
        D[Booking Dialog]
        E[Mentee Dashboard]
        F[Mentor Dashboard]
        G[Availability Manager]
        H[Notification Bell]
    end
    
    subgraph Database
        I[(mentors)]
        J[(mentoring_sessions)]
        K[(mentor_availability)]
        L[(mentor_date_overrides)]
        M[(messages)]
        N[(credits_wallet)]
    end
    
    subgraph Functions
        O[deduct_credits]
        P[Realtime Subscriptions]
    end
    
    A --> B
    B --> C
    C --> D
    D --> J
    D --> O
    O --> N
    J --> E
    J --> F
    F --> M
    M --> P
    P --> H
    H --> E
    G --> K
    G --> L
    K --> D
    L --> D
    I --> C`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import Footer from "@/components/Footer";
import { Video, Download, Play, Pause, Square, Database, Table, Map, FileDown, FileCode, Presentation, TrendingUp, Users, Target, Shield, Zap, Rocket, FileText, GraduationCap, MapPin, CreditCard, Building2, UserPlus, Trash2, Mail, Layers, ExternalLink } from "lucide-react";
import { CurrencyIcon } from "@/components/ui/currency-icon";
import { StartupJourneyMap } from "@/components/StartupJourneyMap";
import { MentorJourneyMap } from "@/components/MentorJourneyMap";
import { ServiceProviderJourneyMap } from "@/components/ServiceProviderJourneyMap";
import { FunderJourneyMap } from "@/components/FunderJourneyMap";
import FeaturesMappingMatrix from "@/components/FeaturesMappingMatrix";
import { BusinessCard } from "@/components/BusinessCard";
import { KumiiProfile } from "@/components/KumiiProfile";
import { MafikaProfile } from "@/components/MafikaProfile";
import { RACIMatrix } from "@/components/RACIMatrix";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateTestScriptsPDF } from "@/utils/testScriptsPdfGenerator";
import { generateDatabaseDocumentationPDF } from "@/utils/databaseDocumentationPdfGenerator";
import { generateKumiiPresentation } from "@/utils/kumiiPresentationGenerator";
import { generateJourneyMapsPDF } from "@/utils/journeyMapsPdfGenerator";
import { generateJourneyMapsPowerPoint } from "@/utils/journeyMapsPowerPointGenerator";
import { generateGovernancePDF } from "@/utils/governancePdfGenerator";
import { generateAuditLoggingPDF } from "@/utils/auditLoggingPdfGenerator";
import { generateDisasterRecoveryPDF } from "@/utils/disasterRecoveryPdfGenerator";
import { generateVendorRiskPDF } from "@/utils/vendorRiskPdfGenerator";
import { generateSecurityAwarenessPDF } from "@/utils/securityAwarenessPdfGenerator";
import { generateFeaturesDocumentationPDF } from "@/utils/featuresDocumentationPdfGenerator";
import { generateArchitectureDocumentPDF } from "@/utils/architectureDocumentPdfGenerator";
import { generateMACHPrinciplesPDF } from "@/utils/machPrinciplesPdfGenerator";
import { generateKumiiProfilePDF } from "@/utils/kumiiProfilePdfGenerator";
import { generateMafikaProfileWord } from "@/utils/mafikaProfileWordGenerator";
import { generatePhase1ResponsePresentation } from "@/utils/phase1ResponsePresentationGenerator";
import { useAuth } from "@/hooks/useAuth";

const SystemDocumentation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("TTY70JqFvDxeExufZ1za");
  const [devMode, setDevMode] = useState(false);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const journeyMapsRef = useRef<HTMLDivElement | null>(null);

  const hasFullAccess = user?.email && authorizedEmails.some(email => email.toLowerCase() === user.email.toLowerCase());

  // Load authorized emails from localStorage on mount
  useEffect(() => {
    // Default emails (always in lowercase) - these are always included
    const defaultEmails = ['nkambumw@gmail.com', 'nkambumw@protonmail.com', 'chris.22onsloane@gmail.com', '22onsloanedigitalteam@gmail.com'];
    
    const storedEmails = localStorage.getItem('authorizedEmails');
    let additionalEmails: string[] = [];
    
    if (storedEmails) {
      try {
        const parsed = JSON.parse(storedEmails);
        // Get additional emails that aren't in defaults
        additionalEmails = parsed.filter((email: string) => 
          !defaultEmails.includes(email.toLowerCase())
        ).map((email: string) => email.toLowerCase());
      } catch (error) {
        console.error('Error parsing stored emails:', error);
      }
    }
    
    // Always combine default emails with additional ones
    const allEmails = [...defaultEmails, ...additionalEmails];
    setAuthorizedEmails(allEmails);
    localStorage.setItem('authorizedEmails', JSON.stringify(allEmails));
    setIsLoadingEmails(false);
  }, []);

  const addEmail = () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (authorizedEmails.includes(newEmail.toLowerCase())) {
      toast.error("Email already exists in the list");
      return;
    }

    const updatedEmails = [...authorizedEmails, newEmail.toLowerCase()];
    setAuthorizedEmails(updatedEmails);
    localStorage.setItem('authorizedEmails', JSON.stringify(updatedEmails));
    setNewEmail("");
    toast.success("Email added successfully");
  };

  const deleteEmail = (emailToDelete: string) => {
    const updatedEmails = authorizedEmails.filter(email => email !== emailToDelete);
    setAuthorizedEmails(updatedEmails);
    localStorage.setItem('authorizedEmails', JSON.stringify(updatedEmails));
    toast.success("Email removed successfully");
  };

  // Extract all narration text from the script
  const scriptText = `Every day, thousands of brilliant entrepreneurs across Africa have game-changing ideas. But 70% of startups fail—not because they lack potential, but because they lack access. Access to funding. Access to markets. Access to the right guidance at the right time.

Introducing the all-in-one ecosystem designed specifically for African SMMEs and startups. We've built a platform that doesn't just connect you to opportunities—it prepares you for them, matches you with the right partners, and gives you the tools to succeed.

Let's start with Access to Market—your gateway to growth.

First, our Credit Score Check gives you a standardized assessment of your business readiness powered by Kumii. No more guessing where you stand. Get technical, financial, and market readiness scores that funders actually trust. And if your readiness score is low, don't worry—Kumii is your one-stop platform with comprehensive intervention programs, mentorship, resources, and tools designed to help boost your score and prepare you for funding success.

Need investor-ready documents? Our AI-powered Document Generator creates professional business plans, pitch decks, and financial reports in minutes—not weeks.

The Financial Model Builder lets you create dynamic 3-statement financial models with both IFRS and US GAAP support. Impress investors with professional-grade projections.

And with our Universal Valuation Model, you can value your business using multiple proven methodologies—DCF, comparables, and more. Know your worth before you negotiate.

But here's where it gets revolutionary. Our Smart Matching engine uses AI to connect you with the right suppliers, buyers, and funders based on your profile, industry, stage, and needs.

Browse hundreds of Funding Opportunities—from grants and loans to equity investments and corporate programs. Filter by industry, amount, stage, and apply directly through the platform.

Our Funder Directory features verified banks, impact investors, venture funds, and sponsor programs—all actively looking for businesses like yours.

This is what makes Kumii truly powerful—we're your one-stop platform for SMMEs and Startups. Everything you need to build, grow, and fund your business is right here. No more juggling multiple platforms or services.

Success isn't just about tools—it's about people. Connect with experienced mentors who've walked your path. Get guidance on strategy, fundraising, operations, and growth.

Access our comprehensive Resource Library with guides, templates, case studies, and training materials. Learn at your own pace, whenever you need it.

And when you need expert help, our Services Marketplace connects you with vetted legal, accounting, marketing, and technical service providers who understand startups.

The platform works for everyone in the ecosystem. If you're a startup, get the tools and connections you need to grow. Funders, discover and evaluate high-potential businesses efficiently. Mentors, share your expertise and build your legacy. Service providers, reach clients actively building the future.

We're trusted by leading organizations across Africa. Microsoft for Startups, Kumii Innovation Hub, and many others partner with us because they believe in democratizing access to opportunity.

Join thousands of entrepreneurs who are already building their future on our platform. Together, we've facilitated millions in funding connections and countless success stories.

Your journey to growth starts today. Create your free account, complete your profile, and unlock access to tools that used to cost tens of thousands. Get your credit score, build your financial model, and start connecting with funders who want to support businesses like yours.

No hidden fees. No gatekeepers. Just the resources, connections, and support you need to turn your vision into reality—all in one place.

Because when African entrepreneurs succeed, we all win. Welcome to the future of startup support. Kumii... Building Your Business. Welcome home.`;

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

  const downloadTestScriptsPDF = () => {
    try {
      toast.loading("Generating test scripts PDF...");
      generateTestScriptsPDF();
      toast.dismiss();
      toast.success("Test scripts PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const downloadDatabaseDocumentation = () => {
    try {
      toast.loading("Generating database documentation PDF...");
      generateDatabaseDocumentationPDF();
      toast.dismiss();
      toast.success("Database documentation PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const downloadKumiiPresentation = () => {
    try {
      toast.loading("Generating PowerPoint presentation...");
      generateKumiiPresentation();
      toast.dismiss();
      toast.success("Kumii presentation downloaded!");
    } catch (error) {
      console.error('PowerPoint generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate presentation");
    }
  };

  const downloadPhase1ResponsePresentation = () => {
    try {
      toast.loading("Generating Phase 1 Response PowerPoint...");
      generatePhase1ResponsePresentation();
      toast.dismiss();
      toast.success("Phase 1 Response Presentation Downloaded!");
    } catch (error) {
      console.error('Error generating Phase 1 response:', error);
      toast.error("Failed to generate Phase 1 response presentation");
    }
  };

  const downloadJourneyMaps = () => {
    try {
      toast.loading("Generating Journey Maps PDF...");
      generateJourneyMapsPDF();
      toast.dismiss();
      toast.success("Journey Maps PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Journey Maps");
    }
  };

  const downloadJourneyMapsPPT = () => {
    try {
      toast.loading("Generating Journey Maps PowerPoint...");
      generateJourneyMapsPowerPoint();
      toast.dismiss();
      toast.success("Journey Maps PowerPoint downloaded!");
    } catch (error) {
      console.error('PowerPoint generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Journey Maps PowerPoint");
    }
  };

  const downloadGovernancePDF = () => {
    try {
      toast.loading("Generating ISO 27001 Governance PDF...");
      generateGovernancePDF();
      toast.dismiss();
      toast.success("ISO 27001 Governance PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Governance PDF");
    }
  };

  const downloadAuditLoggingPDF = () => {
    try {
      toast.loading("Generating Audit & Logging Strategy PDF...");
      generateAuditLoggingPDF();
      toast.dismiss();
      toast.success("Audit & Logging Strategy PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Audit Logging PDF");
    }
  };

  const downloadDisasterRecoveryPDF = () => {
    try {
      toast.loading("Generating Disaster Recovery Plan PDF...");
      generateDisasterRecoveryPDF();
      toast.dismiss();
      toast.success("Disaster Recovery Plan PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Disaster Recovery PDF");
    }
  };

  const downloadVendorRiskPDF = () => {
    try {
      toast.loading("Generating Vendor Risk Register PDF...");
      generateVendorRiskPDF();
      toast.dismiss();
      toast.success("Vendor Risk Register PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Vendor Risk PDF");
    }
  };

  const downloadSecurityAwarenessPDF = () => {
    try {
      toast.loading("Generating Security Awareness Training PDF...");
      generateSecurityAwarenessPDF();
      toast.dismiss();
      toast.success("Security Awareness Training PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Security Awareness PDF");
    }
  };

  const downloadFeaturesDocumentationPDF = () => {
    try {
      toast.loading("Generating Features Documentation PDF...");
      generateFeaturesDocumentationPDF();
      toast.dismiss();
      toast.success("Features Documentation PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Features Documentation PDF");
    }
  };

  const downloadArchitectureDocumentPDF = () => {
    try {
      toast.loading("Generating Architecture Document PDF...");
      generateArchitectureDocumentPDF();
      toast.dismiss();
      toast.success("Architecture Document PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Architecture Document PDF");
    }
  };

  const downloadMACHPrinciplesPDF = () => {
    try {
      toast.loading("Generating MACH Principles PDF...");
      generateMACHPrinciplesPDF();
      toast.dismiss();
      toast.success("MACH Principles PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate MACH Principles PDF");
    }
  };

  const downloadKumiiProfilePDF = async () => {
    try {
      toast.loading("Generating Kumii Profile PDF...");
      const pdf = await generateKumiiProfilePDF();
      pdf.save("Kumii_Profile.pdf");
      toast.dismiss();
      toast.success("Kumii Profile PDF downloaded!");
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error("Failed to generate Kumii Profile PDF");
    }
  };

  // Check for dev mode on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const devParam = urlParams.get('dev');
    const storedDevMode = localStorage.getItem('devMode') === 'true';
    
    if (devParam === 'true' || storedDevMode) {
      setDevMode(true);
      localStorage.setItem('devMode', 'true');
    }

    // Keyboard shortcut: Ctrl+Shift+D to toggle dev mode
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDevMode(prev => {
          const newValue = !prev;
          localStorage.setItem('devMode', String(newValue));
          toast.success(newValue ? 'Dev mode enabled' : 'Dev mode disabled');
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
    <Layout showSidebar={true}>
      <div className="flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              System Documentation
            </h1>
            <p className="text-lg text-muted-foreground">
              Platform overview, database structure, and technical documentation
            </p>
          </div>

          {/* Application Portfolio Card - Always visible */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-primary text-primary-foreground rounded-lg">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Application Portfolio</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete overview of all 25 integrated systems with detailed functionalities and features
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/application-portfolio')} size="lg">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Organization Structure Card - Always visible */}
          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-background">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-accent text-accent-foreground rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Organization Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      ISO 27001 compliant organogram with 8-person team structure, roles, and governance committees
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/organization-structure')} size="lg" variant="outline">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Organogram
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoadingEmails ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : !hasFullAccess ? (
            <Card>
              <CardContent className="p-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                <p className="text-muted-foreground">
                  This section is only available to authorized administrators.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="presentation" className="w-full">
              <TabsList className={`grid w-full ${devMode ? 'grid-cols-14' : 'grid-cols-12'} max-w-6xl mx-auto`}>
                <TabsTrigger value="presentation" className="gap-2">
                  <Presentation className="w-4 h-4" />
                  Presentation
                </TabsTrigger>
                <TabsTrigger value="kumii-profile" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Kumii Profile
                </TabsTrigger>
                <TabsTrigger value="mafika-profile" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Mafika Profile
                </TabsTrigger>
                <TabsTrigger value="business-card" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Business Card
                </TabsTrigger>
                <TabsTrigger value="script" className="gap-2">
                  <Video className="w-4 h-4" />
                  Video Script
                </TabsTrigger>
                <TabsTrigger value="startup-journey" className="gap-2">
                  <MapPin className="w-4 h-4" />
                  Startup Journey
                </TabsTrigger>
                <TabsTrigger value="mentor-journey" className="gap-2">
                  <MapPin className="w-4 h-4" />
                  Mentor Journey 1
                </TabsTrigger>
                <TabsTrigger value="mentor-journey-2" className="gap-2">
                  <MapPin className="w-4 h-4" />
                  Provider Journey
                </TabsTrigger>
                <TabsTrigger value="mentor-journey-3" className="gap-2">
                  <MapPin className="w-4 h-4" />
                  Funder Journey
                </TabsTrigger>
                <TabsTrigger value="features-matrix" className="gap-2">
                  <Table className="w-4 h-4" />
                  Features Matrix
                </TabsTrigger>
                <TabsTrigger value="raci" className="gap-2">
                  <Users className="w-4 h-4" />
                  RACI
                </TabsTrigger>
                <TabsTrigger value="access" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Access
                </TabsTrigger>
                <TabsTrigger value="database" className="gap-2">
                  <Database className="w-4 h-4" />
                  Database
                </TabsTrigger>
                {devMode && (
                  <>
                    <TabsTrigger value="journeys" className="gap-2">
                      <Map className="w-4 h-4" />
                      Journey Maps
                    </TabsTrigger>
                    <TabsTrigger value="testing" className="gap-2">
                      <FileCode className="w-4 h-4" />
                      Load Testing
                    </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Stakeholder Presentation Tab */}
            <TabsContent value="presentation" className="space-y-8 mt-8">
              <div className="space-y-12">
                
                {/* Download Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    onClick={downloadPhase1ResponsePresentation} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
                  >
                    <FileDown className="w-5 h-5" />
                    Download Phase 1 Response & Roadmap
                  </Button>
                  <Button 
                    onClick={downloadKumiiPresentation} 
                    variant="default" 
                    size="lg"
                    className="gap-2"
                  >
                    <Presentation className="w-5 h-5" />
                    Download PowerPoint Presentation
                  </Button>
                  <Button 
                    onClick={downloadGovernancePDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <Shield className="w-5 h-5" />
                    Download ISO 27001 Governance PDF
                  </Button>
                  <Button 
                    onClick={downloadAuditLoggingPDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <FileText className="w-5 h-5" />
                    Download Audit & Logging Strategy PDF
                  </Button>
                  <Button 
                    onClick={downloadDisasterRecoveryPDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <Shield className="w-5 h-5" />
                    Download Disaster Recovery Plan PDF
                  </Button>
                  <Button 
                    onClick={downloadVendorRiskPDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <Users className="w-5 h-5" />
                    Download Vendor Risk Register PDF
                  </Button>
                  <Button 
                    onClick={downloadSecurityAwarenessPDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-primary/90 hover:bg-primary"
                  >
                    <GraduationCap className="w-5 h-5" />
                    Download Security Awareness Training PDF
                  </Button>
                  <Button 
                    onClick={downloadFeaturesDocumentationPDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <FileDown className="w-5 h-5" />
                    Download Features Documentation PDF
                  </Button>
                  <Button 
                    onClick={downloadArchitectureDocumentPDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <FileText className="w-5 h-5" />
                    Download Enterprise Architecture Document
                  </Button>
                  <Button 
                    onClick={downloadMACHPrinciplesPDF} 
                    variant="default" 
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <Rocket className="w-5 h-5" />
                    Download MACH Principles Document
                  </Button>
                  <Button
                    onClick={downloadJourneyMaps} 
                    variant="outline" 
                    size="lg"
                    className="gap-2"
                  >
                    <Map className="w-5 h-5" />
                    Download Journey Maps PDF
                  </Button>
                  <Button 
                    onClick={downloadJourneyMapsPPT} 
                    variant="outline" 
                    size="lg"
                    className="gap-2"
                  >
                    <Presentation className="w-5 h-5" />
                    Download Journey Maps PowerPoint
                  </Button>
                </div>

                {/* Executive Summary */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary rounded-lg">
                        <Target className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Executive Summary</h2>
                    </div>
                    <div className="space-y-6 text-foreground/90 leading-relaxed">
                      <p className="text-lg">
                        <strong className="text-primary">Kumii Platform</strong> is a comprehensive digital ecosystem designed to address the critical challenges facing African SMMEs and startups. By combining AI-powered tools, marketplace functionality, mentorship programs, and funding access, we've created a one-stop platform that increases startup success rates by providing the resources, connections, and support entrepreneurs need at every stage of their journey.
                      </p>
                      <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-background/60 backdrop-blur p-6 rounded-lg border border-primary/10">
                          <div className="text-4xl font-bold text-primary mb-2">70%</div>
                          <p className="text-sm text-muted-foreground">Startup Failure Rate We're Reducing</p>
                        </div>
                        <div className="bg-background/60 backdrop-blur p-6 rounded-lg border border-primary/10">
                          <div className="text-4xl font-bold text-primary mb-2">4</div>
                          <p className="text-sm text-muted-foreground">User Types Served (Startups, Funders, Mentors, Providers)</p>
                        </div>
                        <div className="bg-background/60 backdrop-blur p-6 rounded-lg border border-primary/10">
                          <div className="text-4xl font-bold text-primary mb-2">All-In-One</div>
                          <p className="text-sm text-muted-foreground">Ecosystem Approach</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Opportunity */}
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Market Opportunity</h2>
                    </div>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-primary">The Problem</h3>
                          <ul className="space-y-3 text-foreground/90">
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span><strong>70% of startups fail</strong> within the first 5 years, primarily due to lack of access to funding, markets, and mentorship</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span><strong>Information asymmetry</strong> between funders and entrepreneurs creates friction in capital allocation</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span><strong>Fragmented services</strong> force entrepreneurs to juggle multiple platforms and providers</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span><strong>Limited investor-readiness</strong> prevents promising startups from accessing capital</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span><strong>High cost of professional services</strong> (legal, accounting, consulting) blocks early-stage companies</span>
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-primary">The Solution</h3>
                          <ul className="space-y-3 text-foreground/90">
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">✓</span>
                              <span><strong>Standardized credit scoring</strong> provides objective business readiness assessment</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">✓</span>
                              <span><strong>AI-powered tools</strong> democratize access to expensive professional services</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">✓</span>
                              <span><strong>Smart matching algorithms</strong> connect the right startups with the right funders</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">✓</span>
                              <span><strong>Integrated marketplace</strong> provides one-stop access to all necessary services</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-primary mt-1">✓</span>
                              <span><strong>Structured mentorship</strong> provides guidance at critical decision points</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-6">
                        <h4 className="font-semibold text-lg text-primary mb-3">Market Size & Potential</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-foreground/90">
                          <div>
                            <div className="font-bold text-2xl text-primary mb-1">44M</div>
                            <p>SMEs in Sub-Saharan Africa</p>
                          </div>
                          <div>
                            <div className="font-bold text-2xl text-primary mb-1">R331B</div>
                            <p>SMME Financing Gap in Africa</p>
                          </div>
                          <div>
                            <div className="font-bold text-2xl text-primary mb-1">Fast Growing</div>
                            <p>Startup Ecosystem Across Continent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Features & Capabilities */}
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Platform Features & Capabilities</h2>
                    </div>
                    <div className="space-y-8">
                      
                      {/* Access to Market */}
                      <div className="border-l-4 border-primary pl-6">
                        <h3 className="text-2xl font-bold text-primary mb-4">1. Access to Market</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">🎯 Credit Score Assessment</h4>
                              <p className="text-sm text-foreground/80">Standardized business readiness evaluation powered by proven methodologies. Assesses technical, financial, and market readiness to provide objective scores that funders trust.</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">📄 AI Document Generator</h4>
                              <p className="text-sm text-foreground/80">Creates investor-ready business plans, pitch decks, and financial reports in minutes using advanced AI. Saves weeks of work and thousands in consulting fees.</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">📊 Financial Model Builder</h4>
                              <p className="text-sm text-foreground/80">Dynamic 3-statement financial modeling with IFRS and US GAAP support. Create professional-grade projections, scenario analysis, and investor presentations.</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">💰 Universal Valuation Model</h4>
                              <p className="text-sm text-foreground/80">Multi-methodology business valuation using DCF, comparable company analysis, and market multiples. Know your worth before negotiations.</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">🤝 Smart Matching Engine</h4>
                              <p className="text-sm text-foreground/80">AI-powered matching connects startups with relevant funders, suppliers, and buyers based on industry, stage, location, and specific needs.</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">🏦 Funding Opportunities</h4>
                              <p className="text-sm text-foreground/80">Comprehensive database of grants, loans, equity investments, and corporate programs. Filter by industry, amount, and stage. Apply directly through platform.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mentorship & Learning */}
                      <div className="border-l-4 border-primary/70 pl-6">
                        <h3 className="text-2xl font-bold text-primary/90 mb-4">2. Mentorship & Learning</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">👨‍🏫 Expert Mentorship Matching</h4>
                              <p className="text-sm text-foreground/80">Connect with experienced mentors based on industry, expertise, and specific challenges. Book sessions, track progress, and get actionable guidance.</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">📚 Resource Library</h4>
                              <p className="text-sm text-foreground/80">Comprehensive collection of guides, templates, case studies, and training materials. Self-paced learning on fundraising, operations, marketing, and growth.</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">🎥 Video Sessions & Recordings</h4>
                              <p className="text-sm text-foreground/80">Integrated video calling powered by Daily.co for seamless mentorship sessions. Session recordings for review and knowledge retention.</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-foreground mb-2">⭐ Rating & Review System</h4>
                              <p className="text-sm text-foreground/80">Transparent feedback system ensures quality mentorship and helps match entrepreneurs with the right advisors.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Services Marketplace */}
                      <div className="border-l-4 border-primary/50 pl-6">
                        <h3 className="text-2xl font-bold text-primary/80 mb-4">3. Services Marketplace</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-primary/5 p-4 rounded-lg">
                            <h4 className="font-semibold text-foreground mb-2">⚖️ Legal Services</h4>
                            <p className="text-sm text-foreground/80">Company registration, contracts, IP protection, compliance support from vetted legal professionals.</p>
                          </div>
                          <div className="bg-primary/5 p-4 rounded-lg">
                            <h4 className="font-semibold text-foreground mb-2">💼 Accounting & CFO</h4>
                            <p className="text-sm text-foreground/80">Bookkeeping, tax compliance, financial planning, and CFO services for growing businesses.</p>
                          </div>
                          <div className="bg-primary/5 p-4 rounded-lg">
                            <h4 className="font-semibold text-foreground mb-2">📱 Marketing & Tech</h4>
                            <p className="text-sm text-foreground/80">Digital marketing, branding, web development, and technical consulting services.</p>
                          </div>
                        </div>
                      </div>

                      {/* AI Copilot */}
                      <div className="border-l-4 border-primary/30 pl-6">
                        <h3 className="text-2xl font-bold text-primary/70 mb-4">4. AI Business Copilot</h3>
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg">
                          <p className="text-foreground/90 mb-4">24/7 AI assistant that helps entrepreneurs with strategic questions, document generation, financial analysis, market research, and business planning. Powered by advanced language models with deep knowledge of African business contexts.</p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Strategic planning assistance</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Market research & analysis</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Financial modeling guidance</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Pitch preparation support</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Ecosystem */}
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Multi-Sided Ecosystem</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                        <div className="text-4xl mb-3">🚀</div>
                        <h3 className="font-bold text-lg text-foreground mb-2">Startups & SMMEs</h3>
                        <p className="text-sm text-foreground/80 mb-3">Access tools, funding, mentorship, and services to accelerate growth and increase success rates.</p>
                        <ul className="text-xs space-y-1 text-foreground/70">
                          <li>• Credit scoring & readiness</li>
                          <li>• AI business tools</li>
                          <li>• Funding connections</li>
                          <li>• Expert mentorship</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="font-bold text-lg text-foreground mb-2">Funders & Investors</h3>
                        <p className="text-sm text-foreground/80 mb-3">Discover vetted investment-ready businesses with standardized assessments and comprehensive data.</p>
                        <ul className="text-xs space-y-1 text-foreground/70">
                          <li>• Deal flow pipeline</li>
                          <li>• Standardized scoring</li>
                          <li>• Due diligence data</li>
                          <li>• Portfolio tracking</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                        <div className="text-4xl mb-3">🎓</div>
                        <h3 className="font-bold text-lg text-foreground mb-2">Mentors & Advisors</h3>
                        <p className="text-sm text-foreground/80 mb-3">Share expertise, build legacy, and monetize knowledge while supporting the next generation.</p>
                        <ul className="text-xs space-y-1 text-foreground/70">
                          <li>• Flexible scheduling</li>
                          <li>• Session monetization</li>
                          <li>• Impact tracking</li>
                          <li>• Professional network</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                        <div className="text-4xl mb-3">🛠️</div>
                        <h3 className="font-bold text-lg text-foreground mb-2">Service Providers</h3>
                        <p className="text-sm text-foreground/80 mb-3">Access high-quality startup clients and grow your business through the marketplace.</p>
                        <ul className="text-xs space-y-1 text-foreground/70">
                          <li>• Client acquisition</li>
                          <li>• Listing & discovery</li>
                          <li>• Payment processing</li>
                          <li>• Rating & reputation</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Architecture */}
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Technical Architecture & Security</h2>
                    </div>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-4">Technology Stack</h3>
                          <div className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">Frontend</h4>
                              <p className="text-xs text-foreground/80">React, TypeScript, Tailwind CSS, Vite for blazing-fast performance and modern user experience</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">Backend & Database</h4>
                              <p className="text-xs text-foreground/80">Supabase (PostgreSQL) with Row Level Security (RLS), real-time capabilities, and automatic API generation</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">Serverless Functions</h4>
                              <p className="text-xs text-foreground/80">Edge Functions (Deno) for scalable backend logic, AI processing, and integrations</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">AI & Integrations</h4>
                              <p className="text-xs text-foreground/80">OpenAI, ElevenLabs, Daily.co, Resend, Sharetribe for advanced AI, voice, video, communication, and marketplace features</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-primary mb-4">Security & Compliance</h3>
                          <div className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">🔐 Authentication & Authorization</h4>
                              <p className="text-xs text-foreground/80">Supabase Auth with JWT tokens, multi-factor authentication, and role-based access control (RBAC)</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">🛡️ Data Protection</h4>
                              <p className="text-xs text-foreground/80">Row Level Security (RLS) policies, encrypted storage, HTTPS everywhere, and secure file handling</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">📋 Governance Framework</h4>
                              <p className="text-xs text-foreground/80">ISO 27001-aligned policies for access control, data retention, change management, and business continuity</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">📝 Audit Logging</h4>
                              <p className="text-xs text-foreground/80">Immutable security event logs with tamper detection, real-time monitoring, and comprehensive compliance reporting</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">🚨 Incident Response</h4>
                              <p className="text-xs text-foreground/80">24/7 incident detection, documented response procedures, breach notification protocols, and post-incident reviews</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">🤝 Vendor Risk Management</h4>
                              <p className="text-xs text-foreground/80">Comprehensive third-party risk assessments, security scorecards, DPA compliance, and quarterly vendor reviews</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">🎓 Security Awareness Training</h4>
                              <p className="text-xs text-foreground/80">Mandatory employee training program covering phishing defense, data protection, OWASP Top 10, and compliance requirements</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">⚙️ Change Management</h4>
                              <p className="text-xs text-foreground/80">Structured deployment processes with staged environments, automated testing, rollback procedures, and change documentation</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">🔄 Business Continuity & DR</h4>
                              <p className="text-xs text-foreground/80">30-minute RTO for critical systems, automated backups, disaster recovery playbooks, and quarterly DR testing</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">📊 Monitoring & Performance</h4>
                              <p className="text-xs text-foreground/80">Sentry error tracking, performance monitoring, real-time alerts, session replay, and comprehensive observability</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">✅ Compliance & Certifications</h4>
                              <p className="text-xs text-foreground/80">POPIA, GDPR, ISO 27001, ISO 22301, and ISO 27701 compliance with regular audits and continuous monitoring</p>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <h4 className="font-semibold text-sm text-foreground mb-2">🧪 Security Testing</h4>
                              <p className="text-xs text-foreground/80">Automated vulnerability scanning, penetration testing, code security reviews, and continuous security validation</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Model & Revenue */}
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <CurrencyIcon className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Business Model & Revenue Streams</h2>
                    </div>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-primary/10 to-background p-6 rounded-lg border border-primary/20">
                          <h3 className="text-xl font-bold text-primary mb-4">Revenue Streams</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">1. Transaction Fees</h4>
                              <p className="text-sm text-foreground/80">Commission on services marketplace transactions, mentorship bookings, and premium service provider listings</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">2. Subscription Plans</h4>
                              <p className="text-sm text-foreground/80">Tiered subscription for startups (freemium model), premium features for funders, and enhanced profiles for service providers</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">3. Assessment Services</h4>
                              <p className="text-sm text-foreground/80">Credit score assessments, in-depth business evaluations, and certification programs</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">4. Enterprise Partnerships</h4>
                              <p className="text-sm text-foreground/80">White-label solutions for corporate programs, accelerators, and government initiatives</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">5. Data & Insights</h4>
                              <p className="text-sm text-foreground/80">Aggregated market intelligence and trend reports for funders, policymakers, and researchers</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/10 to-background p-6 rounded-lg border border-primary/20">
                          <h3 className="text-xl font-bold text-primary mb-4">Value Proposition</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">For Startups</h4>
                              <ul className="text-sm text-foreground/80 space-y-2">
                                <li>• Free access to essential tools (freemium)</li>
                                <li>• Save ZAR 10,000+ on professional services</li>
                                <li>• Increase funding success rate by 3x</li>
                                <li>• Reduce time to market by 40%</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">For Funders</h4>
                              <ul className="text-sm text-foreground/80 space-y-2">
                                <li>• Access vetted deal flow pipeline</li>
                                <li>• Reduce due diligence time by 60%</li>
                                <li>• Standardized assessment framework</li>
                                <li>• Portfolio performance tracking</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">For Service Providers</h4>
                              <ul className="text-sm text-foreground/80 space-y-2">
                                <li>• Access to pre-qualified clients</li>
                                <li>• Reduced customer acquisition cost</li>
                                <li>• Automated payments & contracts</li>
                                <li>• Build reputation & portfolio</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Competitive Advantages */}
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Competitive Advantages & Differentiation</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                          <h3 className="font-bold text-lg text-primary mb-3">1. All-In-One Ecosystem</h3>
                          <p className="text-sm text-foreground/80">Unlike competitors who focus on single verticals (e.g., only funding or only mentorship), Kumii provides end-to-end support from business planning to funding access in one integrated platform.</p>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                          <h3 className="font-bold text-lg text-primary mb-3">2. AI-First Approach</h3>
                          <p className="text-sm text-foreground/80">Deep integration of AI across all features—from document generation to smart matching—makes professional tools accessible at startup-friendly prices.</p>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                          <h3 className="font-bold text-lg text-primary mb-3">3. Standardized Assessment</h3>
                          <p className="text-sm text-foreground/80">Proprietary credit scoring methodology creates a common language between entrepreneurs and funders, reducing information asymmetry and accelerating funding decisions.</p>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                          <h3 className="font-bold text-lg text-primary mb-3">4. African Context</h3>
                          <p className="text-sm text-foreground/80">Built specifically for African market realities—local regulations, business contexts, cultural nuances, and ecosystem partnerships that global platforms miss.</p>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                          <h3 className="font-bold text-lg text-primary mb-3">5. Network Effects</h3>
                          <p className="text-sm text-foreground/80">Multi-sided marketplace creates powerful network effects—more startups attract more funders, which attracts more mentors and service providers, creating a virtuous cycle.</p>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                          <h3 className="font-bold text-lg text-primary mb-3">6. Partnership Ecosystem</h3>
                          <p className="text-sm text-foreground/80">Strategic partnerships with Microsoft, Kumii Innovation Hub, and leading organizations provide credibility, distribution, and resources that would take years to build independently.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Strategy & Roadmap */}
                <Card className="border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Rocket className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Growth Strategy & Roadmap</h2>
                    </div>
                    <div className="space-y-8">
                      
                      {/* Current Phase */}
                      <div className="border-l-4 border-primary pl-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded">CURRENT</span>
                          <h3 className="text-xl font-bold text-foreground">Phase 1: Foundation (Q4 2024 - Q1 2025)</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-primary/5 p-4 rounded">
                            <h4 className="font-semibold text-foreground mb-2">Platform Development</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                              <li>✅ Core platform architecture</li>
                              <li>✅ User authentication & profiles</li>
                              <li>✅ Credit score assessment system</li>
                              <li>✅ Marketplace infrastructure</li>
                              <li>✅ Mentorship booking system</li>
                            </ul>
                          </div>
                          <div className="bg-primary/5 p-4 rounded">
                            <h4 className="font-semibold text-foreground mb-2">Go-To-Market</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                              <li>✅ Partnership with Kumii Innovation Hub</li>
                              <li>✅ Microsoft for Startups program</li>
                              <li>🔄 Early adopter onboarding</li>
                              <li>🔄 Initial mentor recruitment</li>
                              <li>🔄 Service provider partnerships</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Phase 2 */}
                      <div className="border-l-4 border-primary/70 pl-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-primary/70 text-primary-foreground text-sm font-bold rounded">NEXT</span>
                          <h3 className="text-xl font-bold text-foreground">Phase 2: Scale (Q2 - Q4 2025)</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-primary/5 p-4 rounded">
                            <h4 className="font-semibold text-foreground mb-2">Product</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                              <li>• Mobile app launch</li>
                              <li>• Advanced AI features</li>
                              <li>• White-label solutions</li>
                              <li>• API for integrations</li>
                            </ul>
                          </div>
                          <div className="bg-primary/5 p-4 rounded">
                            <h4 className="font-semibold text-foreground mb-2">Market Expansion</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                              <li>• Reach 5,000 startups</li>
                              <li>• 200+ active mentors</li>
                              <li>• 50+ verified funders</li>
                              <li>• Geographic expansion</li>
                            </ul>
                          </div>
                          <div className="bg-primary/5 p-4 rounded">
                            <h4 className="font-semibold text-foreground mb-2">Revenue</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                              <li>• Launch premium tiers</li>
                              <li>• Enterprise partnerships</li>
                              <li>• Marketplace revenue</li>
                              <li>• Break-even milestone</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Phase 3 */}
                      <div className="border-l-4 border-primary/40 pl-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-primary/40 text-foreground text-sm font-bold rounded">FUTURE</span>
                          <h3 className="text-xl font-bold text-foreground">Phase 3: Ecosystem (2026+)</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-primary/5 p-4 rounded">
                            <h4 className="font-semibold text-foreground mb-2">Platform Evolution</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                              <li>• Embedded financial services</li>
                              <li>• Direct lending capabilities</li>
                              <li>• Blockchain integration</li>
                              <li>• Advanced analytics & insights</li>
                              <li>• Virtual accelerator programs</li>
                            </ul>
                          </div>
                          <div className="bg-primary/5 p-4 rounded">
                            <h4 className="font-semibold text-foreground mb-2">Market Leadership</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                              <li>• 50,000+ active startups</li>
                              <li>• Pan-African presence</li>
                              <li>• $100M+ in facilitated funding</li>
                              <li>• Become de facto standard</li>
                              <li>• International expansion</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>

                {/* Partnership Ecosystem */}
                <Card className="border-2 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary rounded-lg">
                        <Users className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Partnership Ecosystem</h2>
                    </div>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-background/80 backdrop-blur p-6 rounded-lg border border-primary/20">
                          <h3 className="font-bold text-lg text-primary mb-3">Strategic Partners</h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="font-semibold text-foreground">Kumii Innovation Hub</div>
                              <p className="text-foreground/70 text-xs">Flagship innovation hub partnership providing credibility and access to premium startups</p>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">Microsoft for Startups</div>
                              <p className="text-foreground/70 text-xs">Technology partnership providing Azure credits, tools, and ecosystem access</p>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">Nedbank</div>
                              <p className="text-foreground/70 text-xs">Financial services partner for embedded banking and funding access</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/80 backdrop-blur p-6 rounded-lg border border-primary/20">
                          <h3 className="font-bold text-lg text-primary mb-3">Technology Partners</h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="font-semibold text-foreground">OpenAI</div>
                              <p className="text-foreground/70 text-xs">AI capabilities for document generation and business copilot</p>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">Daily.co</div>
                              <p className="text-foreground/70 text-xs">Video infrastructure for mentorship sessions</p>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">Supabase</div>
                              <p className="text-foreground/70 text-xs">Backend infrastructure and database management</p>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">Journey Horizon</div>
                              <p className="text-foreground/70 text-xs">Strategic technology partnership for platform development</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/80 backdrop-blur p-6 rounded-lg border border-primary/20">
                          <h3 className="font-bold text-lg text-primary mb-3">Ecosystem Partners</h3>
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="font-semibold text-foreground">Accelerators</div>
                              <p className="text-foreground/70 text-xs">White-label platform for cohort management</p>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">Universities</div>
                              <p className="text-foreground/70 text-xs">Student entrepreneur programs and research</p>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">Corporates</div>
                              <p className="text-foreground/70 text-xs">Enterprise supplier diversity programs</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Call to Action */}
                <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Investment Opportunity</h2>
                    <p className="text-lg text-foreground/80 mb-6 max-w-3xl mx-auto">
                      Kumii is positioned to become the leading platform for African startup success, addressing a $331B market opportunity with proven technology, strategic partnerships, and a clear path to profitability.
                    </p>
                    <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                      <div className="bg-background/60 backdrop-blur p-4 rounded-lg">
                        <div className="text-3xl font-bold text-primary mb-1">$331B</div>
                        <p className="text-sm text-foreground/70">Market Opportunity</p>
                      </div>
                      <div className="bg-background/60 backdrop-blur p-4 rounded-lg">
                        <div className="text-3xl font-bold text-primary mb-1">44M</div>
                        <p className="text-sm text-foreground/70">Target SMEs</p>
                      </div>
                      <div className="bg-background/60 backdrop-blur p-4 rounded-lg">
                        <div className="text-3xl font-bold text-primary mb-1">5</div>
                        <p className="text-sm text-foreground/70">Revenue Streams</p>
                      </div>
                      <div className="bg-background/60 backdrop-blur p-4 rounded-lg">
                        <div className="text-3xl font-bold text-primary mb-1">All-In-One</div>
                        <p className="text-sm text-foreground/70">Unique Positioning</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* Startup Journey Map Tab */}
            <TabsContent value="startup-journey" className="space-y-8 mt-8">
              <StartupJourneyMap />
            </TabsContent>

            {/* Mentor Journey Map Tab */}
            <TabsContent value="mentor-journey" className="space-y-8 mt-8">
              <MentorJourneyMap />
            </TabsContent>

            {/* Service Provider Journey Map Tab */}
            <TabsContent value="mentor-journey-2" className="space-y-8 mt-8">
              <ServiceProviderJourneyMap />
            </TabsContent>

            {/* Funder Journey Map Tab */}
            <TabsContent value="mentor-journey-3" className="space-y-8 mt-8">
              <FunderJourneyMap />
            </TabsContent>

            {/* Features Mapping Matrix Tab */}
            <TabsContent value="features-matrix" className="space-y-8 mt-8">
              <FeaturesMappingMatrix />
            </TabsContent>

            {/* Kumii Profile Tab */}
            <TabsContent value="kumii-profile" className="space-y-8 mt-8">
              <div className="space-y-6">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary rounded-lg">
                        <Building2 className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Kumii Marketing Profile</h2>
                    </div>
                    <p className="text-muted-foreground mb-8">
                      Comprehensive marketing profile for Kumii. Perfect for sharing with potential clients, partners, funders, and stakeholders.
                    </p>
                    
                    <div className="flex gap-4 mb-8">
                      <Button 
                        onClick={downloadKumiiProfilePDF} 
                        variant="default" 
                        size="lg"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <KumiiProfile />
              </div>
            </TabsContent>

            {/* Mafika Profile Tab */}
            <TabsContent value="mafika-profile" className="space-y-8 mt-8">
              <div className="space-y-6">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary rounded-lg">
                        <UserPlus className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Mafika William Nkambule - Professional Profile</h2>
                    </div>
                    <p className="text-muted-foreground mb-8">
                      Comprehensive professional profile showcasing leadership in IT strategy, digital transformation, and enterprise architecture. 
                      Currently serving as Digital Lead for Kumii Marketplace, alongside his role as Director & Head of ICT Services at Tshwane University of Technology.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-8">
                      <Button 
                        onClick={() => {
                          toast.promise(
                            (async () => {
                              const element = document.getElementById('mafika-profile');
                              if (!element) throw new Error('Profile element not found');
                              
                              const canvas = await html2canvas(element, {
                                scale: 2,
                                useCORS: true,
                                logging: false,
                                backgroundColor: '#ffffff',
                              });
                              
                              const pdf = new jsPDF('p', 'mm', 'a4');
                              const imgData = canvas.toDataURL('image/jpeg', 0.95);
                              const pdfWidth = pdf.internal.pageSize.getWidth();
                              const pdfHeight = pdf.internal.pageSize.getHeight();
                              const imgWidth = pdfWidth - 20;
                              const imgHeight = (canvas.height * imgWidth) / canvas.width;
                              
                              let heightLeft = imgHeight;
                              let position = 10;
                              
                              pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                              heightLeft -= (pdfHeight - 20);
                              
                              while (heightLeft > 0) {
                                position = heightLeft - imgHeight + 10;
                                pdf.addPage();
                                pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                                heightLeft -= (pdfHeight - 20);
                              }
                              
                              pdf.save('Mafika_Nkambule_Professional_Profile.pdf');
                            })(),
                            {
                              loading: 'Generating PDF...',
                              success: 'PDF downloaded successfully',
                              error: 'Failed to generate PDF',
                            }
                          );
                        }}
                        variant="default" 
                        size="lg"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          toast.promise(
                            generateMafikaProfileWord(),
                            {
                              loading: 'Generating Word document...',
                              success: 'Word document downloaded successfully',
                              error: 'Failed to generate Word document',
                            }
                          );
                        }}
                        variant="default"
                        size="lg"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Word
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <MafikaProfile />
              </div>
            </TabsContent>

            {/* Business Card Tab */}
            <TabsContent value="business-card" className="space-y-8 mt-8">
              <div className="space-y-6">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary rounded-lg">
                        <CreditCard className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h2 className="text-3xl font-bold text-foreground">Team Business Cards</h2>
                    </div>
                    <p className="text-muted-foreground mb-8">
                      Official business cards for Kumii team members. Scan the QR code to visit our platform.
                    </p>
                    
                    <div className="flex justify-center">
                      <BusinessCard
                        name="Noma Ngubane"
                        title="Product Manager"
                        email="noma@kumii.co.za"
                        phone="+27 78 234 6098"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
                    Kumii. No more guessing where you stand. Get technical, financial, and market readiness scores that funders actually trust. 
                    And if your readiness score is low, don't worry—Kumii is your one-stop platform with comprehensive intervention programs, 
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
                    "This is what makes Kumii truly powerful—we're your one-stop platform for SMMEs and Startups. Everything you need to build, 
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
                  <p className="italic text-muted-foreground">[Visual: Logos of Microsoft, Kumii Innovation Hub, etc.]</p>
                  <p>
                    <strong>Narrator:</strong> "We're trusted by leading organizations across Africa. Microsoft for Startups, 
                    Kumii Innovation Hub, and many others partner with us because they believe in democratizing access to opportunity."
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
                    support. Kumii... Building Your Business. Welcome home."
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

            {/* RACI Matrix Tab */}
            <TabsContent value="raci" className="space-y-8 mt-8">
              <RACIMatrix />
            </TabsContent>

            {/* Access Management Tab */}
            <TabsContent value="access" className="space-y-8 mt-8">
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold">Access Management</h2>
                      <p className="text-muted-foreground">Manage authorized emails for system documentation access</p>
                    </div>
                  </div>

                  {/* Add New Email */}
                  <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Add New Authorized Email
                    </h3>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                        className="flex-1"
                      />
                      <Button onClick={addEmail}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Email
                      </Button>
                    </div>
                  </div>

                  {/* Authorized Emails List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Authorized Emails ({authorizedEmails.length})</h3>
                    <div className="space-y-2">
                      {authorizedEmails.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No authorized emails yet. Add one above.</p>
                      ) : (
                        authorizedEmails.map((email) => (
                          <div
                            key={email}
                            className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-muted-foreground" />
                              <span className="font-medium">{email}</span>
                              {user?.email === email && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">You</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEmail(email)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database" className="space-y-8 mt-8">
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-8 h-8 text-primary" />
                      <div>
                        <h2 className="text-2xl font-bold">Database Structure</h2>
                        <p className="text-muted-foreground">Complete overview of all tables and relationships</p>
                      </div>
                    </div>
                    <Button onClick={downloadDatabaseDocumentation} variant="default" size="lg">
                      <FileDown className="w-4 h-4 mr-2" />
                      Download Documentation
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">45+</div>
                      <div className="text-sm text-muted-foreground">Total Tables</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">23+</div>
                      <div className="text-sm text-muted-foreground">Custom Functions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">4</div>
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
                          { name: "business_scores", desc: "Business health and credit scoring" },
                          { name: "cohort_funded_listings", desc: "Links cohorts to funded listings" },
                          { name: "cohort_memberships", desc: "Tracks user memberships in cohorts" },
                          { name: "cohorts", desc: "Sponsored cohort programs" },
                          { name: "conversation_participants", desc: "Messaging conversation members" },
                          { name: "conversations", desc: "Direct and group conversations" },
                          { name: "credit_assessments", desc: "Business credit score assessments" },
                          { name: "credits_transactions", desc: "Platform credits transaction history" },
                          { name: "credits_wallet", desc: "User credit balance management" },
                          { name: "event_registrations", desc: "User event registrations" },
                          { name: "events", desc: "Platform events and webinars" },
                          { name: "file_shares", desc: "File sharing permissions" },
                          { name: "files", desc: "User uploaded files and documents" },
                          { name: "funders", desc: "Funder organization profiles" },
                          { name: "funding_applications", desc: "Funding opportunity applications" },
                          { name: "funding_matches", desc: "AI-matched funding opportunities" },
                          { name: "funding_opportunities", desc: "Available funding opportunities" },
                          { name: "listing_categories", desc: "Categories for marketplace listings" },
                          { name: "listing_reviews", desc: "User reviews for listings" },
                          { name: "listings", desc: "Marketplace listings (services/products)" },
                          { name: "match_notifications", desc: "Notifications for AI matches" },
                          { name: "mentor_availability", desc: "Mentor weekly availability schedule" },
                          { name: "mentor_categories", desc: "Links mentors to expertise areas" },
                          { name: "mentor_date_overrides", desc: "Specific date availability overrides" },
                          { name: "mentor_matches", desc: "AI-matched mentor recommendations" },
                          { name: "mentoring_categories", desc: "Mentorship expertise categories" },
                          { name: "mentoring_sessions", desc: "Scheduled mentorship sessions" },
                          { name: "mentors", desc: "Mentor profiles and availability" },
                          { name: "messages", desc: "User notifications and messages" },
                          { name: "model_states", desc: "Financial model saved states" },
                          { name: "profiles", desc: "User profile information" },
                          { name: "progressive_profile_data", desc: "Progressive profiling data" },
                          { name: "resource_bookmarks", desc: "User bookmarked resources" },
                          { name: "resource_categories", desc: "Categories for learning resources" },
                          { name: "resource_progress", desc: "User progress on resources" },
                          { name: "resource_ratings", desc: "User ratings for resources" },
                          { name: "resources", desc: "Learning resources and materials" },
                          { name: "rewards", desc: "User rewards and gamification points" },
                          { name: "score_sharing", desc: "Credit score sharing with funders" },
                          { name: "scoring_criteria", desc: "Assessment scoring criteria" },
                          { name: "service_categories", desc: "Service provider categories" },
                          { name: "service_matches", desc: "AI-matched service recommendations" },
                          { name: "service_providers", desc: "Service provider profiles" },
                          { name: "service_reviews", desc: "Reviews for services" },
                          { name: "service_subscriptions", desc: "User service subscriptions" },
                          { name: "services", desc: "Professional services offered" },
                          { name: "session_reviews", desc: "Mentor session ratings and feedback" },
                          { name: "startup_profiles", desc: "Startup business profiles" },
                          { name: "transactions", desc: "Business transaction records" },
                          { name: "user_roles", desc: "User role assignments (admin, etc.)" },
                          { name: "user_subscriptions", desc: "User listing subscriptions" },
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
                            <div className="font-mono text-sm font-semibold text-primary">files</div>
                            <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded">Private</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">User uploaded files and documents</div>
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

            {devMode && (
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
                    <div className="mermaid bg-background p-4 rounded-lg overflow-auto">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Journey 2 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">2. Mentor Session Management Journey</h3>
                    <p className="text-muted-foreground mb-6">How mentors manage incoming session requests</p>
                    <div className="mermaid bg-background p-4 rounded-lg overflow-auto">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Journey 3 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">3. Mentor Availability Management Journey</h3>
                    <p className="text-muted-foreground mb-6">Setting up weekly schedules and date-specific overrides</p>
                    <div className="mermaid bg-background p-4 rounded-lg overflow-auto">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Journey 4 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">4. Real-time Notification System Flow</h3>
                    <p className="text-muted-foreground mb-6">How notifications are delivered in real-time via Supabase</p>
                    <div className="mermaid bg-background p-4 rounded-lg overflow-auto">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Journey 5 */}
                <Card className="border-2 journey-diagram">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">5. Complete System Architecture</h3>
                    <p className="text-muted-foreground mb-6">How all mentorship components connect together</p>
                    <div className="mermaid bg-background p-4 rounded-lg overflow-auto">
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            )}

            {/* Load Testing Tab */}
            {devMode && (
              <TabsContent value="testing" className="space-y-8 mt-8">
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Load Testing Suite</h2>
                      <p className="text-muted-foreground">
                        Comprehensive k6 test scripts for performance, scalability, and reliability testing
                      </p>
                    </div>
                    <Button 
                      onClick={downloadTestScriptsPDF}
                      size="lg"
                      className="gap-2"
                    >
                      <FileDown className="w-5 h-5" />
                      Download Test Scripts PDF
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {/* Overview Card */}
                    <Card className="border">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                          <FileCode className="w-5 h-5 text-primary" />
                          What's Included
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span><strong>Configuration File:</strong> Test users, scenarios, and thresholds</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span><strong>Authentication Flow:</strong> Sign-in and session management tests</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span><strong>Mentorship Booking:</strong> End-to-end booking workflow validation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span><strong>Credit Assessment:</strong> AI-powered assessment generation tests</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span><strong>Marketplace Flow:</strong> Browse, search, and filter testing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span><strong>Funding Applications:</strong> Application submission flow tests</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span><strong>Main Load Test:</strong> Mixed realistic user journey simulation</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Performance Targets */}
                    <Card className="border">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                          <Database className="w-5 h-5 text-primary" />
                          Performance Targets
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm font-medium">Success Rate</span>
                            <span className="text-sm font-bold text-green-600">&gt; 99%</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm font-medium">Avg Response Time</span>
                            <span className="text-sm font-bold text-green-600">&lt; 500ms</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm font-medium">P95 Response Time</span>
                            <span className="text-sm font-bold text-green-600">&lt; 2s</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm font-medium">Booking Flow</span>
                            <span className="text-sm font-bold text-green-600">&lt; 3s</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-sm font-medium">Assessment (with AI)</span>
                            <span className="text-sm font-bold text-green-600">&lt; 5s</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Database Queries</span>
                            <span className="text-sm font-bold text-green-600">&lt; 500ms</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Test Scenarios */}
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">Load Test Scenarios</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border">
                        <CardContent className="p-5">
                          <h4 className="font-bold mb-2 text-blue-600">🔵 Baseline Test</h4>
                          <p className="text-sm text-muted-foreground mb-2">Normal daily traffic simulation</p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• 10-20 concurrent users</li>
                            <li>• 5 minutes sustained load</li>
                            <li>• Validates typical operations</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardContent className="p-5">
                          <h4 className="font-bold mb-2 text-orange-600">🟠 Stress Test</h4>
                          <p className="text-sm text-muted-foreground mb-2">Peak traffic and breaking points</p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Ramps up to 100 users</li>
                            <li>• Sustained peak load</li>
                            <li>• Identifies system limits</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardContent className="p-5">
                          <h4 className="font-bold mb-2 text-red-600">🔴 Spike Test</h4>
                          <p className="text-sm text-muted-foreground mb-2">Sudden traffic surge</p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• 10 → 200 users in 10 seconds</li>
                            <li>• Tests auto-scaling</li>
                            <li>• Simulates viral campaigns</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border">
                        <CardContent className="p-5">
                          <h4 className="font-bold mb-2 text-green-600">🟢 Soak Test</h4>
                          <p className="text-sm text-muted-foreground mb-2">Long-running stability</p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• 20 users for 30 minutes</li>
                            <li>• Detects memory leaks</li>
                            <li>• Validates long-term reliability</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Quick Start */}
                  <Card className="border-2 border-primary/20 bg-primary/5 mt-8">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3">🚀 Quick Start</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-semibold mb-1">1. Install k6:</p>
                          <code className="block bg-background p-2 rounded text-xs">
                            brew install k6  # macOS
                          </code>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">2. Create test users in Supabase Auth</p>
                          <p className="text-xs text-muted-foreground">
                            loadtest1@example.com through loadtest5@example.com (password: TestPass123!)
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">3. Run tests:</p>
                          <code className="block bg-background p-2 rounded text-xs">
                            k6 run auth-flow.js  # Individual test<br />
                            k6 run main-load-test.js  # Full suite
                          </code>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            📖 For detailed setup instructions, deployment guide, and troubleshooting, 
                            download the complete PDF documentation above.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features */}
                  <div className="mt-8 grid md:grid-cols-3 gap-4">
                    <Card className="border">
                      <CardContent className="p-5 text-center">
                        <div className="text-3xl mb-2">📊</div>
                        <h4 className="font-bold mb-1">Real-time Metrics</h4>
                        <p className="text-xs text-muted-foreground">
                          Monitor response times, throughput, and error rates live
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardContent className="p-5 text-center">
                        <div className="text-3xl mb-2">🎯</div>
                        <h4 className="font-bold mb-1">Custom Thresholds</h4>
                        <p className="text-xs text-muted-foreground">
                          Pass/fail criteria for automated quality gates
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardContent className="p-5 text-center">
                        <div className="text-3xl mb-2">🔄</div>
                        <h4 className="font-bold mb-1">CI/CD Ready</h4>
                        <p className="text-xs text-muted-foreground">
                          Integrate with GitHub Actions, GitLab CI, or Jenkins
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            )}
          </Tabs>
          )}
        </div>
      </main>

      <Footer />
      </div>
    </Layout>
  );
};

export default SystemDocumentation;
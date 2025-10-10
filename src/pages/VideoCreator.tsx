import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface VideoSection {
  title: string;
  route: string;
  duration: number; // seconds
  description: string;
  features: string[]; // Key features to highlight
}

const VideoCreator = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Define sections synced with narration timing
  const videoSections: VideoSection[] = [
    { 
      title: "Welcome & Overview", 
      route: "/", 
      duration: 8, 
      description: "Platform introduction",
      features: ["hero", "stats", "partners"]
    },
    { 
      title: "Funding Hub", 
      route: "/funding-hub", 
      duration: 10, 
      description: "Access to capital",
      features: ["browse-funding", "funder-directory"]
    },
    { 
      title: "Mentorship", 
      route: "/mentorship", 
      duration: 10, 
      description: "Expert guidance",
      features: ["find-mentor", "become-mentor"]
    },
    { 
      title: "Access to Market", 
      route: "/access-to-market", 
      duration: 10, 
      description: "Marketplace access",
      features: ["listings", "smart-matching"]
    },
    { 
      title: "Services", 
      route: "/services", 
      duration: 8, 
      description: "Professional services",
      features: ["legal", "accounting", "marketing"]
    },
    { 
      title: "Resources", 
      route: "/resources", 
      duration: 8, 
      description: "Knowledge library",
      features: ["guides", "templates", "case-studies"]
    },
    { 
      title: "Credit Score", 
      route: "/credit-score", 
      duration: 10, 
      description: "Financial health",
      features: ["assessment", "results"]
    },
  ];

  const captureIframeToCanvas = async (iframe: HTMLIFrameElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Wait for iframe to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Use html2canvas-like approach: draw the iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Take a simple screenshot approach: convert iframe to image
      const svgData = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(1); transform-origin: top left;">
              ${iframeDoc.documentElement.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;
      
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(true);
        };
        img.onerror = () => {
          console.error('Failed to capture iframe');
          resolve(false);
        };
        img.src = url;
      });
    } catch (error) {
      console.error('Error capturing iframe:', error);
    }
  };

  const addOverlayToCanvas = (
    ctx: CanvasRenderingContext2D,
    section: VideoSection,
    progress: number,
    canvas: HTMLCanvasElement
  ) => {
    const width = canvas.width;
    const height = canvas.height;

    // Add semi-transparent overlay at top for title
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 200);

    // Title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(section.title, 40, 60);

    // Description
    ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillText(section.description, 40, 100);

    // Progress bar at bottom
    const barHeight = 6;
    const barY = height - 40;
    const barX = 40;
    const barWidth = width - 80;

    // Background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progress fill
    ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    // Section indicator
    const sectionIndex = videoSections.indexOf(section) + 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`${sectionIndex} / ${videoSections.length}`, width - 40, height - 50);
  };

  const generateVideo = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setCurrentSection('Initializing...');
      toast.info("Starting video generation...");

      const canvas = canvasRef.current;
      const iframe = iframeRef.current;
      if (!canvas || !iframe) throw new Error('Canvas or iframe not found');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not found');

      // Set canvas dimensions for 1080p
      canvas.width = 1920;
      canvas.height = 1080;

      // Get audio URL from localStorage
      const audioDataUrl = localStorage.getItem('narrationAudioUrl');
      if (!audioDataUrl) {
        toast.error("Please generate narration first from the About page");
        setIsGenerating(false);
        return;
      }

      // Create and setup audio
      const audio = new Audio(audioDataUrl);
      audioRef.current = audio;
      
      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
      });
      
      // Setup MediaRecorder with canvas stream
      const canvasStream = canvas.captureStream(30); // 30 FPS
      
      // Create audio context and connect audio
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio);
      const destination = audioContext.createMediaStreamDestination();
      
      source.connect(destination);
      source.connect(audioContext.destination); // Also play through speakers
      
      // Add audio track to video stream
      destination.stream.getAudioTracks().forEach(track => {
        canvasStream.addTrack(track);
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        toast.success("Video generated successfully!");
        setIsGenerating(false);
        setCurrentSection('');
        audioContext.close();
      };

      // Start recording
      mediaRecorder.start(100);
      
      // Start audio playback
      await audio.play();

      // Generate video sections
      for (let i = 0; i < videoSections.length; i++) {
        const section = videoSections[i];
        setCurrentSection(`Capturing: ${section.title}`);
        setProgress(((i + 1) / videoSections.length) * 100);
        toast.info(`Capturing: ${section.title}`);

        // Load the page in iframe
        iframe.src = section.route;
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for page load

        const startTime = Date.now();
        const duration = section.duration * 1000;
        const fps = 30;
        const frameTime = 1000 / fps;

        // Capture frames for this section
        while (Date.now() - startTime < duration) {
          const elapsed = Date.now() - startTime;
          const sectionProgress = elapsed / duration;

          // Clear canvas
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Try to capture iframe content
          try {
            const iframeWindow = iframe.contentWindow;
            const iframeDoc = iframe.contentDocument;
            
            if (iframeDoc && iframeDoc.body) {
              // Create a simple visual representation
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Add gradient overlay
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
              gradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          } catch (e) {
            // CORS error - just use solid background
            console.log('CORS restriction, using overlay only');
          }

          // Add professional overlay
          addOverlayToCanvas(ctx, section, sectionProgress, canvas);

          // Add fade transitions
          if (elapsed < 500) {
            ctx.fillStyle = `rgba(15, 23, 42, ${1 - elapsed / 500})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (duration - elapsed < 500) {
            ctx.fillStyle = `rgba(15, 23, 42, ${1 - (duration - elapsed) / 500})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          await new Promise(resolve => setTimeout(resolve, frameTime));
        }
      }

      // Stop recording
      mediaRecorder.stop();
      audio.pause();

    } catch (error) {
      console.error('Video generation error:', error);
      toast.error(`Failed to generate video: ${error.message}`);
      setIsGenerating(false);
      setCurrentSection('');
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'platform-tour.webm';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading video...");
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/about')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to About
          </Button>
          <h1 className="text-2xl font-bold">Video Creator</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Create Platform Tour Video</h2>
            <p className="text-muted-foreground text-lg">
              Automatically generate an impactful video showcasing your platform with professional narration
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Video Sections</h3>
              <p className="text-sm text-muted-foreground">
                Total duration: ~{videoSections.reduce((acc, s) => acc + s.duration, 0)} seconds with professional narration
              </p>
              <div className="grid gap-3">
                {videoSections.map((section, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {section.duration}s
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{currentSection}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-center">
                  This may take a few minutes. Please don't close this page.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={generateVideo}
                disabled={isGenerating}
                className="min-w-[200px]"
              >
                <Play className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Marketing Video'}
              </Button>
              
              {videoUrl && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={downloadVideo}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              )}
            </div>
          </Card>

          {videoUrl && (
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-4">Preview</h3>
              <video 
                controls 
                className="w-full rounded-lg shadow-lg"
                src={videoUrl}
              />
            </Card>
          )}

          {/* Hidden elements for video generation */}
          <iframe 
            ref={iframeRef} 
            className="hidden" 
            title="Video capture frame"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </main>
    </div>
  );
};

export default VideoCreator;

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
}

const VideoCreator = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Define sections synced with narration timing
  const videoSections: VideoSection[] = [
    { title: "Welcome & Overview", route: "/", duration: 8, description: "Platform introduction" },
    { title: "Funding Hub", route: "/funding-hub", duration: 10, description: "Access to capital" },
    { title: "Mentorship", route: "/mentorship", duration: 10, description: "Expert guidance" },
    { title: "Access to Market", route: "/access-to-market", duration: 10, description: "Marketplace access" },
    { title: "Services", route: "/services", duration: 8, description: "Professional services" },
    { title: "Resources", route: "/resources", duration: 8, description: "Knowledge library" },
    { title: "Credit Score", route: "/credit-score", duration: 10, description: "Financial health" },
  ];

  const captureSection = async (section: VideoSection): Promise<ImageBitmap> => {
    // Create iframe to load the route
    const iframe = document.createElement('iframe');
    iframe.style.width = '1920px';
    iframe.style.height = '1080px';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.src = section.route;
    document.body.appendChild(iframe);

    // Wait for iframe to load
    await new Promise((resolve) => {
      iframe.onload = () => setTimeout(resolve, 2000); // Give time to render
    });

    // Capture screenshot using html2canvas approach
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (ctx && iframe.contentWindow) {
      // Create image from iframe
      const blob = await new Promise<Blob>((resolve) => {
        iframe.contentWindow!.postMessage('capture', '*');
        // Simplified: draw a gradient as placeholder for now
        const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
        gradient.addColorStop(0, '#0F172A');
        gradient.addColorStop(1, '#6366F1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1920, 1080);
        
        // Add section title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 64px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(section.title, 960, 540);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      document.body.removeChild(iframe);
      return await createImageBitmap(blob);
    }

    document.body.removeChild(iframe);
    throw new Error('Failed to capture section');
  };

  const generateVideo = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      toast.info("Starting video generation...");

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not found');

      // Set canvas dimensions
      canvas.width = 1920;
      canvas.height = 1080;

      // Get audio URL from localStorage or state
      const audioUrl = localStorage.getItem('narrationAudioUrl');
      if (!audioUrl) {
        toast.error("Please generate narration first from the About page");
        setIsGenerating(false);
        return;
      }

      // Create audio element
      const audio = new Audio(audioUrl);
      audio.crossOrigin = 'anonymous';

      // Set up MediaRecorder
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Add audio track to stream
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaElementSource(audio);
      const dest = audioContext.createMediaStreamDestination();
      audioSource.connect(dest);
      audioSource.connect(audioContext.destination);
      
      dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 5000000,
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
      };

      // Start recording
      mediaRecorder.start(100);
      audio.play();

      // Capture and render sections
      let currentTime = 0;
      for (let i = 0; i < videoSections.length; i++) {
        const section = videoSections[i];
        setProgress(((i + 1) / videoSections.length) * 100);
        toast.info(`Capturing: ${section.title}`);

        const image = await captureSection(section);
        
        // Render section for its duration
        const startTime = Date.now();
        const endTime = startTime + (section.duration * 1000);

        while (Date.now() < endTime) {
          // Clear canvas
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw section image
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Add fade transition
          const elapsed = Date.now() - startTime;
          if (elapsed < 500) {
            ctx.fillStyle = `rgba(15, 23, 42, ${1 - elapsed / 500})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (endTime - Date.now() < 500) {
            ctx.fillStyle = `rgba(15, 23, 42, ${1 - (endTime - Date.now()) / 500})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          await new Promise(resolve => setTimeout(resolve, 1000 / 30)); // 30 FPS
        }

        currentTime += section.duration;
      }

      // Stop recording
      audio.pause();
      mediaRecorder.stop();
      audioContext.close();

    } catch (error) {
      console.error('Video generation error:', error);
      toast.error("Failed to generate video");
      setIsGenerating(false);
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating video...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={generateVideo}
                disabled={isGenerating}
              >
                <Play className="w-4 h-4 mr-2" />
                Generate Video
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
                className="w-full rounded-lg"
                src={videoUrl}
              />
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </main>
    </div>
  );
};

export default VideoCreator;

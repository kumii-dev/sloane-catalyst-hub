import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import kumiiLogo from '@/assets/kumii-logo-white-tagline.png';

interface BusinessCardProps {
  name: string;
  title: string;
  email: string;
  phone: string;
  platformUrl?: string;
}

export const BusinessCard = ({ 
  name, 
  title, 
  email, 
  phone,
  platformUrl = window.location.origin 
}: BusinessCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [logoSrc, setLogoSrc] = useState<string>(kumiiLogo);

  // Remove only the white background connected to the image edges (preserves interior whites)
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = kumiiLogo;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        const idx = (x: number, y: number) => (y * width + x) * 4;
        const isNearWhite = (i: number) => data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245;
        const visited = new Uint8Array(width * height);
        const stack: [number, number][] = [];

        // Seed with border pixels
        for (let x = 0; x < width; x++) { stack.push([x, 0]); stack.push([x, height - 1]); }
        for (let y = 0; y < height; y++) { stack.push([0, y]); stack.push([width - 1, y]); }

        while (stack.length) {
          const [x, y] = stack.pop()!;
          if (x < 0 || y < 0 || x >= width || y >= height) continue;
          const p = y * width + x;
          if (visited[p]) continue;
          visited[p] = 1;
          const i = idx(x, y);
          if (isNearWhite(i)) {
            data[i + 3] = 0; // Make transparent
            stack.push([x + 1, y]); stack.push([x - 1, y]); stack.push([x, y + 1]); stack.push([x, y - 1]);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        setLogoSrc(canvas.toDataURL('image/png'));
      } catch {
        setLogoSrc(kumiiLogo);
      }
    };
    img.onerror = () => setLogoSrc(kumiiLogo);
  }, []);


  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High quality for printing (3x resolution)
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '-')}-business-card.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Business card downloaded successfully!');
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error('Failed to download business card');
    }
  };

  return (
    <>
      <Card className="w-full max-w-[540px] mx-auto overflow-hidden shadow-elegant">
      <CardContent className="p-0">
        {/* Bank card dimensions: aspect ratio 1.586:1 (85.6mm x 53.98mm) */}
        <div ref={cardRef} className="relative bg-gradient-to-t from-[hsl(82,13%,36%)] via-[hsl(82,13%,46%)] to-[hsl(82,54%,85%)] p-8 aspect-[1.586/1] flex flex-col justify-between">
          {/* Top Section: Logo and QR Code */}
          <div className="flex items-start justify-between">
            <img 
              src={logoSrc}
              alt="Kumii Logo"
              className="h-16 w-auto drop-shadow-md opacity-90"
              style={{ filter: 'brightness(1.1)' }}
              onError={() => { /* fallback */ }}
            />
            <div className="bg-white/95 p-2.5 rounded-lg shadow-medium">
              <QRCodeSVG 
                value={platformUrl}
                size={72}
                level="H"
                bgColor="transparent"
                fgColor="hsl(82, 13%, 36%)"
              />
            </div>
          </div>

          {/* Middle Section: Name and Title */}
          <div className="space-y-1 -mt-2">
            <h3 className="text-2xl font-bold text-[hsl(82,13%,15%)] tracking-tight">
              {name}
            </h3>
            <p className="text-base text-[hsl(82,13%,25%)] font-semibold">
              {title}
            </p>
          </div>

          {/* Bottom Section: Contact and Tagline */}
          <div className="space-y-3">
            <div className="space-y-2 pb-3 border-t border-white/30 pt-3">
              <div className="flex items-center gap-2.5 text-white">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-white">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{phone}</span>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <p className="text-xs text-white font-semibold italic drop-shadow-sm">
                All-In-One Platform for Your Business
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <div className="flex justify-center mt-4">
      <Button onClick={handleDownload} className="gap-2">
        <Download className="w-4 h-4" />
        Download Card
      </Button>
    </div>
    </>
  );
};

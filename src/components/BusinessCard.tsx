import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone } from 'lucide-react';
import kumiiLogo from '@/assets/kumii-logo.png';

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
  return (
    <Card className="w-full max-w-[540px] mx-auto overflow-hidden shadow-elegant">
      <CardContent className="p-0">
        {/* Bank card dimensions: aspect ratio 1.586:1 (85.6mm x 53.98mm) */}
        <div className="relative bg-gradient-to-t from-[hsl(82,13%,36%)] via-[hsl(82,13%,46%)] to-[hsl(82,54%,85%)] p-8 aspect-[1.586/1] flex flex-col justify-between">
          {/* Top Section: Logo and QR Code */}
          <div className="flex items-start justify-between">
            <img 
              src={kumiiLogo} 
              alt="Kumii Logo" 
              className="h-12 w-auto drop-shadow-md mix-blend-multiply opacity-90"
              style={{ filter: 'brightness(1.1)' }}
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
              <p className="text-xs text-white/90 font-medium italic">
                All-In-One Platform for Your Business
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

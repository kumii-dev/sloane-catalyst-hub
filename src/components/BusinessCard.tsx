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
    <Card className="w-full max-w-[350px] mx-auto overflow-hidden shadow-strong">
      <CardContent className="p-0">
        {/* Front of card */}
        <div className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary p-6 space-y-4">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <img 
              src={kumiiLogo} 
              alt="Kumii Logo" 
              className="h-8 w-auto"
            />
            <div className="bg-background/10 p-2 rounded">
              <QRCodeSVG 
                value={platformUrl}
                size={64}
                level="H"
                bgColor="transparent"
                fgColor="#ffffff"
              />
            </div>
          </div>

          {/* Name and Title */}
          <div className="space-y-1 pt-2">
            <h3 className="text-xl font-bold text-primary-foreground">
              {name}
            </h3>
            <p className="text-sm text-primary-foreground/90 font-medium">
              {title}
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 pt-2 border-t border-primary-foreground/20">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{phone}</span>
            </div>
          </div>

          {/* Tagline */}
          <div className="pt-2">
            <p className="text-xs text-primary-foreground/70 italic">
              Building Your Business
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

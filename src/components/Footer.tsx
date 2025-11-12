import { Building2, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/kumii-logo.png";

const Footer = () => {
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Access to Capital", href: "/funding" },
        { name: "Market Access", href: "/access-to-market" },
        { name: "Expert Advisory", href: "/find-advisor" },
        { name: "Mentorship & Learning", href: "/mentorship" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Success Stories", href: "#stories" },
        { name: "Knowledge Base", href: "#knowledge" },
        { name: "Webinars", href: "#webinars" },
        { name: "Blog", href: "#blog" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help-center" },
        { name: "Contact Us", href: "/contact-us" },
        { name: "API Documentation", href: "/api-documentation" },
        { name: "System Status", href: "/system-status" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#careers" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms of Service", href: "/terms-and-conditions" }
      ]
    }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <img 
                  src={logo} 
                  alt="Kumii" 
                  className="h-12 w-auto mb-2"
                />
              </div>
              
              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                Empowering SMMEs and startups across Africa with access to essential services, 
                funding opportunities, and expert mentorship for sustainable growth.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>Johannesburg, South Africa</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>info@kumii.africa</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>+27 11 123 4567</span>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-lg mb-4 text-accent">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-primary-foreground/80 hover:text-accent transition-smooth text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 pt-8 border-t border-primary-foreground/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-semibold text-xl mb-2 text-accent">Stay Updated</h3>
                <p className="text-primary-foreground/80">
                  Get the latest updates on funding opportunities, new services, and success stories.
                </p>
              </div>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button variant="hero">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-primary-foreground/80">
              © 2024 Kumii Marketplace. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-accent hover:text-primary transition-smooth"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-accent hover:text-primary transition-smooth"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-accent hover:text-primary transition-smooth"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
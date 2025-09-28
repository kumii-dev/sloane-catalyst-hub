import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const TopNavbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { 
      title: "Access to Market", 
      href: "/access-to-market",
      description: "Connect with market opportunities"
    },
    { 
      title: "Services", 
      href: "/services",
      description: "Professional services for growth" 
    },
    { 
      title: "Funding", 
      href: "/funding",
      description: "Access capital for your business"
    },
    { 
      title: "Mentorship", 
      href: "/mentorship",
      description: "Get guidance from experts"
    },
    { 
      title: "Resources", 
      href: "/resources",
      description: "Tools and knowledge for success"
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="h-14 bg-background border-b border-border px-4 flex items-center justify-between w-full">
      {/* Left - Brand */}
      <div className="flex items-center gap-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">22</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">22 On</span>
            <span className="text-xs text-muted-foreground">Sloane</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 ml-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href) 
                  ? 'text-primary border-b-2 border-primary pb-4' 
                  : 'text-muted-foreground'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right - User Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">About</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-sm"
            >
              Sign Out
            </Button>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">About</span>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm" className="text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
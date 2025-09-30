import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/22-on-sloane-logo.png";

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
    <header className="h-14 bg-primary border-b border-primary-dark px-4 flex items-center w-full shadow-orange">
      {/* Left - Brand */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="22 On Sloane" 
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Center-Right - Navigation Links */}
      <nav className="hidden lg:flex items-center space-x-6 flex-1 justify-center ml-32">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`text-sm font-medium transition-colors ${
              isActive(item.href) 
                ? 'text-white border-b-2 border-white pb-4' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Right - User Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80">About</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-sm text-white hover:text-white hover:bg-white/10"
            >
              Sign Out
            </Button>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80">About</span>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm text-white hover:text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary" size="sm" className="text-sm">
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
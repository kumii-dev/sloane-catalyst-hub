import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Menu, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/kumi-logo.png";

interface TopNavbarProps {
  onMenuToggle?: () => void;
}

const TopNavbar = ({ onMenuToggle }: TopNavbarProps) => {
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
    <header className="h-16 bg-gradient-to-r from-white via-white via-30% via-primary-light via-60% to-primary border-b border-primary-dark/20 px-4 flex items-center w-full shadow-medium sticky top-0 z-50">
      {/* Hamburger Menu - Mobile/Tablet */}
      {onMenuToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden mr-2 text-primary-dark hover:bg-primary-light/20"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
      
      {/* Left - Brand */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="Kumii" 
            className="h-16 sm:h-20 w-auto"
          />
        </Link>
      </div>

      {/* Center-Right - Navigation Links */}
      <nav className="flex items-center space-x-4 md:space-x-6 flex-1 justify-center md:ml-32 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`text-base font-semibold whitespace-nowrap transition-colors ${
              isActive(item.href) 
                ? 'text-primary-dark border-b-2 border-primary-dark pb-4' 
                : 'text-primary-dark/80 hover:text-primary-dark'
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Right - User Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/about" className="text-sm sm:text-base text-foreground font-medium hidden md:inline hover:text-foreground/80 transition-colors">About</Link>
            <div className="text-foreground">
              <NotificationBell />
            </div>
            <Link to="/edit-profile">
              <Button
                variant="ghost"
                size="sm"
              className="text-sm sm:text-base text-foreground hover:text-foreground hover:bg-foreground/10 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-sm sm:text-base text-foreground hover:text-foreground hover:bg-foreground/10 hidden sm:flex"
            >
              Sign Out
            </Button>
            <span className="text-xs text-foreground/70 hidden lg:inline max-w-[150px] truncate">
              {user.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-foreground/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-foreground/20 transition-colors lg:hidden">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/edit-profile" className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/about" className="text-sm sm:text-base text-foreground font-medium hidden md:inline hover:text-foreground/80 transition-colors">About</Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm sm:text-base hover:bg-foreground/10 hidden sm:flex">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary" size="sm" className="text-sm sm:text-base font-semibold">
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
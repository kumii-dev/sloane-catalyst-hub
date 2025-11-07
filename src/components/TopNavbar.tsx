import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { AdminRoleSwitcher } from "@/components/admin/AdminRoleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/kumii-logo.png";

interface TopNavbarProps {
  onMenuToggle?: () => void;
}

const TopNavbar = ({ onMenuToggle }: TopNavbarProps) => {
  const { user, signOut } = useAuth();

  // Authorized emails for system documentation access
  const authorizedEmails = ['nkambumw@gmail.com', 'nkambumw@protonmail.com'];
  const hasSystemAccess = user?.email && authorizedEmails.includes(user.email);

  return (
    <header className="h-16 bg-gradient-to-r from-white via-white via-30% via-primary-light via-60% to-primary border-b border-primary-dark/20 px-4 flex items-center justify-between w-full shadow-medium sticky top-0 z-50">
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
            className="h-16 sm:h-20 w-auto object-cover object-top"
            style={{ clipPath: 'inset(0 0 15% 0)' }}
          />
        </Link>
      </div>

      {/* Right - User Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <AdminRoleSwitcher />
            <Link to="/about" className="text-sm sm:text-base text-foreground font-medium hidden md:inline hover:text-foreground/80 transition-colors">About</Link>
            {hasSystemAccess && (
              <Link to="/system-documentation" className="text-sm sm:text-base text-foreground font-medium hidden md:inline hover:text-foreground/80 transition-colors">System</Link>
            )}
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
            <ThemeToggle />
            <Link to="/about" className="text-sm sm:text-base text-foreground font-medium hidden md:inline hover:text-foreground/80 transition-colors">About</Link>
            {hasSystemAccess && (
              <Link to="/system-documentation" className="text-sm sm:text-base text-foreground font-medium hidden md:inline hover:text-foreground/80 transition-colors">System</Link>
            )}
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
import { useState } from "react";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/kumi-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Access to Market", href: "/access-to-market" },
    { name: "Services", href: "/services", hasDropdown: true },
    { name: "Funding", href: "/funding" },
    { name: "Mentorship", href: "/mentorship" },
    { name: "Resources", href: "/resources", hasDropdown: true },
    { name: "About", href: "#about" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white via-white via-30% via-primary-light via-60% to-primary backdrop-blur-md border-b border-primary-dark/20 shadow-medium">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Kumii" 
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.href.startsWith('#') ? (
                  <a
                    href={item.href}
                    className="flex items-center gap-1 text-primary-dark/80 hover:text-primary-dark transition-smooth font-semibold text-base"
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1 text-primary-dark/80 hover:text-primary-dark transition-smooth font-semibold text-base"
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </Link>
                )}
                
                {/* Dropdown would go here for items with hasDropdown */}
              </div>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20 text-base font-semibold">
                    <User className="w-5 h-5 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20 text-base font-semibold" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="secondary" className="text-base font-semibold" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:text-white/80 transition-smooth"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                item.href.startsWith('#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white/90 hover:text-white transition-smooth font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white/90 hover:text-white transition-smooth font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              <div className="pt-4 border-t border-white/20 flex flex-col space-y-3">
                {user ? (
                  <Button variant="outline" onClick={signOut} className="w-full border-white/30 text-white hover:bg-white/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button variant="secondary" className="w-full" asChild>
                      <Link to="/auth">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
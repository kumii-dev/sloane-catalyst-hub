import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import TopNavbar from "@/components/TopNavbar";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  hideSecondarySidebar?: boolean;
}

export function Layout({ children, showSidebar = false, hideSecondarySidebar = false }: LayoutProps) {
  const [selectedPrimary, setSelectedPrimary] = useState("apps");
  const [showSecondary, setShowSecondary] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const isTablet = typeof window !== 'undefined' && window.innerWidth <= 1024;

  // Auto-collapse sidebar on mobile/tablet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth <= 1024) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      };
      
      // Initial check
      handleResize();
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handlePrimarySelect = (id: string) => {
    if (selectedPrimary === id) {
      setShowSecondary(!showSecondary);
    } else {
      setSelectedPrimary(id);
      setShowSecondary(true);
    }
    
    // Auto-close sidebar on mobile after selection
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  };

  if (!showSidebar) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full flex-col">
      {/* Top Navigation - Full Width */}
      <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (isMobile || isTablet) && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Collapsible on mobile */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative
          z-50 lg:z-auto
          h-full
          transition-transform duration-300 ease-in-out
        `}>
          <AppSidebar 
            selectedPrimary={selectedPrimary}
            onPrimarySelect={handlePrimarySelect}
            showSecondary={hideSecondarySidebar || isMobile || isTablet ? false : showSecondary}
            onNavigate={() => {
              if (isMobile || isTablet) {
                setSidebarOpen(false);
              }
            }}
          />
        </div>
        
        <main className="flex-1 overflow-auto main-gradient-light w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
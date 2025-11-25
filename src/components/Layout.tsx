import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import TopNavbar from "@/components/TopNavbar";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { FloatingAIChat } from "@/components/FloatingAIChat";
import { FloatingProfileBadge } from "@/components/FloatingProfileBadge";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  hideSecondarySidebar?: boolean;
}

export function Layout({ children, showSidebar = true, hideSecondarySidebar = false }: LayoutProps) {
  const location = useLocation();
  const [selectedPrimary, setSelectedPrimary] = useState("apps");
  const [showSecondary, setShowSecondary] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 768 : false));
  const isMobile = useIsMobile();
  const isTablet = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Auto-select sidebar section based on current route
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/activity' || path === '/my-activity' || path === '/notifications') {
      setSelectedPrimary('activity');
      setShowSecondary(true);
    } else if (path === '/messaging' || path === '/messaging-hub' || path.startsWith('/messaging')) {
      setSelectedPrimary('messaging');
      setShowSecondary(true);
    } else if (path === '/calendar') {
      setSelectedPrimary('calendar');
      setShowSecondary(true);
    } else if (path === '/files' || path.startsWith('/files')) {
      setSelectedPrimary('files');
      setShowSecondary(true);
    } else if (path === '/copilot' || path.startsWith('/copilot')) {
      setSelectedPrimary('copilot');
      setShowSecondary(true);
    } else if (
      path.startsWith('/access-to-market') ||
      path.startsWith('/funding') ||
      path.startsWith('/credit-score') ||
      path.startsWith('/mentorship') ||
      path.startsWith('/find-advisor') ||
      path.startsWith('/resources')
    ) {
      setSelectedPrimary('apps');
      setShowSecondary(true);
    }
  }, [location.pathname]);

  // Auto-collapse sidebar on mobile/tablet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth <= 768) {
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

  // Ensure sidebar opens on desktop after route changes (e.g., post-auth redirects)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setSidebarOpen(true);
    }
  }, [location.pathname]);

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
        <FloatingAIChat />
        <FloatingProfileBadge />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col w-full overflow-hidden">
      {/* Top Navigation - Full Width */}
      <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex relative overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (isMobile || isTablet) && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Fixed height, always visible */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:static
          top-14 md:top-0
          left-0
          h-[calc(100vh-3.5rem)] md:h-full
          z-40 md:z-auto
          transition-transform duration-300 ease-in-out
          flex-shrink-0
        `}>
          <AppSidebar 
            selectedPrimary={selectedPrimary}
            onPrimarySelect={handlePrimarySelect}
            showSecondary={hideSecondarySidebar ? false : showSecondary}
            onNavigate={() => {
              if (isMobile || isTablet) {
                setSidebarOpen(false);
              }
            }}
          />
        </div>
        
        {/* Main Content - Independent scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden main-gradient-light">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 w-full">
            {children}
          </div>
        </main>
      </div>
      <FloatingAIChat />
      <FloatingProfileBadge />
    </div>
  );
}
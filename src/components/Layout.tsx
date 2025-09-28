import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import TopNavbar from "@/components/TopNavbar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = false }: LayoutProps) {
  const [selectedPrimary, setSelectedPrimary] = useState("apps");
  const [showSecondary, setShowSecondary] = useState(true);

  const handlePrimarySelect = (id: string) => {
    if (selectedPrimary === id) {
      setShowSecondary(!showSecondary);
    } else {
      setSelectedPrimary(id);
      setShowSecondary(true);
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
      <TopNavbar />
      
      <div className="flex-1 flex">
        <AppSidebar 
          selectedPrimary={selectedPrimary}
          onPrimarySelect={handlePrimarySelect}
          showSecondary={showSecondary}
        />
        
        <main className="flex-1 overflow-auto main-gradient-light">
          <div className="max-w-6xl mx-auto px-6 py-4 max-h-[36vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
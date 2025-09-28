import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
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
    <div className="min-h-screen flex w-full">
      <AppSidebar 
        selectedPrimary={selectedPrimary}
        onPrimarySelect={handlePrimarySelect}
        showSecondary={showSecondary}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-12 flex items-center bg-background border-b border-border px-4">
          {/* Breadcrumb/Navigation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>←</span>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search (Ctrl+E)" 
                className="pl-10 h-8 bg-muted/30"
              />
            </div>
          </div>

          {/* Right side - Profile and actions */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-success rounded-full"></div>
            <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-xs text-white">
              37
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">GEN Africa 22 ON SL...</span>
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                <span className="text-xs font-bold text-accent-foreground">MN</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
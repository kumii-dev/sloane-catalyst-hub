import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Activity,
  MessageCircle, 
  Calendar,
  Phone,
  FolderOpen,
  Bot,
  Grid3X3,
  MoreHorizontal,
  Bell,
  Search,
  Users,
  CreditCard,
  TrendingUp,
  Briefcase,
  BookOpen,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Primary sidebar items (narrow vertical bar)
const primaryNavItems = [
  { icon: Activity, id: "activity", title: "Activity", badge: 3 },
  { icon: MessageCircle, id: "chat", title: "Chat", badge: null },
  { icon: Calendar, id: "calendar", title: "Calendar", badge: null },
  { icon: Phone, id: "calls", title: "Calls", badge: null },
  { icon: FolderOpen, id: "files", title: "Files", badge: null },
  { icon: Bot, id: "copilot", title: "Copilot", badge: null },
  { icon: Grid3X3, id: "apps", title: "Apps", badge: null },
  { icon: MoreHorizontal, id: "more", title: "More", badge: null },
];

// Secondary sidebar content based on selected primary item
const secondaryContent = {
  activity: {
    title: "Activity",
    items: [
      { title: "Feed", url: "/activity" },
      { title: "My Activity", url: "/my-activity" },
      { title: "Notifications", url: "/notifications" },
    ]
  },
  chat: {
    title: "Chat",
    items: [
      { title: "Recent", url: "/chat" },
      { title: "Contacts", url: "/contacts" },
      { title: "Teams", url: "/teams" },
    ]
  },
  apps: {
    title: "Apps", 
    items: [
      { title: "Access To Market", url: "/access-to-market" },
      { title: "Access To Capital", url: "/funding" },
      { title: "Credit Scoring", url: "/credit-score" },
      { title: "Mentorship", url: "/mentorship" },
      { title: "Professional Services", url: "/services" },
      { title: "Resources", url: "/resources" },
    ]
  },
  more: {
    title: "More",
    items: [
      { title: "Settings", url: "/settings" },
      { title: "Help", url: "/help" },
      { title: "About", url: "/about" },
    ]
  }
};

interface AppSidebarProps {
  selectedPrimary: string;
  onPrimarySelect: (id: string) => void;
  showSecondary: boolean;
}

export function AppSidebar({ selectedPrimary, onPrimarySelect, showSecondary }: AppSidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  const selectedContent = secondaryContent[selectedPrimary as keyof typeof secondaryContent];

  return (
    <div className="flex h-full">
      {/* Primary Navigation Bar */}
      <div className="w-16 bg-primary flex flex-col items-center py-4 border-r border-border">
        <div className="flex flex-col gap-2 flex-1">
          {primaryNavItems.map((item) => (
            <div key={item.id} className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPrimarySelect(item.id)}
                className={`w-12 h-12 p-0 relative hover:bg-primary-light transition-colors ${
                  selectedPrimary === item.id ? 'bg-primary-light' : ''
                }`}
                title={item.title}
              >
                <item.icon className="h-5 w-5 text-primary-foreground" />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
              {selectedPrimary === item.id && (
                <div className="absolute left-0 top-0 w-1 h-12 bg-accent rounded-r" />
              )}
            </div>
          ))}
        </div>
        
        <Separator className="w-8 my-2 bg-primary-light" />
        
        {/* Profile section at bottom */}
        <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 hover:bg-primary-light"
          title="Profile"
        >
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-accent-foreground">MN</span>
          </div>
        </Button>
      </div>

      {/* Secondary Sidebar */}
      {showSecondary && selectedContent && (
        <div className="w-[250px] bg-background border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            {selectedPrimary === 'apps' ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search apps and more" 
                  className="pl-10 h-9 bg-muted/50 border-muted"
                />
              </div>
            ) : (
              <h2 className="font-semibold text-lg text-foreground">{selectedContent.title}</h2>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {selectedPrimary === 'apps' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">Growth Gateway</h3>
                  <div className="space-y-1">
                    {selectedContent.items.map((item) => (
                      <Link
                        key={item.url}
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(item.url) 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                          <TrendingUp className="h-3 w-3 text-primary-foreground" />
                        </div>
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">Categories</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      "Financial Services & FinTech",
                      "Health & HealthTech", 
                      "Education & EdTech",
                      "Agriculture & AgriTech",
                      "ICT & Software Development",
                      "Energy & GreenTech"
                    ].map((category) => (
                      <Button
                        key={category}
                        variant="ghost"
                        className="justify-start h-auto p-2 text-xs text-left"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {selectedContent.items.map((item) => (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.url) 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
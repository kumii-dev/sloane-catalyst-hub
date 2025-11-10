import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  ChevronDown,
  ChevronUp,
  House,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Primary sidebar items (narrow vertical bar)
const primaryNavItems = [
  { icon: Activity, id: "activity", title: "Activity", badge: 3 },
  { icon: MessageCircle, id: "messaging", title: "Messaging Hub", badge: null },
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
  messaging: {
    title: "Messaging Hub",
    items: [
      { title: "Recent Messages", url: "/messaging" },
      { title: "All Contacts", url: "/messaging?tab=contacts" },
      { title: "Teams & Groups", url: "/messaging?tab=teams" },
      { title: "Pinned", url: "/messaging?tab=pinned" },
    ]
  },
  calendar: {
    title: "Calendar",
    items: [
      { title: "My Calendar", url: "/calendar" },
      { title: "Upcoming Events", url: "/calendar?view=upcoming" },
      { title: "Past Events", url: "/calendar?view=past" },
    ]
  },
  files: {
    title: "Files",
    items: [
      { title: "All Files", url: "/files" },
      { title: "Recent", url: "/files?tab=recent" },
      { title: "Shared with Me", url: "/files?tab=shared" },
      { title: "Folders", url: "/files?tab=folders" },
    ]
  },
  copilot: {
    title: "Kumii AI Assistant",
    items: [
      { title: "Chat", url: "/copilot" },
      { title: "Business Strategy", url: "/copilot?focus=strategy" },
      { title: "Funding Advice", url: "/copilot?focus=funding" },
      { title: "Market Analysis", url: "/copilot?focus=market" },
    ]
  },
  apps: {
    title: "Apps", 
    items: [
      { title: "Access To Market", url: "/access-to-market" },
      { title: "Access To Capital", url: "/funding" },
      { title: "Credit Scoring", url: "/credit-score" },
      { title: "Mentorship", url: "/mentorship" },
      { title: "Professional Services", url: "/find-advisor" },
      { title: "Software Services", url: "/services/category/software-services" },
      { title: "Resources", url: "/resources" },
    ]
  },
  more: {
    title: "More",
    items: [
      { title: "Early Adopter Registration", url: "/register" },
      { title: "Settings", url: "/settings" },
      { title: "Help", url: "/help" },
      { title: "About", url: "/about" },
    ]
  }
};

// Dynamic subcategory mapping for each main app
const appSubcategories: Record<string, Array<{ title: string; url: string }>> = {
  "Access To Market": [
    { title: "Credit Score Check", url: "/credit-score" },
    { title: "Document Generator", url: "/access-to-market/document-generator" },
    { title: "Financial Model Builder", url: "/access-to-market/financial-model" },
    { title: "Universal Valuation Model", url: "/access-to-market/valuation" },
    { title: "Smart Matching", url: "/smart-matching" },
    { title: "Funding Opportunities", url: "/funding" },
    { title: "Funder Directory", url: "/funding" },
  ],
  "Access To Capital": [
    { title: "Opportunities", url: "/funding" },
    { title: "Funders", url: "/funding" },
    { title: "Insights", url: "/funding" },
  ],
  "Credit Scoring": [
    { title: "360° Credit Scoring", url: "/credit-score" },
    { title: "Alternative Data Sources", url: "/credit-score" },
    { title: "Funder-Grade Reports", url: "/credit-score" },
    { title: "Trusted by Funders", url: "/credit-score" },
  ],
  "Mentorship": [
    { title: "My Sessions (Mentee)", url: "/mentee-dashboard" },
    { title: "Mentor Dashboard", url: "/mentor-dashboard" },
    { title: "Find a Mentor", url: "/find-mentor" },
    { title: "Become a Mentor", url: "/become-mentor" },
    { title: "Browse Categories", url: "/mentorship" },
  ],
  "Professional Services": [
    { title: "Business Operations & Productivity", url: "/find-advisor" },
    { title: "Customer Relationship & Sales", url: "/find-advisor" },
    { title: "Professional & Ancillary Services", url: "/find-advisor" },
    { title: "Growth and Development Services", url: "/find-advisor" },
    { title: "eCommerce & Retail", url: "/find-advisor" },
    { title: "Cybersecurity & Compliance", url: "/find-advisor" },
    { title: "Data, AI & Analytics", url: "/find-advisor" },
    { title: "Cloud, Hosting & Infrastructure", url: "/find-advisor" },
    { title: "Project Management & Collaboration", url: "/find-advisor" },
    { title: "HR & People Development", url: "/find-advisor" },
    { title: "Legal, Risk & Governance", url: "/find-advisor" },
    { title: "Industry-Specific Solutions", url: "/find-advisor" },
    { title: "Developer & Tech Tools", url: "/find-advisor" },
    { title: "Integration & Automation", url: "/find-advisor" },
    { title: "Startup Support & Advisory", url: "/find-advisor" },
  ],
  "Resources": [
    { title: "Learning Hub", url: "/resources" },
    { title: "Knowledge Library", url: "/resources" },
    { title: "Tools & Downloads", url: "/resources" },
    { title: "Community & Networking", url: "/resources" },
    { title: "Support & Help Center", url: "/resources" },
  ],
  "Software Services": [
    { title: "Business Operations & Productivity", url: "/services/category/sw-business-operations-productivity" },
    { title: "Customer Relationship & Sales", url: "/services/category/sw-customer-relationship-sales" },
    { title: "Accounting & Finance", url: "/services/category/sw-accounting-finance" },
    { title: "Marketing, Branding & Analytics", url: "/services/category/sw-marketing-branding-analytics" },
    { title: "eCommerce & Retail", url: "/services/category/sw-ecommerce-retail" },
    { title: "Cybersecurity & Compliance", url: "/services/category/sw-cybersecurity-compliance" },
    { title: "Data, AI & Analytics", url: "/services/category/sw-data-ai-analytics" },
    { title: "Cloud, Hosting & Infrastructure", url: "/services/category/sw-cloud-hosting-infrastructure" },
    { title: "Project Management & Collaboration", url: "/services/category/sw-project-management-collaboration" },
    { title: "HR & People Development", url: "/services/category/sw-hr-people-development" },
    { title: "Legal, Risk & Governance", url: "/services/category/sw-legal-risk-governance" },
    { title: "Industry-Specific Solutions", url: "/services/category/sw-industry-specific-solutions" },
    { title: "Developer & Tech Tools", url: "/services/category/sw-developer-tech-tools" },
    { title: "Integration & Automation", url: "/services/category/sw-integration-automation" },
    { title: "Startup Support & Advisory", url: "/services/category/sw-startup-support-advisory" },
  ],
};

interface AppSidebarProps {
  selectedPrimary: string;
  onPrimarySelect: (id: string) => void;
  showSecondary: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ selectedPrimary, onPrimarySelect, showSecondary, onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);
  const [userInitials, setUserInitials] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.first_name && profile?.last_name) {
        setUserInitials(`${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase());
      } else if (profile?.first_name) {
        setUserInitials(profile.first_name.charAt(0).toUpperCase());
      } else if (user.email) {
        setUserInitials(user.email.charAt(0).toUpperCase());
      }
    };

    fetchUserProfile();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;
  
  const selectedContent = secondaryContent[selectedPrimary as keyof typeof secondaryContent];
  
  // Auto-detect selected app based on current route (supports deep routes)
  const currentPath = location.pathname;
  let selectedApp = selectedContent?.items.find(item => isActive(item.url))?.title || null;
  if (!selectedApp) {
    if (currentPath.startsWith('/services/category/')) selectedApp = 'Software Services';
  }
  
  // Get subcategories for the selected app
  const subcategories = selectedApp ? appSubcategories[selectedApp] || [] : [];
  const visibleSubcategories = showAllSubcategories ? subcategories : subcategories.slice(0, 5);
  const hasMoreSubcategories = subcategories.length > 5;

  return (
    <div className="flex h-screen bg-background shadow-lg lg:shadow-none">
      {/* Primary Navigation Bar */}
      <div className="w-16 bg-primary flex flex-col items-center py-4 border-r border-border flex-shrink-0">
        {/* Home Button */}
        <Link to="/access-to-market" className="mb-4" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-primary-light transition-colors"
            title="Home"
          >
            <House className="h-5 w-5 text-primary-foreground" />
          </Button>
        </Link>
        
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
        <Link to="/edit-profile" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-primary-light"
            title="Profile"
          >
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent-foreground">{userInitials || "U"}</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Secondary Sidebar */}
      {showSecondary && selectedContent && (
        <div className="w-[250px] sm:w-[280px] bg-background border-r border-border flex flex-col flex-shrink-0">
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
                        onClick={() => {
                          setShowAllSubcategories(false);
                          onNavigate?.();
                        }}
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

                {/* Dynamic Subcategories */}
                {selectedApp && subcategories.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">{selectedApp}</h3>
                    <div className="space-y-1">
                      {visibleSubcategories.map((subcat) => (
                        <Link
                          key={subcat.title}
                          to={subcat.url}
                          onClick={onNavigate}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(subcat.url) 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          {subcat.title}
                        </Link>
                      ))}
                      
                      {hasMoreSubcategories && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                          className="w-full justify-between h-auto px-3 py-2 text-sm hover:bg-muted"
                        >
                          <span>{showAllSubcategories ? 'Show Less' : 'More'}</span>
                          {showAllSubcategories ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {selectedContent.items.map((item) => (
                  <Link
                    key={item.url}
                    to={item.url}
                    onClick={onNavigate}
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
}import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  ChevronDown,
  ChevronUp,
  House,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Primary sidebar items (narrow vertical bar)
const primaryNavItems = [
  { icon: Activity, id: "activity", title: "Activity", badge: 3 },
  { icon: MessageCircle, id: "messaging", title: "Messaging Hub", badge: null },
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
  messaging: {
    title: "Messaging Hub",
    items: [
      { title: "Recent Messages", url: "/messaging" },
      { title: "All Contacts", url: "/messaging?tab=contacts" },
      { title: "Teams & Groups", url: "/messaging?tab=teams" },
      { title: "Pinned", url: "/messaging?tab=pinned" },
    ]
  },
  calendar: {
    title: "Calendar",
    items: [
      { title: "My Calendar", url: "/calendar" },
      { title: "Upcoming Events", url: "/calendar?view=upcoming" },
      { title: "Past Events", url: "/calendar?view=past" },
    ]
  },
  files: {
    title: "Files",
    items: [
      { title: "All Files", url: "/files" },
      { title: "Recent", url: "/files?tab=recent" },
      { title: "Shared with Me", url: "/files?tab=shared" },
      { title: "Folders", url: "/files?tab=folders" },
    ]
  },
  copilot: {
    title: "Kumii AI Assistant",
    items: [
      { title: "Chat", url: "/copilot" },
      { title: "Business Strategy", url: "/copilot?focus=strategy" },
      { title: "Funding Advice", url: "/copilot?focus=funding" },
      { title: "Market Analysis", url: "/copilot?focus=market" },
    ]
  },
  apps: {
    title: "Apps", 
    items: [
      { title: "Access To Market", url: "/access-to-market" },
      { title: "Access To Capital", url: "/funding" },
      { title: "Credit Scoring", url: "/credit-score" },
      { title: "Mentorship", url: "/mentorship" },
      { title: "Professional Services", url: "/find-advisor" },
      { title: "Software Services", url: "/services/category/software-services" },
      { title: "Resources", url: "/resources" },
    ]
  },
  more: {
    title: "More",
    items: [
      { title: "Early Adopter Registration", url: "/register" },
      { title: "Settings", url: "/settings" },
      { title: "Help", url: "/help" },
      { title: "About", url: "/about" },
    ]
  }
};

// Dynamic subcategory mapping for each main app
const appSubcategories: Record<string, Array<{ title: string; url: string }>> = {
  "Access To Market": [
    { title: "Credit Score Check", url: "/credit-score" },
    { title: "Document Generator", url: "/access-to-market/document-generator" },
    { title: "Financial Model Builder", url: "/access-to-market/financial-model" },
    { title: "Universal Valuation Model", url: "/access-to-market/valuation" },
    { title: "Smart Matching", url: "/smart-matching" },
    { title: "Funding Opportunities", url: "/funding" },
    { title: "Funder Directory", url: "/funding" },
  ],
  "Access To Capital": [
    { title: "Opportunities", url: "/funding" },
    { title: "Funders", url: "/funding" },
    { title: "Insights", url: "/funding" },
  ],
  "Credit Scoring": [
    { title: "360° Credit Scoring", url: "/credit-score" },
    { title: "Alternative Data Sources", url: "/credit-score" },
    { title: "Funder-Grade Reports", url: "/credit-score" },
    { title: "Trusted by Funders", url: "/credit-score" },
  ],
  "Mentorship": [
    { title: "My Sessions (Mentee)", url: "/mentee-dashboard" },
    { title: "Mentor Dashboard", url: "/mentor-dashboard" },
    { title: "Find a Mentor", url: "/find-mentor" },
    { title: "Become a Mentor", url: "/become-mentor" },
    { title: "Browse Categories", url: "/mentorship" },
  ],
  "Professional Services": [
    { title: "Business Operations & Productivity", url: "/find-advisor" },
    { title: "Customer Relationship & Sales", url: "/find-advisor" },
    { title: "Professional & Ancillary Services", url: "/find-advisor" },
    { title: "Growth and Development Services", url: "/find-advisor" },
    { title: "eCommerce & Retail", url: "/find-advisor" },
    { title: "Cybersecurity & Compliance", url: "/find-advisor" },
    { title: "Data, AI & Analytics", url: "/find-advisor" },
    { title: "Cloud, Hosting & Infrastructure", url: "/find-advisor" },
    { title: "Project Management & Collaboration", url: "/find-advisor" },
    { title: "HR & People Development", url: "/find-advisor" },
    { title: "Legal, Risk & Governance", url: "/find-advisor" },
    { title: "Industry-Specific Solutions", url: "/find-advisor" },
    { title: "Developer & Tech Tools", url: "/find-advisor" },
    { title: "Integration & Automation", url: "/find-advisor" },
    { title: "Startup Support & Advisory", url: "/find-advisor" },
  ],
  "Resources": [
    { title: "Learning Hub", url: "/resources" },
    { title: "Knowledge Library", url: "/resources" },
    { title: "Tools & Downloads", url: "/resources" },
    { title: "Community & Networking", url: "/resources" },
    { title: "Support & Help Center", url: "/resources" },
  ],
  "Software Services": [
    { title: "Business Operations & Productivity", url: "/services/category/sw-business-operations-productivity" },
    { title: "Customer Relationship & Sales", url: "/services/category/sw-customer-relationship-sales" },
    { title: "Accounting & Finance", url: "/services/category/sw-accounting-finance" },
    { title: "Marketing, Branding & Analytics", url: "/services/category/sw-marketing-branding-analytics" },
    { title: "eCommerce & Retail", url: "/services/category/sw-ecommerce-retail" },
    { title: "Cybersecurity & Compliance", url: "/services/category/sw-cybersecurity-compliance" },
    { title: "Data, AI & Analytics", url: "/services/category/sw-data-ai-analytics" },
    { title: "Cloud, Hosting & Infrastructure", url: "/services/category/sw-cloud-hosting-infrastructure" },
    { title: "Project Management & Collaboration", url: "/services/category/sw-project-management-collaboration" },
    { title: "HR & People Development", url: "/services/category/sw-hr-people-development" },
    { title: "Legal, Risk & Governance", url: "/services/category/sw-legal-risk-governance" },
    { title: "Industry-Specific Solutions", url: "/services/category/sw-industry-specific-solutions" },
    { title: "Developer & Tech Tools", url: "/services/category/sw-developer-tech-tools" },
    { title: "Integration & Automation", url: "/services/category/sw-integration-automation" },
    { title: "Startup Support & Advisory", url: "/services/category/sw-startup-support-advisory" },
  ],
};

interface AppSidebarProps {
  selectedPrimary: string;
  onPrimarySelect: (id: string) => void;
  showSecondary: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ selectedPrimary, onPrimarySelect, showSecondary, onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);
  const [userInitials, setUserInitials] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.first_name && profile?.last_name) {
        setUserInitials(`${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase());
      } else if (profile?.first_name) {
        setUserInitials(profile.first_name.charAt(0).toUpperCase());
      } else if (user.email) {
        setUserInitials(user.email.charAt(0).toUpperCase());
      }
    };

    fetchUserProfile();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;
  
  const selectedContent = secondaryContent[selectedPrimary as keyof typeof secondaryContent];
  
  // Auto-detect selected app based on current route (supports deep routes)
  const currentPath = location.pathname;
  let selectedApp = selectedContent?.items.find(item => isActive(item.url))?.title || null;
  if (!selectedApp) {
    if (currentPath.startsWith('/services/category/')) selectedApp = 'Software Services';
  }
  
  // Get subcategories for the selected app
  const subcategories = selectedApp ? appSubcategories[selectedApp] || [] : [];
  const visibleSubcategories = showAllSubcategories ? subcategories : subcategories.slice(0, 5);
  const hasMoreSubcategories = subcategories.length > 5;

  return (
    <div className="flex h-screen bg-background shadow-lg lg:shadow-none">
      {/* Primary Navigation Bar */}
      <div className="w-16 bg-primary flex flex-col items-center py-4 border-r border-border flex-shrink-0">
        {/* Home Button */}
        <Link to="/access-to-market" className="mb-4" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-primary-light transition-colors"
            title="Home"
          >
            <House className="h-5 w-5 text-primary-foreground" />
          </Button>
        </Link>
        
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
        <Link to="/edit-profile" onClick={onNavigate}>
          <Button
            variant="ghost"
            size="sm"
            className="w-12 h-12 p-0 hover:bg-primary-light"
            title="Profile"
          >
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-accent-foreground">{userInitials || "U"}</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Secondary Sidebar */}
      {showSecondary && selectedContent && (
        <div className="w-[250px] sm:w-[280px] bg-background border-r border-border flex flex-col flex-shrink-0">
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
                        onClick={() => {
                          setShowAllSubcategories(false);
                          onNavigate?.();
                        }}
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

                {/* Dynamic Subcategories */}
                {selectedApp && subcategories.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">{selectedApp}</h3>
                    <div className="space-y-1">
                      {visibleSubcategories.map((subcat) => (
                        <Link
                          key={subcat.title}
                          to={subcat.url}
                          onClick={onNavigate}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(subcat.url) 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          {subcat.title}
                        </Link>
                      ))}
                      
                      {hasMoreSubcategories && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                          className="w-full justify-between h-auto px-3 py-2 text-sm hover:bg-muted"
                        >
                          <span>{showAllSubcategories ? 'Show Less' : 'More'}</span>
                          {showAllSubcategories ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {selectedContent.items.map((item) => (
                  <Link
                    key={item.url}
                    to={item.url}
                    onClick={onNavigate}
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
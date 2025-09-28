import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Grid3X3,
  Inbox,
  List,
  CreditCard,
  Users,
  UserCircle,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mainNavItems = [
  {
    title: "Discover",
    icon: Grid3X3,
    url: "/",
  },
  {
    title: "Inbox",
    icon: Inbox,
    url: "/inbox",
  },
  {
    title: "Listings",
    icon: List,
    url: "/listings",
  },
  {
    title: "Subscription",
    icon: CreditCard,
    url: "/subscription",
  },
  {
    title: "Mentoring",
    icon: Users,
    url: "/mentorship",
  },
  {
    title: "Account",
    icon: UserCircle,
    url: "/account",
  },
];

const growthGatewayItems = [
  {
    title: "Access To Market",
    url: "/access-to-market",
    isExpandable: false,
  },
  {
    title: "Access To Capital",
    url: "/funding",
    isExpandable: false,
  },
  {
    title: "Skills Development",
    url: "/skills-development",
    isExpandable: false,
  },
  {
    title: "Professional Services",
    url: "/services",
    isExpandable: false,
  },
  {
    title: "Scoring",
    url: "/credit-score",
    isExpandable: true,
    subItems: [
      { title: "Credit", url: "/credit-score" },
      { title: "Technical", url: "/technical-score" },
    ],
  },
  {
    title: "Profiling",
    url: "/profiling",
    isExpandable: false,
  },
];

const ancillaryServices = [
  "Agriculture & AgriTech",
  "Education & EdTech", 
  "Financial Services & FinTech",
  "Health & HealthTech",
  "Retail, Trade & eCommerce",
  "Transport & Mobility",
  "ICT & Software Development",
  "Energy & GreenTech",
  "Construction & PropertyTech",
  "Manufacturing & Hardware",
  "Creative & Digital Media",
  "Tourism, Hospitality & Events",
  "Legal & Compliance Services",
];

export function AppSidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("ancillary");

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r bg-background">
      <SidebarContent>
        {/* Main Navigation Icons */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="flex items-center justify-center w-full"
                  >
                    <Link to={item.url} className="flex flex-col items-center gap-1 px-2 py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Your Growth Gateway */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold px-4 py-3">
            Your Growth Gateway
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {growthGatewayItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!item.isExpandable}
                    isActive={isActive(item.url)}
                    onClick={item.isExpandable ? () => toggleExpanded(item.title) : undefined}
                    className="flex items-center justify-between w-full px-4 py-2"
                  >
                    {item.isExpandable ? (
                      <div className="flex items-center justify-between w-full cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${
                            expandedItems.includes(item.title) ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>
                    ) : (
                      <Link to={item.url} className="flex items-center gap-2 w-full">
                        <Plus className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                  
                  {item.isExpandable && item.subItems && expandedItems.includes(item.title) && (
                    <SidebarMenuSub>
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={isActive(subItem.url)}
                          >
                            <Link to={subItem.url} className="pl-8">
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Services Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-2">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="software" className="text-xs">
                  Software Services
                </TabsTrigger>
                <TabsTrigger value="ancillary" className="text-xs">
                  Ancillary Services
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="software" className="mt-0">
                <div className="text-sm text-muted-foreground px-2">
                  Software services will be listed here
                </div>
              </TabsContent>
              
              <TabsContent value="ancillary" className="mt-0">
                <SidebarMenu>
                  {ancillaryServices.map((service) => (
                    <SidebarMenuItem key={service}>
                      <SidebarMenuButton className="flex items-center gap-2 px-2 py-1 text-sm">
                        <Plus className="h-3 w-3" />
                        <span>{service}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </TabsContent>
            </Tabs>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
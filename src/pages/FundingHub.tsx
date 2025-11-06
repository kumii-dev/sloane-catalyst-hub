import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FundingOpportunityCard } from "@/components/funding/FundingOpportunityCard";
import { 
  Search, 
  TrendingUp, 
  Users, 
  Building, 
  Target,
  Award,
  ArrowRight,
  Filter,
  Bell,
  LayoutDashboard
} from "lucide-react";

const FundingHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [funders, setFunders] = useState<any[]>([]);
  const [loadingFunders, setLoadingFunders] = useState(false);

  const fundingTypes = [
    { type: "Grants", count: 42, icon: Award, color: "bg-emerald-500" },
    { type: "VC Funding", count: 28, icon: TrendingUp, color: "bg-blue-500" },
    { type: "Angel Investors", count: 156, icon: Users, color: "bg-purple-500" },
    { type: "Bank Products", count: 23, icon: Building, color: "bg-orange-500" },
    { type: "Accelerators", count: 18, icon: Target, color: "bg-pink-500" },
    { type: "Competitions", count: 31, icon: Award, color: "bg-green-500" },
  ];

  const featuredOpportunities = [
    {
      id: 1,
      title: "Fintech Innovation Grant",
      funder: "Development Finance Corp",
      amount: "R2M - R5M",
      type: "Grant",
      deadline: "2024-12-15",
      matches: 89,
      description: "Supporting innovative fintech solutions for financial inclusion in South Africa"
    },
    {
      id: 2,
      title: "AgriTech Seed Funding",
      funder: "Green Valley Ventures",
      amount: "R500K - R2M",
      type: "VC",
      deadline: "2024-11-30",
      matches: 76,
      description: "Early-stage funding for agricultural technology startups"
    },
    {
      id: 3,
      title: "Women in Tech Accelerator",
      funder: "SheLeads Foundation",
      amount: "R1M + Credits",
      type: "Accelerator",
      deadline: "2024-10-31",
      matches: 92,
      description: "6-month accelerator program for women-led tech startups"
    }
  ];

  const stats = [
    { label: "Total Funding Available", value: "R248M", change: "+12%" },
    { label: "Active Opportunities", value: "298", change: "+8%" },
    { label: "Successful Matches", value: "1,247", change: "+23%" },
    { label: "Average Success Rate", value: "68%", change: "+5%" }
  ];

  const fetchFunders = async () => {
    setLoadingFunders(true);
    try {
      const { data, error } = await supabase
        .from('funders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFunders(data || []);
    } catch (error) {
      console.error('Error fetching funders:', error);
    } finally {
      setLoadingFunders(false);
    }
  };

  useEffect(() => {
    fetchFunders();
  }, []);

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-18">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Bell className="w-4 h-4 mr-2" />
                3 new funding matches for you
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Funding Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Connect with the right funders, sponsors, and investors. Get AI-powered recommendations 
                based on your profile, credit score, and funding needs.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/funding/browse">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Opportunities
                </Button>
              </Link>
              <Link to="/funding/funder-dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Funder Dashboard
                </Button>
              </Link>
              <Link to="/become-funder">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Users className="w-5 h-5 mr-2" />
                  Become a Funder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search funding opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="default">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Tabs defaultValue="opportunities" className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-[400px] mx-auto">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="funders">Funders</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-8">
            {/* Funding Types Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {fundingTypes.map((type, index) => {
                const IconComponent = type.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm">{type.type}</h3>
                      <p className="text-xs text-muted-foreground">{type.count} available</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Featured Opportunities */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Featured Opportunities</h2>
                <Link to="/funding/browse">
                  <Button variant="ghost">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredOpportunities.map((opportunity) => (
                  <FundingOpportunityCard
                    key={opportunity.id}
                    id={opportunity.id.toString()}
                    title={opportunity.title}
                    description={opportunity.description}
                    fundingType={opportunity.type.toLowerCase()}
                    funderName={opportunity.funder}
                    amountMin={parseFloat(opportunity.amount.split(' - ')[0].replace(/[^0-9.]/g, '')) * (opportunity.amount.includes('M') ? 1000000 : opportunity.amount.includes('K') ? 1000 : 1)}
                    amountMax={parseFloat(opportunity.amount.split(' - ')[1]?.replace(/[^0-9.]/g, '') || opportunity.amount.replace(/[^0-9.]/g, '')) * (opportunity.amount.includes('M') ? 1000000 : opportunity.amount.includes('K') ? 1000 : 1)}
                    deadline={opportunity.deadline}
                    matchScore={opportunity.matches}
                    sloaneCredits={opportunity.amount.includes('Credits') ? 1000 : 0}
                    onApply={() => {
                      window.location.href = '/funding/browse';
                    }}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="funders" className="space-y-8">
            {loadingFunders ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading funders...</p>
              </div>
            ) : funders.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Funders Yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to join our funder community</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {funders.map((funder) => (
                  <Card key={funder.id} className="hover:shadow-lg transition-all">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        {funder.logo_url && (
                          <img src={funder.logo_url} alt={funder.organization_name} className="w-12 h-12 object-contain rounded" />
                        )}
                        {funder.is_verified && (
                          <Badge variant="secondary" className="ml-auto">
                            <Award className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{funder.organization_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {funder.organization_type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {funder.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {funder.description}
                        </p>
                      )}
                      {funder.focus_areas && funder.focus_areas.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {funder.focus_areas.slice(0, 3).map((area: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-2">
                        <div>
                          <span className="text-muted-foreground">Funded:</span>
                          <span className="font-medium ml-1">{funder.total_funded_companies || 0}</span>
                        </div>
                        {funder.website && (
                          <a 
                            href={funder.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Funding Insights</h3>
              <p className="text-muted-foreground mb-6">Market trends, success rates, and personalized analytics</p>
              <Button>Coming Soon</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default FundingHub;
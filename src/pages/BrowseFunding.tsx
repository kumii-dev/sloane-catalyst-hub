import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Star,
  TrendingUp,
  Award,
  Target,
  Users,
  ArrowRight,
  Heart,
  BookOpen
} from "lucide-react";

interface FundingOpportunity {
  id: string;
  title: string;
  description: string;
  funding_type: string;
  amount_min: number;
  amount_max: number;
  application_deadline: string;
  industry_focus: string[];
  stage_requirements: string[];
  requirements: string;
  sloane_credits_allocation: number;
  funder: {
    organization_name: string;
    logo_url?: string;
    is_verified: boolean;
  };
}

const BrowseFunding = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    industry: "",
    stage: "",
    minAmount: [0],
    maxAmount: [10000000],
    deadline: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const fundingTypeIcons: Record<string, any> = {
    grant: Award,
    loan: Building,
    vc: TrendingUp,
    angel: Users,
    bank_product: Building,
    accelerator: Target,
    competition: Star
  };

  const fundingTypeColors: Record<string, string> = {
    grant: "bg-emerald-500",
    loan: "bg-blue-500", 
    vc: "bg-purple-500",
    angel: "bg-pink-500",
    bank_product: "bg-orange-500",
    accelerator: "bg-green-500",
    competition: "bg-yellow-500"
  };

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('funding_opportunities')
        .select(`
          *,
          funder:funders(organization_name, logo_url, is_verified)
        `)
        .eq('status', 'active');

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.type && filters.type !== "") {
        query = query.eq('funding_type', filters.type as any);
      }

      if (filters.minAmount[0] > 0) {
        query = query.gte('amount_min', filters.minAmount[0]);
      }

      if (filters.maxAmount[0] < 10000000) {
        query = query.lte('amount_max', filters.maxAmount[0]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `R${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `R${(amount / 1000).toFixed(0)}K`;
    }
    return `R${amount}`;
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Funding Opportunities</h1>
          <p className="text-muted-foreground">
            Discover funding opportunities tailored to your startup's needs and profile
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities by title, description, or funder..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Funding Type</label>
                    <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="grant">Grants</SelectItem>
                        <SelectItem value="loan">Loans</SelectItem>
                        <SelectItem value="vc">VC Funding</SelectItem>
                        <SelectItem value="angel">Angel Investment</SelectItem>
                        <SelectItem value="bank_product">Bank Products</SelectItem>
                        <SelectItem value="accelerator">Accelerators</SelectItem>
                        <SelectItem value="competition">Competitions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All industries</SelectItem>
                        <SelectItem value="fintech">Fintech</SelectItem>
                        <SelectItem value="healthtech">Healthtech</SelectItem>
                        <SelectItem value="edtech">Edtech</SelectItem>
                        <SelectItem value="agritech">Agritech</SelectItem>
                        <SelectItem value="cleantech">Cleantech</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Stage</label>
                    <Select value={filters.stage} onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All stages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All stages</SelectItem>
                        <SelectItem value="idea">Idea</SelectItem>
                        <SelectItem value="pre_seed">Pre-seed</SelectItem>
                        <SelectItem value="seed">Seed</SelectItem>
                        <SelectItem value="series_a">Series A</SelectItem>
                        <SelectItem value="series_b">Series B</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="established">Established</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Funding Amount: {formatAmount(filters.minAmount[0])} - {formatAmount(filters.maxAmount[0])}
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Minimum</label>
                        <Slider
                          value={filters.minAmount}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, minAmount: value }))}
                          max={10000000}
                          step={50000}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Maximum</label>
                        <Slider
                          value={filters.maxAmount}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, maxAmount: value }))}
                          max={10000000}
                          step={50000}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${opportunities.length} opportunities found`}
            </p>
            {!user && (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Sign in for personalized matches
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity) => {
                const IconComponent = fundingTypeIcons[opportunity.funding_type] || Award;
                const colorClass = fundingTypeColors[opportunity.funding_type] || "bg-gray-500";
                
                return (
                  <Card key={opportunity.id} className="hover:shadow-lg transition-all group">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {opportunity.funding_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                          {opportunity.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-muted-foreground">by</span>
                          <span className="text-sm font-medium">{opportunity.funder.organization_name}</span>
                          {opportunity.funder.is_verified && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardDescription className="line-clamp-2">
                        {opportunity.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Amount
                          </span>
                          <span className="font-medium text-green-600">
                            {formatAmount(opportunity.amount_min)} - {formatAmount(opportunity.amount_max)}
                          </span>
                        </div>
                        
                        {opportunity.application_deadline && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Deadline
                            </span>
                            <span className="font-medium">
                              {formatDeadline(opportunity.application_deadline)}
                            </span>
                          </div>
                        )}
                        
                        {opportunity.sloane_credits_allocation > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Kumii Credits</span>
                            <Badge variant="outline" className="text-accent">
                              +{opportunity.sloane_credits_allocation} Kumii Credits
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground">
                          Apply Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="outline" size="default" className="px-3">
                          <BookOpen className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && opportunities.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search filters or check back later for new opportunities
              </p>
              <Button onClick={() => setFilters({
                search: "",
                type: "",
                industry: "",
                stage: "",
                minAmount: [0],
                maxAmount: [10000000],
                deadline: ""
              })}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BrowseFunding;
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
import { ApplyDialog } from "@/components/funding/ApplyDialog";
import { FundingOpportunityCard } from "@/components/funding/FundingOpportunityCard";
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
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
  min_credit_score: number | null;
  geographic_restrictions: string[];
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
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `R${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `R${(amount / 1000).toFixed(0)}K`;
    }
    return `R${amount}`;
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
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
              {opportunities.map((opportunity) => (
                <FundingOpportunityCard
                  key={opportunity.id}
                  id={opportunity.id}
                  title={opportunity.title}
                  description={opportunity.description}
                  fundingType={opportunity.funding_type}
                  funderName={opportunity.funder.organization_name}
                  isVerified={opportunity.funder.is_verified}
                  amountMin={opportunity.amount_min}
                  amountMax={opportunity.amount_max}
                  deadline={opportunity.application_deadline}
                  sloaneCredits={opportunity.sloane_credits_allocation}
                  onApply={() => {
                    if (!user) {
                      window.location.href = '/auth';
                      return;
                    }
                    setSelectedOpportunity(opportunity);
                    setShowApplyDialog(true);
                  }}
                />
              ))}
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

      {/* Apply Dialog */}
      {selectedOpportunity && (
        <ApplyDialog
          open={showApplyDialog}
          onOpenChange={setShowApplyDialog}
          opportunity={selectedOpportunity}
        />
      )}

      <Footer />
    </div>
  );
};

export default BrowseFunding;
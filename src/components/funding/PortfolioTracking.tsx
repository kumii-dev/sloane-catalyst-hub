import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  DollarSign, 
  Building, 
  Calendar,
  BarChart3,
  ExternalLink,
  FileText
} from "lucide-react";

interface PortfolioCompany {
  id: string;
  company_name: string;
  industry: string;
  stage: string;
  funded_amount: number;
  funded_date: string;
  opportunity_title: string;
  funding_type: string;
}

interface PortfolioTrackingProps {
  funderId: string;
}

export const PortfolioTracking = ({ funderId }: PortfolioTrackingProps) => {
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    fetchPortfolioData();
  }, [funderId]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch all approved applications for this funder's opportunities
      const { data: applications } = await supabase
        .from('funding_applications')
        .select(`
          id,
          requested_amount,
          submitted_at,
          startup:startup_profiles(
            id,
            company_name,
            industry,
            stage
          ),
          opportunity:funding_opportunities(
            title,
            funding_type,
            funder_id
          )
        `)
        .eq('opportunity.funder_id', funderId)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false });

      if (applications) {
        const companies = applications
          .filter(app => app.startup && app.opportunity)
          .map(app => ({
            id: app.startup.id,
            company_name: app.startup.company_name,
            industry: app.startup.industry,
            stage: app.startup.stage,
            funded_amount: Number(app.requested_amount) || 0,
            funded_date: app.submitted_at,
            opportunity_title: app.opportunity.title,
            funding_type: app.opportunity.funding_type
          }));

        setPortfolioCompanies(companies);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate metrics
  const totalFunded = portfolioCompanies.reduce((sum, company) => sum + company.funded_amount, 0);
  const totalCompanies = portfolioCompanies.length;
  const averageDealSize = totalCompanies > 0 ? totalFunded / totalCompanies : 0;

  // Group by industry
  const industriesDistribution = portfolioCompanies.reduce((acc, company) => {
    acc[company.industry] = (acc[company.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by stage
  const stagesDistribution = portfolioCompanies.reduce((acc, company) => {
    acc[company.stage] = (acc[company.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter companies
  const filteredCompanies = activeFilter === "all" 
    ? portfolioCompanies 
    : portfolioCompanies.filter(c => c.industry === activeFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatAmount(totalFunded)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all portfolio companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatAmount(averageDealSize)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per company investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Industry Distribution</CardTitle>
            <CardDescription>Portfolio breakdown by industry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(industriesDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([industry, count]) => (
                <div key={industry} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{industry.replace('_', ' ')}</span>
                    <span className="font-medium">{count} {count === 1 ? 'company' : 'companies'}</span>
                  </div>
                  <Progress value={(count / totalCompanies) * 100} className="h-2" />
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stage Distribution</CardTitle>
            <CardDescription>Portfolio breakdown by startup stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stagesDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([stage, count]) => (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{stage.replace('_', ' ')}</span>
                    <span className="font-medium">{count} {count === 1 ? 'company' : 'companies'}</span>
                  </div>
                  <Progress value={(count / totalCompanies) * 100} className="h-2" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Companies List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio Companies</CardTitle>
              <CardDescription>Manage and track your funded startups</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({totalCompanies})</TabsTrigger>
              {Object.entries(industriesDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([industry, count]) => (
                  <TabsTrigger key={industry} value={industry} className="capitalize">
                    {industry.replace('_', ' ')} ({count})
                  </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value={activeFilter} className="space-y-3">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No portfolio companies yet</p>
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <Card key={company.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{company.company_name}</h3>
                            <Badge variant="secondary" className="capitalize">
                              {company.stage.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {company.funding_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Industry: </span>
                              <span className="font-medium capitalize">
                                {company.industry.replace('_', ' ')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Funded: </span>
                              <span className="font-medium text-green-600">
                                {formatAmount(company.funded_amount)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Opportunity: </span>
                              <span className="font-medium">{company.opportunity_title}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{formatDate(company.funded_date)}</span>
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

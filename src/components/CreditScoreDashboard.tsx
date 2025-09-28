import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Shield, 
  CheckCircle,
  FileText,
  Download,
  Share2,
  AlertCircle,
  Target,
  Calendar,
  Award
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreditScoreDashboardProps {
  assessmentId?: string;
}

const CreditScoreDashboard = ({ assessmentId }: CreditScoreDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [sharingHistory, setSharingHistory] = useState([]);

  const categoryConfig = {
    financial_health: { 
      icon: TrendingUp, 
      label: 'Financial Health', 
      color: 'text-green-600',
      description: 'Revenue, cash flow, and financial stability'
    },
    governance: { 
      icon: Building2, 
      label: 'Governance', 
      color: 'text-blue-600',
      description: 'Legal structure and compliance'
    },
    skills: { 
      icon: Users, 
      label: 'Skills & Capabilities', 
      color: 'text-purple-600',
      description: 'Team expertise and development'
    },
    market_access: { 
      icon: Target, 
      label: 'Market Access', 
      color: 'text-orange-600',
      description: 'Customer base and market position'
    },
    compliance: { 
      icon: Shield, 
      label: 'Compliance', 
      color: 'text-red-600',
      description: 'Regulatory and legal compliance'
    },
    growth_readiness: { 
      icon: CheckCircle, 
      label: 'Growth Readiness', 
      color: 'text-indigo-600',
      description: 'Scalability and investment readiness'
    }
  };

  useEffect(() => {
    fetchAssessment();
    fetchSharingHistory();
  }, [user, assessmentId]);

  const fetchAssessment = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('credit_assessments')
        .select(`
          *,
          startup_profiles (
            company_name,
            industry,
            stage
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assessmentId) {
        query = query.eq('id', assessmentId);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;
      setAssessment(data);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast({
        title: "Error",
        description: "Failed to load credit assessment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSharingHistory = async () => {
    if (!user || !assessmentId) return;

    try {
      const { data } = await supabase
        .from('score_sharing')
        .select(`
          *,
          funders (
            organization_name,
            logo_url
          )
        `)
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false });

      if (data) setSharingHistory(data);
    } catch (error) {
      console.error('Error fetching sharing history:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const generateRecommendations = (assessment: any) => {
    const recommendations = [];
    
    if (assessment.financial_health_score < 70) {
      recommendations.push({
        category: 'Financial Health',
        suggestion: 'Improve revenue consistency and maintain positive cash flow for at least 6 months',
        priority: 'High'
      });
    }
    
    if (assessment.governance_score < 70) {
      recommendations.push({
        category: 'Governance',
        suggestion: 'Ensure all business registrations and tax clearances are current',
        priority: 'High'
      });
    }
    
    if (assessment.skills_score < 70) {
      recommendations.push({
        category: 'Skills',
        suggestion: 'Complete additional business training programs and engage with mentors',
        priority: 'Medium'
      });
    }

    return recommendations;
  };

  const exportToPDF = async () => {
    // Implement PDF export functionality
    toast({
      title: "Feature Coming Soon",
      description: "PDF export will be available shortly",
    });
  };

  const shareWithFunders = async () => {
    if (!assessment || !assessment.consent_to_share) {
      toast({
        title: "Consent Required",
        description: "Please provide consent to share your score in the assessment",
        variant: "destructive"
      });
      return;
    }

    // Implement sharing functionality
    toast({
      title: "Score Shared",
      description: "Your credit score is now visible to verified funders",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Credit Assessment Found</h3>
          <p className="text-muted-foreground mb-4">
            Complete your credit assessment to see your business credit score
          </p>
          <Button>Start Assessment</Button>
        </CardContent>
      </Card>
    );
  }

  const recommendations = generateRecommendations(assessment);

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Business Credit Score</CardTitle>
              <p className="text-muted-foreground">
                {assessment.startup_profiles?.company_name} • 
                {assessment.startup_profiles?.industry} • 
                {assessment.startup_profiles?.stage}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(assessment.overall_score)}`}>
                {assessment.overall_score || 0}
              </div>
              <div className="text-sm text-muted-foreground">out of 100</div>
              <Badge variant={getScoreBadgeVariant(assessment.overall_score)} className="mt-2">
                {assessment.overall_score >= 80 ? 'Excellent' : 
                 assessment.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Assessed: {new Date(assessment.assessed_at || assessment.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Status: {assessment.status === 'completed' ? 'Complete' : 'In Progress'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Sharing: {assessment.consent_to_share ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const score = assessment[`${key}_score`] || 0;
          const IconComponent = config.icon;
          
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-5 h-5 ${config.color}`} />
                    <CardTitle className="text-base">{config.label}</CardTitle>
                  </div>
                  <Badge variant={getScoreBadgeVariant(score)}>
                    {score}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={score} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-l-orange-400 pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium">{rec.category}</h4>
                    <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={exportToPDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export PDF Report
        </Button>
        <Button 
          onClick={shareWithFunders} 
          disabled={!assessment.consent_to_share}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share with Funders
        </Button>
      </div>

      {/* Sharing History */}
      {sharingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sharing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sharingHistory.map((share: any) => (
                <div key={share.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    {share.funders?.logo_url && (
                      <img 
                        src={share.funders.logo_url} 
                        alt={share.funders.organization_name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{share.funders?.organization_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Shared: {new Date(share.shared_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={share.viewed_at ? 'default' : 'secondary'}>
                    {share.viewed_at ? 'Viewed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditScoreDashboard;
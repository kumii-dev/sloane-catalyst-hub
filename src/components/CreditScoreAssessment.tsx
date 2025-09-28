import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Building2, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Save,
  Send
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssessmentData {
  financial_health: {
    annual_revenue?: number;
    monthly_cash_flow?: number;
    debt_to_equity_ratio?: number;
    months_operational?: number;
    banking_relationship_years?: number;
  };
  governance: {
    business_registration?: string;
    tax_clearance_current?: boolean;
    board_meetings_frequency?: string;
    risk_management_policy?: boolean;
  };
  skills: {
    founders_experience_years?: number;
    team_size?: number;
    training_programs_completed?: string[];
    mentorship_hours?: number;
  };
  market_access: {
    active_customers?: number;
    customer_retention_rate?: number;
    market_share_estimate?: number;
    partnerships?: string[];
  };
  compliance: {
    regulatory_licenses?: string[];
    tax_filings_current?: boolean;
    employment_compliance?: boolean;
    data_protection_policy?: boolean;
  };
  growth_readiness: {
    scalability_plan?: boolean;
    technology_systems?: string[];
    funding_history?: string;
    strategic_plan?: boolean;
  };
}

interface CreditScoreAssessmentProps {
  onScoreGenerated?: (score: any) => void;
}

const CreditScoreAssessment = ({ onScoreGenerated }: CreditScoreAssessmentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    financial_health: {},
    governance: {},
    skills: {},
    market_access: {},
    compliance: {},
    growth_readiness: {}
  });
  const [existingAssessment, setExistingAssessment] = useState<any>(null);
  const [consentToShare, setConsentToShare] = useState(false);

  const steps = [
    { id: 'financial_health', title: 'Financial Health', icon: TrendingUp },
    { id: 'governance', title: 'Governance', icon: Building2 },
    { id: 'skills', title: 'Skills & Capabilities', icon: Users },
    { id: 'market_access', title: 'Market Access', icon: FileText },
    { id: 'compliance', title: 'Compliance', icon: Shield },
    { id: 'growth_readiness', title: 'Growth Readiness', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchExistingAssessment();
  }, [user]);

  const fetchExistingAssessment = async () => {
    if (!user) return;

    try {
      const { data: startup } = await supabase
        .from('startup_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!startup) return;

      const { data: assessment } = await supabase
        .from('credit_assessments')
        .select('*')
        .eq('startup_id', startup.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (assessment) {
        setExistingAssessment(assessment);
        if (assessment.assessment_data && typeof assessment.assessment_data === 'object') {
          const data = assessment.assessment_data as any;
          setAssessmentData({
            financial_health: data.financial_health || {},
            governance: data.governance || {},
            skills: data.skills || {},
            market_access: data.market_access || {},
            compliance: data.compliance || {},
            growth_readiness: data.growth_readiness || {}
          });
        }
        setConsentToShare(assessment.consent_to_share || false);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  };

  const updateAssessmentData = (category: keyof AssessmentData, field: string, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const calculateCategoryScore = (category: keyof AssessmentData): number => {
    let score = 0;
    let maxScore = 100;

    switch (category) {
      case 'financial_health': {
        const data = assessmentData.financial_health;
        if (data.annual_revenue && data.annual_revenue > 0) score += 25;
        if (data.monthly_cash_flow && data.monthly_cash_flow > 0) score += 20;
        if (data.months_operational && data.months_operational >= 12) score += 20;
        if (data.banking_relationship_years && data.banking_relationship_years >= 2) score += 15;
        if (data.debt_to_equity_ratio && data.debt_to_equity_ratio < 0.5) score += 20;
        break;
      }
      case 'governance': {
        const data = assessmentData.governance;
        if (data.business_registration) score += 30;
        if (data.tax_clearance_current) score += 25;
        if (data.board_meetings_frequency && data.board_meetings_frequency !== 'never') score += 25;
        if (data.risk_management_policy) score += 20;
        break;
      }
      case 'skills': {
        const data = assessmentData.skills;
        if (data.founders_experience_years && data.founders_experience_years >= 5) score += 30;
        if (data.team_size && data.team_size >= 3) score += 20;
        if (data.training_programs_completed && data.training_programs_completed.length > 0) score += 25;
        if (data.mentorship_hours && data.mentorship_hours >= 10) score += 25;
        break;
      }
      case 'market_access': {
        const data = assessmentData.market_access;
        if (data.active_customers && data.active_customers > 10) score += 30;
        if (data.customer_retention_rate && data.customer_retention_rate >= 80) score += 25;
        if (data.partnerships && data.partnerships.length > 0) score += 25;
        if (data.market_share_estimate && data.market_share_estimate > 0) score += 20;
        break;
      }
      case 'compliance': {
        const data = assessmentData.compliance;
        if (data.tax_filings_current) score += 30;
        if (data.employment_compliance) score += 25;
        if (data.data_protection_policy) score += 25;
        if (data.regulatory_licenses && data.regulatory_licenses.length > 0) score += 20;
        break;
      }
      case 'growth_readiness': {
        const data = assessmentData.growth_readiness;
        if (data.scalability_plan) score += 25;
        if (data.strategic_plan) score += 25;
        if (data.technology_systems && data.technology_systems.length > 0) score += 25;
        if (data.funding_history) score += 25;
        break;
      }
    }

    return Math.min(score, maxScore);
  };

  const calculateOverallScore = (): number => {
    const categoryScores = steps.map(step => calculateCategoryScore(step.id as keyof AssessmentData));
    return Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length);
  };

  const saveAssessment = async (status: 'draft' | 'completed' = 'draft') => {
    if (!user) return;

    setSaving(true);
    try {
      const { data: startup } = await supabase
        .from('startup_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!startup) {
        toast({
          title: "Error",
          description: "Please complete your startup profile first",
          variant: "destructive"
        });
        return;
      }

      const categoryScores = {
        financial_health_score: calculateCategoryScore('financial_health'),
        governance_score: calculateCategoryScore('governance'),
        skills_score: calculateCategoryScore('skills'),
        market_access_score: calculateCategoryScore('market_access'),
        compliance_score: calculateCategoryScore('compliance'),
        growth_readiness_score: calculateCategoryScore('growth_readiness')
      };

      const overallScore = calculateOverallScore();

      const assessmentPayload = {
        startup_id: startup.id,
        user_id: user.id,
        status,
        overall_score: overallScore,
        ...categoryScores,
        assessment_data: assessmentData as any,
        consent_to_share: consentToShare,
        consent_timestamp: consentToShare ? new Date().toISOString() : null,
        assessed_at: status === 'completed' ? new Date().toISOString() : null
      };

      let result;
      if (existingAssessment) {
        result = await supabase
          .from('credit_assessments')
          .update(assessmentPayload)
          .eq('id', existingAssessment.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('credit_assessments')
          .insert(assessmentPayload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Assessment ${status === 'completed' ? 'completed' : 'saved'} successfully`
      });

      if (status === 'completed' && onScoreGenerated) {
        onScoreGenerated(result.data);
      }

      fetchExistingAssessment();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderFinancialHealthForm = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="annual_revenue">Annual Revenue (R)</Label>
          <Input
            id="annual_revenue"
            type="number"
            placeholder="0"
            value={assessmentData.financial_health.annual_revenue || ''}
            onChange={(e) => updateAssessmentData('financial_health', 'annual_revenue', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="monthly_cash_flow">Monthly Cash Flow (R)</Label>
          <Input
            id="monthly_cash_flow"
            type="number"
            placeholder="0"
            value={assessmentData.financial_health.monthly_cash_flow || ''}
            onChange={(e) => updateAssessmentData('financial_health', 'monthly_cash_flow', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="months_operational">Months in Operation</Label>
          <Input
            id="months_operational"
            type="number"
            placeholder="0"
            value={assessmentData.financial_health.months_operational || ''}
            onChange={(e) => updateAssessmentData('financial_health', 'months_operational', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="banking_years">Banking Relationship (Years)</Label>
          <Input
            id="banking_years"
            type="number"
            placeholder="0"
            value={assessmentData.financial_health.banking_relationship_years || ''}
            onChange={(e) => updateAssessmentData('financial_health', 'banking_relationship_years', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );

  const renderGovernanceForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="business_registration">Business Registration Number</Label>
        <Input
          id="business_registration"
          placeholder="Registration number"
          value={assessmentData.governance.business_registration || ''}
          onChange={(e) => updateAssessmentData('governance', 'business_registration', e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tax_clearance"
            checked={assessmentData.governance.tax_clearance_current || false}
            onCheckedChange={(checked) => updateAssessmentData('governance', 'tax_clearance_current', checked)}
          />
          <Label htmlFor="tax_clearance">Current tax clearance certificate</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="risk_policy"
            checked={assessmentData.governance.risk_management_policy || false}
            onCheckedChange={(checked) => updateAssessmentData('governance', 'risk_management_policy', checked)}
          />
          <Label htmlFor="risk_policy">Risk management policy in place</Label>
        </div>
      </div>
    </div>
  );

  const renderSkillsForm = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="founders_experience">Founders Experience (Years)</Label>
          <Input
            id="founders_experience"
            type="number"
            placeholder="0"
            value={assessmentData.skills.founders_experience_years || ''}
            onChange={(e) => updateAssessmentData('skills', 'founders_experience_years', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="team_size">Team Size</Label>
          <Input
            id="team_size"
            type="number"
            placeholder="0"
            value={assessmentData.skills.team_size || ''}
            onChange={(e) => updateAssessmentData('skills', 'team_size', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="mentorship_hours">Mentorship Hours Completed</Label>
          <Input
            id="mentorship_hours"
            type="number"
            placeholder="0"
            value={assessmentData.skills.mentorship_hours || ''}
            onChange={(e) => updateAssessmentData('skills', 'mentorship_hours', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );

  const renderMarketAccessForm = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="active_customers">Active Customers</Label>
          <Input
            id="active_customers"
            type="number"
            placeholder="0"
            value={assessmentData.market_access.active_customers || ''}
            onChange={(e) => updateAssessmentData('market_access', 'active_customers', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="retention_rate">Customer Retention Rate (%)</Label>
          <Input
            id="retention_rate"
            type="number"
            placeholder="0"
            value={assessmentData.market_access.customer_retention_rate || ''}
            onChange={(e) => updateAssessmentData('market_access', 'customer_retention_rate', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );

  const renderComplianceForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tax_filings"
            checked={assessmentData.compliance.tax_filings_current || false}
            onCheckedChange={(checked) => updateAssessmentData('compliance', 'tax_filings_current', checked)}
          />
          <Label htmlFor="tax_filings">Tax filings are current</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="employment_compliance"
            checked={assessmentData.compliance.employment_compliance || false}
            onCheckedChange={(checked) => updateAssessmentData('compliance', 'employment_compliance', checked)}
          />
          <Label htmlFor="employment_compliance">Employment practices compliant</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="data_protection"
            checked={assessmentData.compliance.data_protection_policy || false}
            onCheckedChange={(checked) => updateAssessmentData('compliance', 'data_protection_policy', checked)}
          />
          <Label htmlFor="data_protection">POPIA/GDPR compliant data policy</Label>
        </div>
      </div>
    </div>
  );

  const renderGrowthReadinessForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="scalability_plan"
            checked={assessmentData.growth_readiness.scalability_plan || false}
            onCheckedChange={(checked) => updateAssessmentData('growth_readiness', 'scalability_plan', checked)}
          />
          <Label htmlFor="scalability_plan">Scalability plan documented</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="strategic_plan"
            checked={assessmentData.growth_readiness.strategic_plan || false}
            onCheckedChange={(checked) => updateAssessmentData('growth_readiness', 'strategic_plan', checked)}
          />
          <Label htmlFor="strategic_plan">Strategic business plan in place</Label>
        </div>
      </div>
      
      <div>
        <Label htmlFor="funding_history">Previous Funding History</Label>
        <Textarea
          id="funding_history"
          placeholder="Describe any previous funding received..."
          value={assessmentData.growth_readiness.funding_history || ''}
          onChange={(e) => updateAssessmentData('growth_readiness', 'funding_history', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    const step = steps[currentStep];
    const score = calculateCategoryScore(step.id as keyof AssessmentData);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <step.icon className="w-5 h-5" />
              {step.title}
            </CardTitle>
            <Badge variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}>
              {score}/100
            </Badge>
          </div>
          <Progress value={score} className="h-2" />
        </CardHeader>
        <CardContent>
          {step.id === 'financial_health' && renderFinancialHealthForm()}
          {step.id === 'governance' && renderGovernanceForm()}
          {step.id === 'skills' && renderSkillsForm()}
          {step.id === 'market_access' && renderMarketAccessForm()}
          {step.id === 'compliance' && renderComplianceForm()}
          {step.id === 'growth_readiness' && renderGrowthReadinessForm()}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credit Score Assessment</CardTitle>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Complete all sections to generate your credit score
            </span>
            <Badge variant="outline" className="text-2xl font-bold px-4 py-2">
              {calculateOverallScore()}/100
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {steps.map((step, index) => {
          const score = calculateCategoryScore(step.id as keyof AssessmentData);
          return (
            <Button
              key={step.id}
              variant={currentStep === index ? "default" : "outline"}
              className="flex flex-col h-16 p-2"
              onClick={() => setCurrentStep(index)}
            >
              <step.icon className="w-4 h-4 mb-1" />
              <span className="text-xs text-center">{step.title}</span>
              <span className="text-xs font-bold">{score}/100</span>
            </Button>
          );
        })}
      </div>

      {/* Current Step Form */}
      {renderStepContent()}

      {/* Consent Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={consentToShare}
              onCheckedChange={(checked) => setConsentToShare(!!checked)}
            />
            <div className="space-y-2">
              <Label htmlFor="consent" className="text-sm font-medium">
                I consent to sharing my credit score with verified funders
              </Label>
              <p className="text-xs text-muted-foreground">
                Your score will only be visible to verified funders in our network. You can revoke this consent at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation & Actions */}
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentStep === steps.length - 1}
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Next
          </Button>
        </div>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => saveAssessment('draft')}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => saveAssessment('completed')}
            disabled={saving || calculateOverallScore() < 30}
          >
            <Send className="w-4 h-4 mr-2" />
            Complete Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreAssessment;
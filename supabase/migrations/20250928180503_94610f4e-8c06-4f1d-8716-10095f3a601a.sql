-- Create enums for credit scoring
CREATE TYPE public.scoring_category AS ENUM (
  'financial_health',
  'governance', 
  'skills',
  'market_access',
  'compliance',
  'growth_readiness'
);

CREATE TYPE public.assessment_status AS ENUM (
  'draft',
  'in_progress', 
  'completed',
  'reviewed'
);

-- Credit scoring assessments table
CREATE TABLE public.credit_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startup_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status assessment_status NOT NULL DEFAULT 'draft',
  overall_score INTEGER,
  financial_health_score INTEGER,
  governance_score INTEGER,
  skills_score INTEGER,
  market_access_score INTEGER,
  compliance_score INTEGER,
  growth_readiness_score INTEGER,
  assessment_data JSONB,
  recommendations TEXT[],
  improvement_areas TEXT[],
  consent_to_share BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMP WITH TIME ZONE,
  assessed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on credit assessments
ALTER TABLE public.credit_assessments ENABLE ROW LEVEL SECURITY;

-- Credit scoring criteria and weights (admin configurable)
CREATE TABLE public.scoring_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category scoring_category NOT NULL,
  criteria_name TEXT NOT NULL,
  description TEXT,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  max_points INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scoring criteria
ALTER TABLE public.scoring_criteria ENABLE ROW LEVEL SECURITY;

-- Credit score sharing permissions
CREATE TABLE public.score_sharing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.credit_assessments(id) ON DELETE CASCADE,
  funder_id UUID REFERENCES public.funders(id),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  access_level TEXT NOT NULL DEFAULT 'summary', -- 'summary', 'detailed', 'full'
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on score sharing
ALTER TABLE public.score_sharing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_assessments
CREATE POLICY "Users can view their own assessments" 
ON public.credit_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.credit_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.credit_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Funders can view shared assessments" 
ON public.credit_assessments 
FOR SELECT 
USING (
  consent_to_share = true AND 
  id IN (
    SELECT ss.assessment_id 
    FROM public.score_sharing ss 
    JOIN public.funders f ON f.id = ss.funder_id 
    WHERE f.user_id = auth.uid() AND ss.expires_at > now()
  )
);

-- RLS Policies for scoring_criteria
CREATE POLICY "Everyone can view active criteria" 
ON public.scoring_criteria 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for score_sharing
CREATE POLICY "Users can view their shared scores" 
ON public.score_sharing 
FOR SELECT 
USING (
  assessment_id IN (
    SELECT id FROM public.credit_assessments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create score shares" 
ON public.score_sharing 
FOR INSERT 
WITH CHECK (
  assessment_id IN (
    SELECT id FROM public.credit_assessments WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Funders can view their score access" 
ON public.score_sharing 
FOR SELECT 
USING (
  funder_id IN (
    SELECT id FROM public.funders WHERE user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_credit_assessments_startup_id ON public.credit_assessments(startup_id);
CREATE INDEX idx_credit_assessments_user_id ON public.credit_assessments(user_id);
CREATE INDEX idx_credit_assessments_status ON public.credit_assessments(status);
CREATE INDEX idx_score_sharing_assessment_id ON public.score_sharing(assessment_id);
CREATE INDEX idx_score_sharing_funder_id ON public.score_sharing(funder_id);
CREATE INDEX idx_scoring_criteria_category ON public.scoring_criteria(category);

-- Create trigger for updated_at
CREATE TRIGGER update_credit_assessments_updated_at
  BEFORE UPDATE ON public.credit_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scoring_criteria_updated_at
  BEFORE UPDATE ON public.scoring_criteria
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default scoring criteria
INSERT INTO public.scoring_criteria (category, criteria_name, description, weight, max_points) VALUES
-- Financial Health
('financial_health', 'Revenue Consistency', 'Regular revenue streams over 12+ months', 0.25, 25),
('financial_health', 'Cash Flow Management', 'Positive operational cash flow trends', 0.20, 20),
('financial_health', 'Financial Records', 'Complete and accurate financial statements', 0.15, 15),
('financial_health', 'Banking History', 'Clean banking record and transaction history', 0.20, 20),
('financial_health', 'Debt Management', 'Appropriate debt levels and payment history', 0.20, 20),

-- Governance
('governance', 'Legal Compliance', 'Proper business registration and legal structure', 0.30, 30),
('governance', 'Board Structure', 'Appropriate governance and decision-making processes', 0.25, 25),
('governance', 'Documentation', 'Complete corporate documentation and policies', 0.20, 20),
('governance', 'Risk Management', 'Identified and managed business risks', 0.25, 25),

-- Skills & Capabilities
('skills', 'Team Expertise', 'Relevant skills and experience in leadership team', 0.30, 30),
('skills', 'Training Completion', 'Completed business development and skills programs', 0.25, 25),
('skills', 'Mentorship Engagement', 'Active participation in mentorship programs', 0.20, 20),
('skills', 'Digital Literacy', 'Use of digital tools and online presence', 0.25, 25),

-- Market Access
('market_access', 'Customer Base', 'Established and diverse customer portfolio', 0.30, 30),
('market_access', 'Market Position', 'Competitive positioning and differentiation', 0.25, 25),
('market_access', 'Growth Trajectory', 'Historical and projected growth patterns', 0.25, 25),
('market_access', 'Network Access', 'Access to suppliers, distributors, and partners', 0.20, 20),

-- Compliance
('compliance', 'Regulatory Adherence', 'Compliance with industry regulations', 0.30, 30),
('compliance', 'Tax Compliance', 'Up-to-date tax filings and payments', 0.25, 25),
('compliance', 'Employment Compliance', 'Proper employment practices and documentation', 0.20, 20),
('compliance', 'Data Protection', 'POPIA/GDPR compliance for data handling', 0.25, 25),

-- Growth Readiness
('growth_readiness', 'Scalability', 'Business model and systems ready for growth', 0.25, 25),
('growth_readiness', 'Investment Readiness', 'Prepared for funding with proper documentation', 0.30, 30),
('growth_readiness', 'Technology Adoption', 'Use of technology to enable growth', 0.20, 20),
('growth_readiness', 'Strategic Planning', 'Clear business strategy and execution plan', 0.25, 25);
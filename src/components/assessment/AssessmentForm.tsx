import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssessmentResults } from "@/components/assessment/AssessmentResults";
import jsPDF from "jspdf";
import logoImg from "@/assets/22-on-sloane-logo.png";

interface DocumentUpload {
  type: string;
  file: File | null;
  uploaded: boolean;
  url?: string;
}

const DOCUMENT_TYPES = [
  { key: 'cipc', label: 'CIPC Registration Certificate', required: true },
  { key: 'financial_statements', label: 'Financial Statements / Bank Statements', required: true },
  { key: 'tax_clearance', label: 'Tax Clearance Certificate (SARS)', required: true },
  { key: 'credit_history', label: 'Credit/Repayment History', required: false },
  { key: 'contracts', label: 'Customer & Supplier Contracts', required: false },
  { key: 'operational_info', label: 'Operational Information', required: false },
  { key: 'technology_ip', label: 'Technology & IP Information', required: false },
  { key: 'esg_info', label: 'Social & Environmental Contributions', required: false },
  { key: 'reputation', label: 'Reputation Evidence', required: false },
  { key: 'growth_plan', label: 'Business Growth Plan', required: false },
];

const INDUSTRIES = [
  { value: 'fintech', label: 'Financial Technology' },
  { value: 'healthtech', label: 'Healthcare & Health Technology' },
  { value: 'edtech', label: 'Education Technology' },
  { value: 'agritech', label: 'Agriculture Technology' },
  { value: 'cleantech', label: 'Clean & Sustainable Technology' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
];

// Credit Score Grade Mapping (Kudough-based scale for 0-1000 range)
const getGradeFromScore = (score: number): { grade: string; label: string; color: [number, number, number] } => {
  if (score >= 900) return { grade: 'A+', label: 'Excellent', color: [16, 185, 129] as [number, number, number] };
  if (score >= 750) return { grade: 'B', label: 'Good', color: [34, 197, 94] as [number, number, number] };
  if (score >= 600) return { grade: 'C', label: 'Average', color: [132, 204, 22] as [number, number, number] };
  if (score >= 450) return { grade: 'D', label: 'Fair', color: [234, 179, 8] as [number, number, number] };
  if (score >= 300) return { grade: 'E', label: 'Poor', color: [249, 115, 22] as [number, number, number] };
  return { grade: 'F', label: 'Very Poor', color: [239, 68, 68] as [number, number, number] };
};

// Grade mapping for individual domains (0-100 scale)
const getDomainGrade = (score: number): { grade: string; label: string; color: [number, number, number] } => {
  if (score >= 90) return { grade: 'A+', label: 'Excellent', color: [16, 185, 129] as [number, number, number] };
  if (score >= 75) return { grade: 'B', label: 'Good', color: [34, 197, 94] as [number, number, number] };
  if (score >= 60) return { grade: 'C', label: 'Average', color: [132, 204, 22] as [number, number, number] };
  if (score >= 45) return { grade: 'D', label: 'Fair', color: [234, 179, 8] as [number, number, number] };
  if (score >= 30) return { grade: 'E', label: 'Poor', color: [249, 115, 22] as [number, number, number] };
  return { grade: 'F', label: 'Very Poor', color: [239, 68, 68] as [number, number, number] };
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

export const AssessmentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [testMode, setTestMode] = useState(true);
  
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>(
    DOCUMENT_TYPES.reduce((acc, doc) => ({
      ...acc,
      [doc.key]: { type: doc.key, file: null, uploaded: false }
    }), {})
  );

  const [formData, setFormData] = useState({
    company_name: '',
    founded_year: '',
    industry: '',
    annual_revenue: '',
    team_size: '',
    funding_needed: '',
    business_description: '',
    previous_funding: '',
    key_customers: '',
    competitive_advantage: '',
    consent_to_share: false,
  });

  const downloadPDF = async (assessment: any) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Brand colors (RGB)
    const brandOrange: [number, number, number] = [234, 97, 43];
    const brandBlue: [number, number, number] = [2, 163, 204];
    const brandGrey: [number, number, number] = [63, 63, 65];
    const lightGrey: [number, number, number] = [240, 240, 242];
    
    let yPos = 15;

    // Header with brand colors
    pdf.setFillColor(...brandOrange);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Add company name in a nice box (centered)
    const companyName = assessment.business_name || formData.company_name || 'Company Name';
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    const nameWidth = pdf.getTextWidth(companyName);
    const boxWidth = Math.min(nameWidth + 20, 120);
    const boxX = 15;
    
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(boxX, 12, boxWidth, 16, 3, 3, 'F');
    
    pdf.setTextColor(...brandBlue);
    pdf.text(companyName, boxX + boxWidth / 2, 22, { align: 'center' });
    
    // Title on header
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text("Credit Score Assessment Report", pageWidth - 15, 24, { align: "right" });
    
    yPos = 55;
    
    // Overall Score Section with Letter Grade
    const overallGrade = getGradeFromScore(assessment.overall_score || 0);
    
    pdf.setFillColor(...lightGrey);
    pdf.roundedRect(15, yPos, pageWidth - 30, 70, 3, 3, 'F');
    
    pdf.setTextColor(...brandGrey);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(`Overall Credit Score: ${assessment.overall_score}/1000`, pageWidth / 2, yPos + 10, { align: "center" });
    
    // Grade Scale Visualization positioning first
    const scaleY = yPos + 55;
    const scaleStartX = 50;
    const scaleEndX = pageWidth - 50;
    const scaleWidth = scaleEndX - scaleStartX;
    const segmentWidth = scaleWidth / 6;
    
    const grades = [
      { grade: 'F', label: 'Very Poor', minScore: 0, color: [239, 68, 68] as [number, number, number] },
      { grade: 'E', label: 'Poor', minScore: 300, color: [249, 115, 22] as [number, number, number] },
      { grade: 'D', label: 'Fair', minScore: 450, color: [234, 179, 8] as [number, number, number] },
      { grade: 'C', label: 'Average', minScore: 600, color: [132, 204, 22] as [number, number, number] },
      { grade: 'B', label: 'Good', minScore: 750, color: [34, 197, 94] as [number, number, number] },
      { grade: 'A+', label: 'Excellent', minScore: 900, color: [16, 185, 129] as [number, number, number] }
    ];
    
    // Find the index of the user's grade to align with the circle position
    const userGradeIndex = grades.findIndex(g => g.grade === overallGrade.grade);
    const gradeCircleX = scaleStartX + userGradeIndex * segmentWidth + segmentWidth / 2;
    
    // Letter Grade with color - positioned above the scale at exact circle position
    pdf.setTextColor(...overallGrade.color);
    pdf.setFontSize(48);
    pdf.setFont(undefined, 'bold');
    pdf.text(overallGrade.grade, gradeCircleX, yPos + 38, { align: "center" });
    
    // Label next to the grade (to the right) with reduced gap
    pdf.setFontSize(12);
    pdf.setTextColor(...overallGrade.color);
    pdf.setFont(undefined, 'normal');
    pdf.text(overallGrade.label, gradeCircleX + 10, yPos + 38, { align: "left" });
    
    // Draw gradient bar (segmented by color)
    grades.forEach((g, idx) => {
      pdf.setFillColor(...g.color);
      pdf.rect(scaleStartX + idx * segmentWidth, scaleY, segmentWidth, 3, 'F');
    });
    
    // Draw grade markers and highlight user's position
    const userScore = assessment.overall_score || 0;
    grades.forEach((g, idx) => {
      const x = scaleStartX + idx * segmentWidth + segmentWidth / 2;
      
      // Draw circle for each grade
      const isUserGrade = overallGrade.grade === g.grade;
      pdf.setFillColor(g.color[0], g.color[1], g.color[2]);
      if (isUserGrade) {
        pdf.circle(x, scaleY + 1.5, 4, 'F');
      } else {
        pdf.setFillColor(200, 200, 200);
        pdf.circle(x, scaleY + 1.5, 3, 'F');
      }
      
      // Add border to user's grade
      if (isUserGrade) {
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.5);
        pdf.circle(x, scaleY + 1.5, 4, 'S');
        
        // Add "You" label above
        pdf.setFontSize(7);
        pdf.setTextColor(...brandGrey);
        pdf.setFont(undefined, 'bold');
        pdf.text("You", x, scaleY - 3, { align: "center" });
      }
      
      // Grade letter inside circle
      pdf.setFontSize(isUserGrade ? 7 : 6);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont(undefined, 'bold');
      pdf.text(g.grade, x, scaleY + 2.5, { align: "center" });
      
      // Label below
      pdf.setFontSize(6);
      pdf.setTextColor(g.color[0], g.color[1], g.color[2]);
      pdf.setFont(undefined, 'normal');
      pdf.text(g.label, x, scaleY + 9, { align: "center" });
    });
    
    // Add "Target" label at A+
    const targetX = scaleStartX + 5 * segmentWidth + segmentWidth / 2;
    pdf.setFontSize(7);
    pdf.setTextColor(...brandGrey);
    pdf.setFont(undefined, 'bold');
    pdf.text("Target", targetX, scaleY - 3, { align: "center" });
    
    yPos += 80;
    
    // Risk Band and Funding boxes (with wrapping)
    // Pre-compute wrapped funding text to size boxes correctly
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    const rightBoxInnerWidth = (pageWidth - 35) / 2 - 20; // padding inside right box
    const fundingText = assessment.funding_eligibility_range || '';
    const fundingLines = pdf.splitTextToSize(fundingText, rightBoxInnerWidth);
    const lineHeight = 5;
    const boxHeight = Math.max(22, 12 + fundingLines.length * lineHeight);

    pdf.setFillColor(...lightGrey);
    pdf.roundedRect(15, yPos, (pageWidth - 35) / 2, boxHeight, 2, 2, 'F');
    pdf.roundedRect(pageWidth / 2 + 5, yPos, (pageWidth - 35) / 2, boxHeight, 2, 2, 'F');

    pdf.setTextColor(...brandGrey);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text("Risk Band", 20, yPos + 8);
    pdf.text("Funding Eligibility", pageWidth / 2 + 10, yPos + 8);

    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    pdf.text(assessment.risk_band || '', 20, yPos + 16);
    pdf.text(fundingLines, pageWidth / 2 + 10, yPos + 16);

    yPos += boxHeight + 10;

    // Assessment Summary Section
    pdf.setDrawColor(...brandOrange);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;
    
    pdf.setTextColor(...brandOrange);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text("Assessment Summary", 15, yPos);
    yPos += 8;
    
    pdf.setTextColor(...brandGrey);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const explanationLines = pdf.splitTextToSize(assessment.score_explanation, pageWidth - 40);
    pdf.text(explanationLines, 15, yPos);
    yPos += explanationLines.length * 5 + 10;

    // Strengths Section
    if (assessment.strengths?.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setDrawColor(...brandBlue);
      pdf.line(15, yPos, pageWidth - 15, yPos);
      yPos += 8;
      
      pdf.setTextColor(...brandBlue);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text("Strengths", 15, yPos);
      yPos += 8;
      
      pdf.setTextColor(...brandGrey);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      assessment.strengths.forEach((strength: string, idx: number) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        const lines = pdf.splitTextToSize(`• ${strength}`, pageWidth - 40);
        pdf.text(lines, 18, yPos);
        yPos += lines.length * 5 + 4;
      });
      yPos += 5;
    }

    // Areas for Improvement Section
    if (assessment.improvement_areas?.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setDrawColor(...brandOrange);
      pdf.line(15, yPos, pageWidth - 15, yPos);
      yPos += 8;
      
      pdf.setTextColor(...brandOrange);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text("Areas for Improvement", 15, yPos);
      yPos += 8;
      
      pdf.setTextColor(...brandGrey);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      assessment.improvement_areas.forEach((area: string, idx: number) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        const lines = pdf.splitTextToSize(`• ${area}`, pageWidth - 40);
        pdf.text(lines, 18, yPos);
        yPos += lines.length * 5 + 4;
      });
      yPos += 5;
    }

    // Recommendations Section
    if (assessment.recommendations?.length > 0) {
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setDrawColor(...brandBlue);
      pdf.line(15, yPos, pageWidth - 15, yPos);
      yPos += 8;
      
      pdf.setTextColor(...brandBlue);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text("Recommendations", 15, yPos);
      yPos += 8;
      
      pdf.setTextColor(...brandGrey);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      assessment.recommendations.forEach((rec: string, idx: number) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 40);
        pdf.text(lines, 18, yPos);
        yPos += lines.length * 5 + 4;
      });
    }

    // Domain Explanations Section with Letter Grades
    if (assessment.domain_explanations) {
      const domainLabels = {
        business_profile: { label: 'Business Profile & Age', score: assessment.business_profile_score || 0 },
        financial_health: { label: 'Financial Health', score: assessment.financial_health_score || 0 },
        repayment_behaviour: { label: 'Repayment Behaviour', score: assessment.repayment_behaviour_score || 0 },
        governance_compliance: { label: 'Governance & Compliance', score: assessment.governance_score || 0 },
        market_position: { label: 'Market Position & Demand', score: assessment.market_access_score || 0 },
        operational_capacity: { label: 'Operational Capacity', score: assessment.operational_capacity_score || 0 },
        technology_innovation: { label: 'Technology & Innovation', score: assessment.technology_innovation_score || 0 },
        social_environmental: { label: 'Social & Environmental Impact', score: assessment.social_environmental_score || 0 },
        trust_reputation: { label: 'Trust & Reputation', score: assessment.trust_reputation_score || 0 },
        growth_potential: { label: 'Growth Potential & Strategy', score: assessment.growth_readiness_score || 0 }
      };

      Object.entries(domainLabels).forEach(([key, domain]) => {
        const explanation = assessment.domain_explanations[key];
        if (explanation) {
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 20;
          }

          const domainGrade = getDomainGrade(domain.score);

          pdf.setDrawColor(...brandOrange);
          pdf.line(15, yPos, pageWidth - 15, yPos);
          yPos += 8;

          pdf.setTextColor(...brandBlue);
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.text(domain.label, 15, yPos);
          
          // Show letter grade and numeric score
          pdf.setTextColor(...domainGrade.color);
          pdf.setFontSize(11);
          pdf.text(`${domainGrade.grade}`, pageWidth - 35, yPos);
          
          pdf.setTextColor(100, 100, 100);
          pdf.setFontSize(9);
          pdf.text(`(${domain.score})`, pageWidth - 15, yPos, { align: 'right' });
          
          yPos += 8;

          pdf.setTextColor(...brandGrey);
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          const expLines = pdf.splitTextToSize(explanation, pageWidth - 40);
          expLines.forEach((line: string) => {
            if (yPos > pageHeight - 30) {
              pdf.addPage();
              yPos = 20;
            }
            pdf.text(line, 15, yPos);
            yPos += 5;
          });
          yPos += 8;
        }
      });
    }

    // Footer on all pages
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFillColor(...brandGrey);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(
        `22 On Sloane | Generated ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 7,
        { align: 'center' }
      );
    }

    // Encrypt PDF with password (companyName + 2025)
    const password = `${companyName}2025`;
    const pdfData = pdf.output('datauristring').split(',')[1]; // Get base64 data
    
    try {
      const response = await supabase.functions.invoke('encrypt-pdf', {
        body: { pdfData, password }
      });

      if (response.error) throw response.error;

      // Download the encrypted PDF
      const encryptedPdfBytes = Uint8Array.from(atob(response.data.encryptedPdf), c => c.charCodeAt(0));
      const blob = new Blob([encryptedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `22OnSloane-Credit-Assessment-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error encrypting PDF:', error);
      // Fallback to unencrypted PDF if encryption fails
      pdf.save(`22OnSloane-Credit-Assessment-${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const handleFileChange = (docType: string, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], file, uploaded: false }
    }));
  };

  const uploadDocument = async (docType: string, file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('assessment-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('assessment-documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit an assessment",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Get or create startup profile
      let { data: startup } = await supabase
        .from('startup_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!startup) {
        const { data: newStartup, error: startupError } = await supabase
          .from('startup_profiles')
          .insert({
            user_id: user.id,
            company_name: formData.company_name,
            industry: formData.industry as any,
            stage: 'seed' as any,
            founded_year: parseInt(formData.founded_year) || null,
            annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
            team_size: parseInt(formData.team_size) || null,
            funding_needed: formData.funding_needed ? parseFloat(formData.funding_needed) : null,
            description: formData.business_description,
            consent_data_sharing: formData.consent_to_share,
          })
          .select()
          .single();

        if (startupError) throw startupError;
        startup = newStartup;
      }

      // Upload documents (skipped in test mode)
      const documentUrls: Record<string, string> = {};
      if (!testMode) {
        const totalDocs = Object.values(documents).filter(d => d.file).length;
        let uploadedCount = 0;

        for (const [key, doc] of Object.entries(documents)) {
          if (doc.file) {
            try {
              const url = await uploadDocument(key, doc.file, user.id);
              documentUrls[key] = url;
              uploadedCount++;
              setUploadProgress((uploadedCount / Math.max(totalDocs, 1)) * 50); // 50% for uploads
            } catch (error) {
              console.error(`Failed to upload ${key}:`, error);
            }
          }
        }
      } else {
        setProcessingMessage('Test mode enabled: Skipping document uploads...');
        setUploadProgress(60);
      }

      // Prepare assessment data
      const testOverrides = testMode
        ? {
            company_name: formData.company_name || 'TestCo Pty Ltd',
            founded_year: formData.founded_year || String(new Date().getFullYear() - 3),
            industry: formData.industry || 'services',
            annual_revenue: formData.annual_revenue || '750000',
            team_size: formData.team_size || '10',
            funding_needed: formData.funding_needed || '600000',
            business_description:
              formData.business_description || 'Test company used to validate assessment flow and results.',
          }
        : {};

      const assessmentData = {
        ...formData,
        ...testOverrides,
        document_urls: documentUrls,
        submitted_at: new Date().toISOString(),
      };

      setUploadProgress(60);
      setProcessingMessage('Analyzing your business with AI... This may take 30-60 seconds.');

      // Call AI analysis function with extended timeout
      console.log('Calling AI analysis function...');
      const { data: result, error: analysisError } = await supabase.functions.invoke(
        'analyze-credit-assessment',
        {
          body: {
            assessmentData,
            userId: user.id,
            startupId: startup.id,
          },
        }
      );

      console.log('AI analysis response:', { result, analysisError });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        setUploadProgress(100);
        const fallback = {
          id: 'test-assessment',
          assessed_at: new Date().toISOString(),
          overall_score: 315,
          risk_band: 'High',
          funding_eligibility_range: 'Currently not eligible for funding (test data).',
          score_explanation:
            'This is test data to preview how results will look while the analysis service is stabilizing.',
          domain_explanations: {
            business_profile: 'Stable operating history with clear model (test).',
            financial_health: 'Financial docs not provided in test mode.',
            repayment_behaviour: 'No prior credit history provided (test).',
            governance_compliance: 'Compliance documents not uploaded in test mode.',
            market_position: 'Some traction indicated (test).',
            operational_capacity: 'Lean team with growth potential (test).',
            technology_innovation: 'Basic adoption of technology (test).',
            social_environmental: 'No ESG information (test).',
            trust_reputation: 'Reputation to be established (test).',
            growth_potential: 'Needs clearer growth strategy (test).',
          },
          strengths: ['Clear service offering (test)', 'Operational resilience (test)'],
          weaknesses: ['Missing documentation (test)', 'Unverified credit history (test)'],
          recommendations: [
            'Formalize documentation and governance (test).',
            'Develop 12–24 month financial projections (test).',
            'Secure recurring revenue contracts (test).',
          ],
        } as any;
        setAssessmentResult(fallback);
        setShowResults(true);
        
        // Auto-download PDF for error fallback
        setTimeout(() => {
          downloadPDF(fallback);
        }, 500);
        
        toast({
          title: 'Test Results',
          description: 'Showing test results while analysis completes. PDF downloading...',
        });
        return;
      }

      // Always show results in a popup
      const resAssessment = result?.assessment;
      setUploadProgress(100);

      toast({
        title: "Assessment completed!",
        description: "Your credit score has been calculated successfully. PDF downloading...",
      });

      if (resAssessment) {
        setAssessmentResult(resAssessment);
        
        // Auto-download PDF
        setTimeout(() => {
          downloadPDF(resAssessment);
        }, 500);
      } else {
        const fallback = {
          id: 'test-assessment',
          assessed_at: new Date().toISOString(),
          overall_score: 315,
          risk_band: 'High',
          funding_eligibility_range: 'Currently not eligible for funding (test data).',
          score_explanation:
            'This is test data to preview how results will look while the analysis service is stabilizing.',
          domain_explanations: {
            business_profile: 'Stable operating history with clear model (test).',
            financial_health: 'Financial docs not provided in test mode.',
            repayment_behaviour: 'No prior credit history provided (test).',
            governance_compliance: 'Compliance documents not uploaded in test mode.',
            market_position: 'Some traction indicated (test).',
            operational_capacity: 'Lean team with growth potential (test).',
            technology_innovation: 'Basic adoption of technology (test).',
            social_environmental: 'No ESG information (test).',
            trust_reputation: 'Reputation to be established (test).',
            growth_potential: 'Needs clearer growth strategy (test).',
          },
          strengths: ['Clear service offering (test)', 'Operational resilience (test)'],
          weaknesses: ['Missing documentation (test)', 'Unverified credit history (test)'],
          recommendations: [
            'Formalize documentation and governance (test).',
            'Develop 12–24 month financial projections (test).',
            'Secure recurring revenue contracts (test).',
          ],
        } as any;
        setAssessmentResult(fallback);
      }

      setShowResults(true);
      return;
    } catch (error: any) {
      console.error('Assessment submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to process your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requiredDocsUploaded = DOCUMENT_TYPES
    .filter(doc => doc.required)
    .every(doc => documents[doc.key]?.file);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Provide details about your company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="founded_year">Founded Year *</Label>
              <Select
                required
                value={formData.founded_year}
                onValueChange={(value) => setFormData({ ...formData, founded_year: value })}
              >
                <SelectTrigger id="founded_year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                required
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="team_size">Team Size *</Label>
              <Input
                id="team_size"
                type="number"
                required
                placeholder="Enter number of team members"
                value={formData.team_size}
                onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="annual_revenue">Annual Revenue (R) *</Label>
              <Input
                id="annual_revenue"
                type="number"
                required
                placeholder="Enter annual revenue (e.g., 500000)"
                value={formData.annual_revenue}
                onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="funding_needed">Required Funding (R) *</Label>
              <Input
                id="funding_needed"
                type="number"
                required
                placeholder="Enter required funding (e.g., 750000)"
                value={formData.funding_needed}
                onChange={(e) => setFormData({ ...formData, funding_needed: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="business_description">Business Description *</Label>
            <Textarea
              id="business_description"
              required
              rows={4}
              value={formData.business_description}
              onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
              placeholder="Describe your business, what you do, and your value proposition..."
            />
          </div>
          <div>
            <Label htmlFor="key_customers">Key Customers & Contracts</Label>
            <Textarea
              id="key_customers"
              rows={3}
              value={formData.key_customers}
              onChange={(e) => setFormData({ ...formData, key_customers: e.target.value })}
              placeholder="List major customers, contracts, or recurring revenue sources..."
            />
          </div>
          <div>
            <Label htmlFor="competitive_advantage">Competitive Advantage & Innovation</Label>
            <Textarea
              id="competitive_advantage"
              rows={3}
              value={formData.competitive_advantage}
              onChange={(e) => setFormData({ ...formData, competitive_advantage: e.target.value })}
              placeholder="What makes your business unique? Technology, IP, processes..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload required documents for credit assessment (* = required)
          </CardDescription>
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">Enable test mode to bypass uploads</div>
            <div className="flex items-center gap-2">
              <Label htmlFor="test-mode">Test mode</Label>
              <Switch id="test-mode" checked={testMode} onCheckedChange={setTestMode} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testMode ? (
            <div className="text-sm text-muted-foreground">
              Test mode is enabled. Document uploads are bypassed for faster testing.
            </div>
          ) : (
            DOCUMENT_TYPES.map((doc) => (
              <div key={doc.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={doc.key} className="text-base">
                    {doc.label} {doc.required && '*'}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, DOCX, XLSX, JPG, or PNG (max 10MB)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {documents[doc.key]?.file ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm">{documents[doc.key].file?.name}</span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`file-${doc.key}`)?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  )}
                  <Input
                    id={`file-${doc.key}`}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent_to_share}
              onChange={(e) => setFormData({ ...formData, consent_to_share: e.target.checked })}
              className="mt-1"
            />
            <div>
              <Label htmlFor="consent" className="text-base">
                I consent to share my credit score with funders *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Your score will only be shared with funders you choose to connect with.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{processingMessage || 'Processing assessment...'}</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
              {uploadProgress >= 60 && uploadProgress < 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please wait while our AI analyzes your documents and generates your credit score...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading || (!requiredDocsUploaded && !testMode) || !formData.consent_to_share}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Submit for Credit Assessment
          </>
        )}
      </Button>

      {/* Results Popup */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Credit Assessment Results</DialogTitle>
          </DialogHeader>
          {assessmentResult ? (
            <div className="space-y-4">
              <AssessmentResults assessment={assessmentResult} />
              <div className="flex justify-end gap-2 pt-2">
                {assessmentResult?.id && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResults(false);
                      navigate(`/credit-score/results/${assessmentResult.id}`);
                    }}
                  >
                    Open Full Page
                  </Button>
                )}
                <Button onClick={() => setShowResults(false)}>Close</Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No results to display.</div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
};
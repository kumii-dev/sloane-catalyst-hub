import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AssessmentResults } from "@/components/assessment/AssessmentResults";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

// Credit Score Grade Mapping (Kudough-based scale for 0-1000 range)
const getGradeFromScore = (score: number): { grade: string; label: string; color: [number, number, number] } => {
  if (score >= 900) return { grade: 'A+', label: 'Excellent', color: [16, 185, 129] as [number, number, number] };
  if (score >= 750) return { grade: 'B', label: 'Good', color: [34, 197, 94] as [number, number, number] };
  if (score >= 600) return { grade: 'C', label: 'Average', color: [132, 204, 22] as [number, number, number] };
  if (score >= 450) return { grade: 'D', label: 'Fair', color: [234, 179, 8] as [number, number, number] };
  if (score >= 300) return { grade: 'E', label: 'Poor', color: [249, 115, 22] as [number, number, number] };
  return { grade: 'F', label: 'Very Poor', color: [239, 68, 68] as [number, number, number] };
};

const CreditScoreResults = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    const companyName = assessment.business_name || 'Company Name';
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
    
    // Grade Scale Visualization
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
    
    const userGradeIndex = grades.findIndex(g => g.grade === overallGrade.grade);
    const gradeCircleX = scaleStartX + userGradeIndex * segmentWidth + segmentWidth / 2;
    
    // Letter Grade with color
    pdf.setTextColor(...overallGrade.color);
    pdf.setFontSize(48);
    pdf.setFont(undefined, 'bold');
    pdf.text(overallGrade.grade, gradeCircleX, yPos + 38, { align: "center" });
    
    pdf.setFontSize(12);
    pdf.setTextColor(...overallGrade.color);
    pdf.setFont(undefined, 'normal');
    pdf.text(overallGrade.label, gradeCircleX + 10, yPos + 38, { align: "left" });
    
    // Draw gradient bar
    grades.forEach((g, idx) => {
      pdf.setFillColor(...g.color);
      pdf.rect(scaleStartX + idx * segmentWidth, scaleY, segmentWidth, 3, 'F');
    });
    
    // Draw grade markers
    grades.forEach((g, idx) => {
      const x = scaleStartX + idx * segmentWidth + segmentWidth / 2;
      const isUserGrade = overallGrade.grade === g.grade;
      
      pdf.setFillColor(g.color[0], g.color[1], g.color[2]);
      if (isUserGrade) {
        pdf.circle(x, scaleY + 1.5, 4, 'F');
      } else {
        pdf.setFillColor(200, 200, 200);
        pdf.circle(x, scaleY + 1.5, 3, 'F');
      }
      
      if (isUserGrade) {
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.5);
        pdf.circle(x, scaleY + 1.5, 4, 'S');
      }
      
      pdf.setFontSize(isUserGrade ? 7 : 6);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont(undefined, 'bold');
      pdf.text(g.grade, x, scaleY + 2.5, { align: "center" });
      
      pdf.setFontSize(6);
      pdf.setTextColor(g.color[0], g.color[1], g.color[2]);
      pdf.setFont(undefined, 'normal');
      pdf.text(g.label, x, scaleY + 9, { align: "center" });
    });
    
    yPos += 80;
    
    // Risk Band and Funding boxes
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(11);
    const rightBoxInnerWidth = (pageWidth - 35) / 2 - 20;
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
      
      assessment.strengths.forEach((strength: string) => {
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
      
      assessment.improvement_areas.forEach((area: string) => {
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
      
      assessment.recommendations.forEach((rec: string) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 40);
        pdf.text(lines, 18, yPos);
        yPos += lines.length * 5 + 4;
      });
    }

    // Footer
    const timestamp = new Date().toLocaleDateString();
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated on ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: "center" });

    pdf.save(`credit-assessment-${assessment.business_name || 'report'}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Your credit assessment report has been downloaded.",
    });
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('credit_assessments')
          .select('*')
          .eq('id', assessmentId)
          .maybeSingle();

        if (error) throw error;
        setAssessment(data);
      } catch (error: any) {
        console.error('Error fetching assessment:', error);
        toast({
          title: "Error",
          description: "Failed to load assessment results",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId, navigate, toast]);

  return (
    <Layout showSidebar={true}>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/credit-score')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Credit Score
          </Button>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : assessment ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Your Credit Assessment Results</h1>
                <p className="text-lg text-muted-foreground">
                  Assessed on {new Date(assessment.assessed_at).toLocaleDateString()}
                </p>
              </div>
              <AssessmentResults assessment={assessment} />
              
              <div className="mt-8 mb-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/credit-score/assessment')}
                >
                  Retake Assessment
                </Button>
                <Button
                  onClick={() => downloadPDF(assessment)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Report
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Assessment not found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default CreditScoreResults;
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

const TEAM_SIZE_OPTIONS = [
  '1-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100', '100+'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

export const AssessmentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  
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
            annual_revenue: parseFloat(formData.annual_revenue) || null,
            team_size: parseInt(formData.team_size) || null,
            funding_needed: parseFloat(formData.funding_needed) || null,
            description: formData.business_description,
            consent_data_sharing: formData.consent_to_share,
          })
          .select()
          .single();

        if (startupError) throw startupError;
        startup = newStartup;
      }

      // Upload documents
      const documentUrls: Record<string, string> = {};
      const totalDocs = Object.values(documents).filter(d => d.file).length;
      let uploadedCount = 0;

      for (const [key, doc] of Object.entries(documents)) {
        if (doc.file) {
          try {
            const url = await uploadDocument(key, doc.file, user.id);
            documentUrls[key] = url;
            uploadedCount++;
            setUploadProgress((uploadedCount / totalDocs) * 50); // 50% for uploads
          } catch (error) {
            console.error(`Failed to upload ${key}:`, error);
          }
        }
      }

      // Prepare assessment data
      const assessmentData = {
        ...formData,
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
        throw new Error(analysisError.message || 'Failed to analyze assessment');
      }

      if (!result || !result.assessment) {
        throw new Error('Invalid response from analysis service');
      }

      setUploadProgress(100);

      toast({
        title: "Assessment completed!",
        description: "Your credit score has been calculated successfully.",
      });

      // Navigate to results
      navigate(`/credit-score/results/${result.assessment.id}`);

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
              <Select
                required
                value={formData.team_size}
                onValueChange={(value) => setFormData({ ...formData, team_size: value })}
              >
                <SelectTrigger id="team_size">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="annual_revenue">Annual Revenue (ZAR)</Label>
              <Input
                id="annual_revenue"
                type="number"
                value={formData.annual_revenue}
                onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="funding_needed">Funding Needed (ZAR)</Label>
              <Input
                id="funding_needed"
                type="number"
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
        </CardHeader>
        <CardContent className="space-y-4">
          {DOCUMENT_TYPES.map((doc) => (
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
          ))}
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
        disabled={loading || !requiredDocsUploaded || !formData.consent_to_share}
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
    </form>
  );
};
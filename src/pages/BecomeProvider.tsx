import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, CheckCircle, FileText, Building2, Phone, Globe, Upload, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TriangleAvatar } from '@/components/ui/triangle-avatar';

const BecomeProvider = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    company_name: '',
    description: '',
    website: '',
    contact_email: '',
    phone: '',
    business_registration_number: '',
    proof_document_url: '',
    logo_url: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    checkExistingApplication();
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `provider-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-files')
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public-files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const checkExistingApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setExistingApplication(data);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register as a provider",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.company_name || !formData.description || !formData.contact_email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one software category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload logo if provided
      let logoUrl = formData.logo_url;
      if (logoFile) {
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from('service_providers')
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          description: formData.description,
          website: formData.website || null,
          contact_email: formData.contact_email,
          phone: formData.phone || null,
          business_registration_number: formData.business_registration_number || null,
          proof_document_url: formData.proof_document_url || null,
          logo_url: logoUrl || null,
          service_categories: selectedCategories,
          vetting_status: 'pending',
        });

      if (error) throw error;

      // Add pending role
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'software_provider_pending',
        });

      toast({
        title: "Application submitted!",
        description: "Your registration is under review — we'll notify you once approved to start listing!",
      });

      navigate('/provider-dashboard');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Layout showSidebar={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (existingApplication) {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {existingApplication.vetting_status === 'approved' ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : existingApplication.vetting_status === 'rejected' ? (
                  <Shield className="h-16 w-16 text-destructive" />
                ) : (
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {existingApplication.vetting_status === 'approved' && 'Application Approved!'}
                {existingApplication.vetting_status === 'rejected' && 'Application Rejected'}
                {existingApplication.vetting_status === 'pending' && 'Application Under Review'}
              </CardTitle>
              <CardDescription>
                {existingApplication.vetting_status === 'approved' && 
                  'You can now start listing your software services'}
                {existingApplication.vetting_status === 'rejected' && 
                  'Please contact support for more information'}
                {existingApplication.vetting_status === 'pending' && 
                  'Your registration is under review — we\'ll notify you once approved!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Company:</strong> {existingApplication.company_name}</div>
                  <div><strong>Status:</strong> <Badge variant={
                    existingApplication.vetting_status === 'approved' ? 'default' :
                    existingApplication.vetting_status === 'rejected' ? 'destructive' : 'secondary'
                  }>{existingApplication.vetting_status}</Badge></div>
                  <div><strong>Submitted:</strong> {new Date(existingApplication.submitted_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              {existingApplication.vetting_status === 'approved' && (
                <Button className="w-full" onClick={() => navigate('/provider-dashboard')}>
                  Go to Provider Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4">Software Service Provider</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Become a Verified Provider
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our trusted marketplace and connect your software services with SMMEs and startups across South Africa
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Verified Badge</h3>
              <p className="text-sm text-muted-foreground">
                Get verified status to build trust with potential customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Market Reach</h3>
              <p className="text-sm text-muted-foreground">
                Connect with thousands of SMMEs and startups actively seeking solutions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Easy Management</h3>
              <p className="text-sm text-muted-foreground">
                Simple dashboard to manage listings, subscriptions, and analytics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Provider Registration</CardTitle>
            <CardDescription>
              Complete the form below to register. Our team will review and verify your application within 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <Label>Company Logo</Label>
                  <div className="flex items-start gap-4 mt-2">
                    {logoPreview ? (
                      <div className="relative">
                        <TriangleAvatar
                          src={logoPreview}
                          alt="Company logo preview"
                          className="w-24 h-24"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview('');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/50">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload your company logo (max 5MB, PNG/JPG recommended)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Your Company Name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Company Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your company and software offerings"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contact@company.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+27 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourcompany.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_registration">Business Registration Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="business_registration"
                      value={formData.business_registration_number}
                      onChange={(e) => setFormData({ ...formData, business_registration_number: e.target.value })}
                      placeholder="2021/123456/07"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Helps verify your business legitimacy
                  </p>
                </div>

                {/* Software Categories */}
                <div>
                  <Label>Software Categories You Supply *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all categories that apply to your software offerings
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 border rounded-lg bg-muted/20">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <label
                          htmlFor={category.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Our team reviews your application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Identity and business verification (typically within 48 hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Once approved, you can immediately start listing software services</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || uploading}
                >
                  {loading || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? 'Uploading...' : 'Submitting...'}
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BecomeProvider;

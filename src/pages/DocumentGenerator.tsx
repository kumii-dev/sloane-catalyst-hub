import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Upload, Zap, Shield, Download } from "lucide-react";

const DocumentGenerator = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced AI analyzes your business data and generates professional, comprehensive plans following industry best practices."
    },
    {
      icon: Upload,
      title: "Multiple Input Methods",
      description: "Choose between structured forms or document uploads. Flexible input options to match your workflow."
    },
    {
      icon: Download,
      title: "Edit & Export",
      description: "Fine-tune generated content with our editor and export to professional formats ready for investors."
    }
  ];

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-indigo-500/10 via-background to-purple-500/10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center">
              <FileText className="h-10 w-10 text-indigo-600" />
            </div>
          </div>
          <Badge variant="outline" className="mb-4">Document Generator</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Create Investor-Ready Business Plans in Minutes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Powered by advanced AI, our platform generates comprehensive 50-60 page business plans that 
            match professional standards. Perfect for entrepreneurs, startups, and growing businesses.
          </p>
          <Button size="lg" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Start Creating Your Plan
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Main Content Card */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
              <CardDescription>Three simple steps to your professional business plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-indigo-600">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Input Your Business Information</h3>
                  <p className="text-muted-foreground">
                    Fill out our structured form or upload existing documents. Our AI will analyze your business model, 
                    market, competition, and financials.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-indigo-600">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Generates Your Plan</h3>
                  <p className="text-muted-foreground">
                    Our advanced AI engine creates a comprehensive business plan with executive summary, market analysis, 
                    financial projections, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-indigo-600">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Review, Edit & Export</h3>
                  <p className="text-muted-foreground">
                    Fine-tune the generated content with our intuitive editor, then export to PDF, Word, or PowerPoint 
                    formats ready for investors.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button size="lg" className="w-full md:w-auto">
                  Get Started Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default DocumentGenerator;

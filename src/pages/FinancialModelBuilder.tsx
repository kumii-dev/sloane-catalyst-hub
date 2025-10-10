import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, FileSpreadsheet, TrendingUp, Building, Link2 } from "lucide-react";
import { useState } from "react";

const FinancialModelBuilder = () => {
  const [selectedStandard, setSelectedStandard] = useState<"IFRS" | "US GAAP" | null>(null);

  const features = [
    {
      icon: Building,
      title: "Multi-Standard Support",
      description: "Switch between IFRS and US GAAP with automatic adjustments to terminology and treatments"
    },
    {
      icon: TrendingUp,
      title: "Dynamic Scenarios",
      description: "Model Base, Best, and Worst case scenarios with instant recalculation"
    },
    {
      icon: Link2,
      title: "Fully Integrated",
      description: "All statements automatically linked with working capital, debt schedules, and tax calculations"
    }
  ];

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center">
              <Calculator className="h-10 w-10 text-cyan-600" />
            </div>
          </div>
          <Badge variant="outline" className="mb-4">Financial Model Builder</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            3-Statement Financial Model
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build dynamic, fully integrated Income Statement, Balance Sheet, and Cash Flow 
            models with IFRS and US GAAP support
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-cyan-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Reporting Standard Selection */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Choose Reporting Standard</CardTitle>
              <CardDescription className="text-center">
                Select your preferred accounting framework to begin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedStandard === "IFRS" ? "ring-2 ring-cyan-500 bg-cyan-500/5" : ""
                  }`}
                  onClick={() => setSelectedStandard("IFRS")}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">IFRS</CardTitle>
                    <CardDescription>
                      International Financial Reporting Standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Used globally by publicly traded companies. Principles-based framework 
                      providing flexibility in application.
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedStandard === "US GAAP" ? "ring-2 ring-cyan-500 bg-cyan-500/5" : ""
                  }`}
                  onClick={() => setSelectedStandard("US GAAP")}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">US GAAP</CardTitle>
                    <CardDescription>
                      Generally Accepted Accounting Principles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Rules-based standard used primarily in the United States. Detailed guidance 
                      for specific accounting treatments.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-6 border-t space-y-4">
                <h3 className="font-semibold text-lg">What's Included</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <span>Integrated Income Statement, Balance Sheet, and Cash Flow Statement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <span>Base, Best, and Worst case scenario modeling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Link2 className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <span>Automatic linking of working capital, debt schedules, and tax calculations</span>
                  </li>
                </ul>

                <Button 
                  size="lg" 
                  className="w-full md:w-auto" 
                  disabled={!selectedStandard}
                >
                  Start Building Model
                </Button>
                {!selectedStandard && (
                  <p className="text-sm text-muted-foreground">
                    Please select a reporting standard to continue
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default FinancialModelBuilder;

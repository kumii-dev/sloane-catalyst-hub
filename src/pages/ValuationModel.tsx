import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LineChart, FileText, TrendingUp, Award, Users } from "lucide-react";
import { CurrencyIcon } from "@/components/ui/currency-icon";

const ValuationModel = () => {
  const methodologies = [
    {
      title: "Discounted Cash Flow (DCF)",
      icon: FileText,
      color: "text-blue-600",
      description: "Present value of projected future cash flows, discounted at weighted average cost of capital.",
      details: "DCF is widely regarded as the most theoretically sound valuation method. It values a company based on the present value of its expected future cash flows, accounting for the time value of money and business risk."
    },
    {
      title: "Comparable Company Multiples",
      icon: TrendingUp,
      color: "text-orange-600",
      description: "Market-based valuation using revenue, EBITDA, or earnings multiples from similar public companies.",
      details: "This method values a company relative to its peers by applying valuation multiples (such as P/E, EV/EBITDA) derived from comparable publicly traded companies in the same industry."
    },
    {
      title: "Venture Capital (VC) Method",
      icon: Award,
      color: "text-green-600",
      description: "Investment-based approach accounting for expected exit value and required investor returns.",
      details: "Primarily used for early-stage companies, the VC method works backward from an anticipated exit value and required return rate to determine current valuation and equity stake."
    },
    {
      title: "Scorecard Valuation",
      icon: Users,
      color: "text-purple-600",
      description: "Comparative method adjusting base valuation by weighted factors like team, market size, and traction.",
      details: "This method starts with a base valuation derived from comparable companies and adjusts it based on qualitative factors such as management team, market opportunity, product/technology, competitive environment, and sales channels."
    }
  ];

  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-rose-500/10 via-background to-pink-500/10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center">
              <LineChart className="h-10 w-10 text-rose-600" />
            </div>
          </div>
          <Badge variant="outline" className="mb-4">Universal Valuation Platform</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Professional Multi-Method Business Valuation Engine
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comprehensive business valuations for companies at any stage—from ideation to publicly listed.
          </p>
          <Button size="lg" asChild>
            <a href="https://business-evaluation.kumii-test.com/" target="_blank" rel="noopener noreferrer">
              Begin Your Valuation
            </a>
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="methodology" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="methodology">Methodology</TabsTrigger>
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="methodology" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-rose-600" />
                    About This Valuation Model
                  </CardTitle>
                  <CardDescription>
                    Professional-grade multi-method valuation engine based on industry-standard frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    This Universal Valuation Platform combines multiple valuation methodologies to provide comprehensive 
                    business valuations suitable for companies at any stage—from ideation to publicly listed.
                  </p>
                  <p className="text-muted-foreground">
                    The model automatically weights methodologies based on company stage, ensuring the most appropriate 
                    methods receive the highest consideration in the composite valuation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valuation Methodologies</CardTitle>
                  <CardDescription>Detailed explanation of each valuation approach</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {methodologies.map((method, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <method.icon className={`h-5 w-5 ${method.color}`} />
                            <div>
                              <div className="font-semibold">{method.title}</div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 pl-8 text-muted-foreground">
                            {method.details}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="input" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information Input</CardTitle>
                  <CardDescription>
                    Provide your business details to receive a comprehensive valuation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center py-12">
                      <CurrencyIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Start Your Valuation</h3>
                      <p className="text-muted-foreground mb-6">
                        Complete a comprehensive assessment to receive your business valuation
                      </p>
                      <Button size="lg" asChild>
                        <a href="https://business-evaluation.kumii-test.com/" target="_blank" rel="noopener noreferrer">
                          Begin Your Valuation
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Valuation Results</CardTitle>
                  <CardDescription>
                    Comprehensive valuation report with methodology breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <LineChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Complete the input section to generate your valuation results
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default ValuationModel;

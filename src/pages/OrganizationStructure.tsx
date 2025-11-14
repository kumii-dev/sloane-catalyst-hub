import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Download, Users, Shield, Code, Briefcase, FileText, Presentation } from "lucide-react";
import { generateOrganogramPdf } from "@/utils/organogramPdfGenerator";
import { generateOrganogramPowerPoint } from "@/utils/organogramPowerPointGenerator";
import { toast } from "sonner";

const OrganizationStructure = () => {
  const handleDownloadPdf = async () => {
    try {
      await generateOrganogramPdf();
      toast.success("Organogram PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadPowerPoint = () => {
    try {
      generateOrganogramPowerPoint();
      toast.success("Organogram PowerPoint downloaded successfully");
    } catch (error) {
      console.error("Error generating PowerPoint:", error);
      toast.error("Failed to generate PowerPoint");
    }
  };

  const roles = [
    {
      category: "Executive Leadership",
      icon: Users,
      color: "bg-primary",
      positions: [
        {
          title: "CEO / Managing Director",
          responsibilities: ["Strategic Direction", "Stakeholder Management", "Business Development"],
          count: 1
        },
        {
          title: "COO / CFO",
          responsibilities: ["Operations Management", "Financial Oversight", "Resource Allocation"],
          count: 1
        }
      ]
    },
    {
      category: "Governance & Compliance",
      icon: Shield,
      color: "bg-accent",
      positions: [
        {
          title: "Governance Manager",
          secondary: ["Acting Data Protection Officer", "Compliance Officer"],
          responsibilities: [
            "ISO 27001 Compliance",
            "Policy Management",
            "Audit Coordination",
            "Data Protection (POPIA/GDPR)",
            "Risk Management"
          ],
          count: 1
        }
      ]
    },
    {
      category: "Technology Leadership",
      icon: Code,
      color: "bg-secondary",
      positions: [
        {
          title: "CIO / CTO",
          secondary: ["Acting CISO", "Infrastructure Owner"],
          responsibilities: [
            "Technology Strategy",
            "Information Security",
            "Infrastructure Management",
            "Technical Architecture",
            "Vendor Management"
          ],
          count: 1
        }
      ]
    },
    {
      category: "Development & Support",
      icon: Code,
      color: "bg-muted",
      positions: [
        {
          title: "Senior Developer",
          secondary: ["Security Champion", "L2/L3 Support Lead"],
          responsibilities: [
            "Software Development",
            "Code Security Reviews",
            "Technical Support (L2/L3)",
            "Quality Assurance",
            "DevOps"
          ],
          count: 1
        },
        {
          title: "Developer",
          secondary: ["L1/L2 Support", "QA Specialist"],
          responsibilities: [
            "Software Development",
            "Technical Support (L1/L2)",
            "Quality Testing",
            "Documentation",
            "Bug Fixes"
          ],
          count: 1
        }
      ]
    },
    {
      category: "Product & Business",
      icon: Briefcase,
      color: "bg-primary/80",
      positions: [
        {
          title: "Product Lead / Owner",
          secondary: ["Acting Business Analyst"],
          responsibilities: [
            "Product Strategy",
            "Feature Prioritization",
            "User Research",
            "Business Requirements",
            "Stakeholder Communication"
          ],
          count: 1
        },
        {
          title: "Module Owners",
          modules: ["Mentorship", "Credit Scoring", "Document Generation", "Valuation", "Financial Model"],
          responsibilities: [
            "Domain Expertise",
            "Module Requirements",
            "User Acceptance Testing",
            "Training & Documentation",
            "Continuous Improvement"
          ],
          count: 2,
          note: "Distributed across modules"
        }
      ]
    }
  ];

  const committees = [
    {
      name: "Information Security Committee",
      members: ["CEO", "CTO (Chair)", "Governance Manager", "Senior Developer"],
      frequency: "Monthly",
      purpose: "Security oversight, risk review, incident response coordination"
    },
    {
      name: "Change Advisory Board",
      members: ["CTO (Chair)", "Product Lead", "Senior Developer", "Governance Manager"],
      frequency: "Bi-weekly",
      purpose: "Change approval, release planning, risk assessment"
    },
    {
      name: "Incident Response Team",
      members: ["CTO (Lead)", "Senior Developer", "Developer", "Governance Manager"],
      frequency: "On-demand",
      purpose: "Security incident management and response"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Users className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Organization Structure</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            22 On Sloane Capital (trading as Kumii) - ISO 27001 Compliant Structure
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownloadPdf} size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              Download PDF
            </Button>
            <Button onClick={handleDownloadPowerPoint} size="lg" variant="secondary" className="gap-2">
              <Presentation className="h-5 w-5" />
              Download PowerPoint
            </Button>
          </div>
        </div>

        {/* Company Overview */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Company Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold text-primary">8</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Executive Leadership</p>
              <p className="text-3xl font-bold text-primary">2</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Technical Team</p>
              <p className="text-3xl font-bold text-primary">3</p>
            </div>
          </CardContent>
        </Card>

        {/* Organizational Structure */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Functional Roles & Responsibilities</h2>
          
          {roles.map((category, idx) => (
            <Card key={idx} className="border-l-4" style={{ borderLeftColor: `hsl(var(--primary))` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <category.icon className="h-6 w-6 text-primary" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.positions.map((position, pidx) => (
                  <div key={pidx} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{position.title}</h3>
                          <span className="text-xs font-bold bg-yellow-300 text-gray-900 px-2 py-0.5 rounded">({position.count} {position.count === 1 ? "Person" : "People"})</span>
                        </div>
                        
                        {position.secondary && (
                          <div className="flex flex-wrap gap-2">
                            {position.secondary.map((sec, sidx) => (
                              <span key={sidx} className="text-xs font-bold bg-yellow-300 text-gray-900 px-2 py-0.5 rounded">({sec})</span>
                            ))}
                          </div>
                        )}

                        {position.modules && (
                          <div className="flex flex-wrap gap-2">
                            {position.modules.map((mod, midx) => (
                              <span key={midx} className="text-xs font-bold bg-yellow-300 text-gray-900 px-2 py-0.5 rounded">({mod})</span>
                            ))}
                          </div>
                        )}

                        {position.note && (
                          <p className="text-xs text-muted-foreground italic">{position.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Key Responsibilities:</p>
                      <ul className="grid md:grid-cols-2 gap-1 text-sm text-foreground">
                        {position.responsibilities.map((resp, ridx) => (
                          <li key={ridx} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {pidx < category.positions.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Governance Committees */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Governance Committees</h2>
          <p className="text-muted-foreground">
            Matrix structure enabling proper oversight with lean team
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {committees.map((committee, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{committee.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-yellow-300 text-gray-900 px-2 py-0.5 rounded">({committee.frequency})</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Members:</p>
                    <div className="space-y-1">
                      {committee.members.map((member, midx) => (
                        <p key={midx} className="text-sm flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {member}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Purpose:</p>
                    <p className="text-sm text-foreground">{committee.purpose}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Principles */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>ISO 27001 Compliance Approach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">✓ Clear Accountability</h4>
                <p className="text-sm text-muted-foreground">
                  Every ISO control has a designated responsible party with documented authority
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">✓ Matrix Responsibility</h4>
                <p className="text-sm text-muted-foreground">
                  Team members wear multiple hats with clear secondary responsibilities
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">✓ Segregation of Duties</h4>
                <p className="text-sm text-muted-foreground">
                  Code reviews by different developers, executive approval for critical changes
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">✓ Committee Oversight</h4>
                <p className="text-sm text-muted-foreground">
                  Regular governance meetings ensure proper oversight and decision-making
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationStructure;
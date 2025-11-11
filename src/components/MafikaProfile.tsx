import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Award, Shield, Zap, GraduationCap, Target, Briefcase, CheckCircle, MapPin, Phone, Mail } from "lucide-react";

export const MafikaProfile = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto" id="mafika-profile">
      {/* Header Section */}
      <div className="text-center space-y-6 p-8 rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80">
        <div className="w-32 h-32 mx-auto rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <span className="text-6xl font-bold text-white">MN</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Mafika William Nkambule
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          IT Executive | Digital Transformation Leader | Enterprise Architecture Specialist
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-white/90">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>071 510 9134</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>nkambumw@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Pretoria East, South Africa</span>
          </div>
        </div>
      </div>

      {/* Executive Profile */}
      <Card className="shadow-strong">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Executive Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg">
          <p>
            Dynamic and visionary IT Executive with over <strong>18 years of experience</strong> in leading IT strategy, 
            governance, and innovation across multinational organizations, including healthcare, education, and telecommunications sectors. 
            Proven expertise in aligning IT with business goals, driving cost-efficient IT transformations, and managing large-scale 
            IT environments with a focus on cybersecurity, resilience, and enterprise architecture.
          </p>
          <p>
            Adept at fostering organizational excellence through strategic leadership, budget management, and stakeholder engagement. 
            Renowned for steering organizations through critical cybersecurity challenges and modernizing IT infrastructure to enable 
            agility and innovation.
          </p>
        </CardContent>
      </Card>

      {/* Current Leadership Roles */}
      <Card className="shadow-medium border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-primary" />
            Current Leadership Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl space-y-3">
              <Building2 className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">Tshwane University of Technology</h3>
              <p className="text-sm text-muted-foreground font-medium">Director & Head of ICT Services</p>
              <p className="text-xs text-muted-foreground">February 2017 - Present</p>
              <ul className="text-sm space-y-1 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Leading ICT strategy and digital transformation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Major cybersecurity overhaul post-ransomware attack</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Enterprise architecture aligned with COBIT & ITIL</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl space-y-3">
              <Zap className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">22 On Sloane</h3>
              <p className="text-sm text-muted-foreground font-medium">Digital Lead</p>
              <p className="text-xs text-muted-foreground">Innovation Hub Partnership</p>
              <ul className="text-sm space-y-1 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Driving digital innovation initiatives</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Strategic technology partnerships</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Ecosystem development and collaboration</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl space-y-3">
              <Target className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-semibold">Kumii Marketplace</h3>
              <p className="text-sm text-muted-foreground font-medium">Digital Lead & Founding Architect</p>
              <p className="text-xs text-muted-foreground">SMME Ecosystem Platform</p>
              <ul className="text-sm space-y-1 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Platform architecture and technical strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Building Africa's all-in-one SMME ecosystem</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Digital transformation for entrepreneurs</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Competencies */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Zap className="h-7 w-7 text-primary" />
            Core Competencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Functional Competencies
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>IT Strategy Development and Implementation</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Cybersecurity and Risk Management</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>IT Governance and Compliance</strong> (COBIT, ITIL, TOGAF)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Enterprise Architecture and Service Delivery</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>IT Financial Management</strong> and Budget Oversight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Business Process Automation</strong> and Optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Strategic Planning and Leadership</strong></span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Leadership Capabilities
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Leading companies effectively and ethically for all stakeholders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Contributing to strategy-setting and implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Interrogating financial statements and concluding on performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Risk management policy formation and implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Compliance policy formation and oversight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Responding to business challenges creatively and constructively</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>People and financial management excellence</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Experience Highlights */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-primary" />
            Professional Experience Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">National Health Laboratory Service</h3>
                <span className="text-sm text-muted-foreground">2016-2017</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Head – Strategy Development, Application Support & System Development</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Directed development and support of all business-critical systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Established IT governance and risk management frameworks</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">University of South Africa (UNISA)</h3>
                <span className="text-sm text-muted-foreground">2012-2016</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Director – Information & Communication Technology</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Led Enterprise Architecture & Strategy development</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Managed all ERP Systems and Business Support Systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Implemented 13 major systems including Oracle, OpenText, and BPM</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">Multi-Links Telkom Nigeria</h3>
                <span className="text-sm text-muted-foreground">2008-2010</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">IT Executive (Acting CIO for 12 months)</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>ICT Strategy, Architecture, and Integration leadership</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Implemented 10 major projects including billing solutions and data centre</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">Telkom South Africa</h3>
                <span className="text-sm text-muted-foreground">2005-2008</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Solutions Architect</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Architecture Impact Assessments and Solution Definitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Successfully deployed E-Billing and Number Management systems</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education & Qualifications */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-primary" />
            Education & Professional Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Academic Qualifications</h3>
              <div className="space-y-3">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="font-semibold text-lg">PhD in Cybersecurity</p>
                  <p className="text-sm text-muted-foreground">2021 - Present</p>
                  <p className="text-sm mt-1">Research: Cybersecurity Framework for Higher Education</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="font-semibold text-lg">Master of Computer Science</p>
                  <p className="text-sm text-muted-foreground">2002 - 2004</p>
                  <p className="text-sm mt-1">Research: Quality of Service Provisioning in Mobile Wireless Networks</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Professional Certifications</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Institute of Directors South Africa</p>
                    <p className="text-sm text-muted-foreground">Being a Director Parts 1-4 (2014)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">COBIT 5 Foundation</p>
                    <p className="text-sm text-muted-foreground">IT Governance Framework (2014)</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-semibold">Framework Expertise</p>
                <p className="text-sm text-muted-foreground mt-1">TOGAF, SOA, ITIL, COBIT, NGOSS</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board Participation */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Board Participation & Leadership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold">Kalafong Provincial Tertiary Hospital</h4>
              <p className="text-sm text-muted-foreground">Board Member & Chairperson of Audit Committee (4th year, 2nd term)</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold">TUT ICT Committee of Council</h4>
              <p className="text-sm text-muted-foreground">ICT Governance Committee Member</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold">Vuselela TVET College</h4>
              <p className="text-sm text-muted-foreground">ICT Governance Committee Board Member</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <h4 className="font-semibold">TENET – Tertiary Education Network</h4>
              <p className="text-sm text-muted-foreground">Board Member</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm">
              <strong>Professional Membership:</strong> Higher Education Information Technology South Africa (HEITSA)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Achievements */}
      <Card className="shadow-strong bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Award className="h-7 w-7 text-primary" />
            Key Achievements & Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">18+</div>
              <div className="text-sm text-muted-foreground">Years IT Leadership</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">25+</div>
              <div className="text-sm text-muted-foreground">Major Systems Implemented</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <div className="text-sm text-muted-foreground">Board Memberships</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

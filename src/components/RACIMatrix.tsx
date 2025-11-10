import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Headphones, Building2, Lightbulb, DollarSign, GraduationCap, Store } from "lucide-react";

export const RACIMatrix = () => {
  const roles = [
    {
      category: "Platform Users",
      icon: Users,
      roles: [
        { name: "Startup/SMME", description: "Business seeking funding, services, and mentorship" },
        { name: "Service Provider", description: "Professional offering business services" },
        { name: "Mentor", description: "Experienced professional providing guidance" },
        { name: "Advisor", description: "Expert providing specialized consultation" },
        { name: "Funder", description: "Investor or institution providing capital" },
        { name: "Marketplace Buyer", description: "User purchasing services/products" },
        { name: "Marketplace Seller", description: "User selling services/products" },
      ]
    },
    {
      category: "Administrators",
      icon: Shield,
      roles: [
        { name: "Platform Admin", description: "Full system access and control" },
        { name: "Mentorship Admin", description: "Manages mentorship programs and matching" },
        { name: "Financial Admin", description: "Oversees financial operations and reporting" },
        { name: "Content Admin", description: "Manages content, resources, and learning materials" },
        { name: "User Admin", description: "Manages user accounts and permissions" },
        { name: "Compliance Admin", description: "Ensures regulatory compliance" },
      ]
    },
    {
      category: "Technical Support",
      icon: Headphones,
      roles: [
        { name: "L1 Support", description: "First-line user assistance, basic troubleshooting" },
        { name: "L2 Support", description: "Advanced technical support, bug investigation" },
        { name: "L3 Support", description: "Platform engineering, system maintenance" },
        { name: "DevOps Engineer", description: "Infrastructure, deployment, monitoring" },
        { name: "Security Engineer", description: "Security policies, incident response" },
      ]
    },
    {
      category: "Module Owners",
      icon: Building2,
      roles: [
        { name: "Marketplace Owner", description: "Oversees marketplace operations" },
        { name: "Mentorship Owner", description: "Manages mentorship program" },
        { name: "Funding Hub Owner", description: "Oversees funding opportunities" },
        { name: "Learning Hub Owner", description: "Manages educational content" },
        { name: "Credit Scoring Owner", description: "Manages credit assessment system" },
        { name: "Financial Modeling Owner", description: "Oversees financial model builder" },
        { name: "Messaging Owner", description: "Manages communication systems" },
      ]
    }
  ];

  const raciMatrix = {
    "User Management": [
      { task: "User Registration", platformAdmin: "A", userAdmin: "R", l1Support: "I", startup: "R" },
      { task: "Profile Verification", platformAdmin: "A", userAdmin: "R", complianceAdmin: "C", allUsers: "I" },
      { task: "Role Assignment", platformAdmin: "A", userAdmin: "R", allUsers: "I" },
      { task: "Access Control", platformAdmin: "A", securityEngineer: "R", userAdmin: "C" },
      { task: "Account Suspension", platformAdmin: "A", userAdmin: "R", complianceAdmin: "C", affectedUser: "I" },
    ],
    "Marketplace Operations": [
      { task: "Listing Creation", marketplaceOwner: "A", seller: "R", contentAdmin: "C" },
      { task: "Listing Approval", marketplaceOwner: "A", contentAdmin: "R", complianceAdmin: "C" },
      { task: "Transaction Processing", marketplaceOwner: "A", financialAdmin: "R", buyer: "I", seller: "I" },
      { task: "Dispute Resolution", marketplaceOwner: "A", l2Support: "R", buyer: "C", seller: "C" },
      { task: "Payment Processing", financialAdmin: "A", marketplaceOwner: "R", devOps: "C" },
    ],
    "Mentorship Program": [
      { task: "Mentor Onboarding", mentorshipAdmin: "A", mentorshipOwner: "R", mentor: "C" },
      { task: "Matching Algorithm", mentorshipOwner: "A", l3Support: "R", mentorshipAdmin: "C" },
      { task: "Session Booking", mentorshipOwner: "A", mentor: "R", mentee: "R", l1Support: "I" },
      { task: "Session Review", mentorshipAdmin: "A", mentorshipOwner: "R", mentor: "I", mentee: "I" },
      { task: "Mentor Performance", mentorshipAdmin: "A", mentorshipOwner: "R", platformAdmin: "I" },
    ],
    "Funding Operations": [
      { task: "Funding Opportunity Creation", fundingOwner: "A", funder: "R", contentAdmin: "C" },
      { task: "Application Review", fundingOwner: "A", funder: "R", complianceAdmin: "C", startup: "I" },
      { task: "Credit Assessment", creditScoringOwner: "A", financialAdmin: "R", startup: "C" },
      { task: "Due Diligence", fundingOwner: "A", funder: "R", complianceAdmin: "C" },
      { task: "Fund Disbursement", financialAdmin: "A", fundingOwner: "R", funder: "I", startup: "I" },
    ],
    "Content & Learning": [
      { task: "Course Creation", learningOwner: "A", contentAdmin: "R", mentor: "C" },
      { task: "Resource Publishing", learningOwner: "A", contentAdmin: "R", complianceAdmin: "C" },
      { task: "Content Moderation", contentAdmin: "A", l2Support: "R", complianceAdmin: "C" },
      { task: "Learning Path Design", learningOwner: "A", contentAdmin: "R", mentorshipOwner: "C" },
    ],
    "Technical Operations": [
      { task: "System Monitoring", devOps: "A/R", l3Support: "C", platformAdmin: "I" },
      { task: "Incident Response", l3Support: "A", devOps: "R", l2Support: "C", platformAdmin: "I" },
      { task: "Security Patches", securityEngineer: "A", devOps: "R", l3Support: "C" },
      { task: "Database Backup", devOps: "A/R", platformAdmin: "I" },
      { task: "Performance Optimization", l3Support: "A", devOps: "R", moduleOwners: "C" },
    ],
    "Compliance & Security": [
      { task: "POPIA Compliance", complianceAdmin: "A/R", platformAdmin: "C", securityEngineer: "C" },
      { task: "Security Audits", securityEngineer: "A/R", complianceAdmin: "C", platformAdmin: "I" },
      { task: "Data Privacy Policy", complianceAdmin: "A", platformAdmin: "R", securityEngineer: "C" },
      { task: "Breach Notification", platformAdmin: "A", securityEngineer: "R", complianceAdmin: "R", allUsers: "I" },
      { task: "Access Audit", securityEngineer: "A/R", complianceAdmin: "C", platformAdmin: "I" },
    ],
    "Financial Management": [
      { task: "Revenue Reporting", financialAdmin: "A/R", platformAdmin: "I", moduleOwners: "C" },
      { task: "Payment Reconciliation", financialAdmin: "A/R", devOps: "C" },
      { task: "Subscription Management", financialAdmin: "A", userAdmin: "R", platformAdmin: "I" },
      { task: "Commission Tracking", financialAdmin: "A/R", marketplaceOwner: "C", fundingOwner: "C" },
      { task: "Financial Audit", platformAdmin: "A", financialAdmin: "R", complianceAdmin: "C" },
    ]
  };

  const getRaciBadge = (value: string) => {
    const badges = value.split('/').map((v) => {
      const colors: { [key: string]: string } = {
        'R': 'bg-blue-500 text-white',
        'A': 'bg-green-500 text-white',
        'C': 'bg-yellow-500 text-white',
        'I': 'bg-gray-400 text-white'
      };
      return (
        <Badge key={v} className={`${colors[v]} mr-1 text-xs`}>
          {v}
        </Badge>
      );
    });
    return badges;
  };

  return (
    <div className="space-y-8">
      {/* RACI Legend */}
      <Card>
        <CardHeader>
          <CardTitle>RACI Matrix Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <Badge className="bg-green-500 text-white">R</Badge>
              <div>
                <p className="font-semibold">Responsible</p>
                <p className="text-sm text-muted-foreground">Does the work to complete the task</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-blue-500 text-white">A</Badge>
              <div>
                <p className="font-semibold">Accountable</p>
                <p className="text-sm text-muted-foreground">Ultimately answerable for completion</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-yellow-500 text-white">C</Badge>
              <div>
                <p className="font-semibold">Consulted</p>
                <p className="text-sm text-muted-foreground">Provides input and expertise</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-gray-400 text-white">I</Badge>
              <div>
                <p className="font-semibold">Informed</p>
                <p className="text-sm text-muted-foreground">Kept up-to-date on progress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Platform Users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {roles.map((category) => (
                <TabsTrigger key={category.category} value={category.category} className="flex items-center gap-2">
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.category}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {roles.map((category) => (
              <TabsContent key={category.category} value={category.category} className="space-y-4 mt-4">
                {category.roles.map((role) => (
                  <div key={role.name} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-lg">{role.name}</h4>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* RACI Matrices by Module */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">RACI Matrices by Process Area</h2>
        
        {Object.entries(raciMatrix).map(([module, tasks]) => (
          <Card key={module}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {module === "Marketplace Operations" && <Store className="w-5 h-5" />}
                {module === "Mentorship Program" && <GraduationCap className="w-5 h-5" />}
                {module === "Funding Operations" && <DollarSign className="w-5 h-5" />}
                {module === "Content & Learning" && <Lightbulb className="w-5 h-5" />}
                {module === "Technical Operations" && <Headphones className="w-5 h-5" />}
                {module === "Compliance & Security" && <Shield className="w-5 h-5" />}
                {module}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Task</TableHead>
                      {Object.keys(tasks[0] || {}).filter(k => k !== 'task').map((role) => (
                        <TableHead key={role} className="min-w-[120px] text-center capitalize">
                          {role.replace(/([A-Z])/g, ' $1').trim()}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{task.task}</TableCell>
                        {Object.entries(task).filter(([k]) => k !== 'task').map(([role, value]) => (
                          <TableCell key={role} className="text-center">
                            {value && getRaciBadge(value as string)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Governance Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Decision-Making Authority</h3>
            <div className="space-y-2">
              <div className="p-3 border-l-4 border-green-500 bg-muted/50">
                <p className="font-medium">Strategic Decisions</p>
                <p className="text-sm text-muted-foreground">Platform Admin → Module Owners → Department Leads</p>
              </div>
              <div className="p-3 border-l-4 border-blue-500 bg-muted/50">
                <p className="font-medium">Operational Decisions</p>
                <p className="text-sm text-muted-foreground">Module Owners → Functional Admins → Team Leads</p>
              </div>
              <div className="p-3 border-l-4 border-yellow-500 bg-muted/50">
                <p className="font-medium">Technical Decisions</p>
                <p className="text-sm text-muted-foreground">L3 Support → DevOps → Security Engineer</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Escalation Path</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge>Level 1</Badge>
                <span className="text-sm">User → L1 Support → User Admin</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>Level 2</Badge>
                <span className="text-sm">L1 Support → L2 Support → Module Owner</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>Level 3</Badge>
                <span className="text-sm">L2 Support → L3 Support → Platform Admin</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="destructive">Critical</Badge>
                <span className="text-sm">Any Level → Security Engineer/DevOps → Platform Admin (Immediate)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

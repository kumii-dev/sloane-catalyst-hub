import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Shield, Globe, Search, Filter, ExternalLink, Clock, CheckCircle } from "lucide-react";

interface ThreatIntelligenceItem {
  id: string;
  type: 'CVE' | 'IoC' | 'Advisory' | 'Actor' | 'TTP';
  identifier: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  relevance: 'high' | 'medium' | 'low';
  indicators: string[];
  threat_actors?: string[];
  affected_systems?: string[];
  mitigations?: string[];
  published: string;
  status: 'active' | 'expired' | 'deprecated';
  source: string;
  source_url: string;
  siem_integrated: boolean;
  applied_to_incidents?: string[];
}

const ThreatIntelligenceDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterRelevance, setFilterRelevance] = useState<string>("all");

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }
      const isAdmin = await hasRole("admin");
      if (!isAdmin) {
        navigate("/");
        return;
      }
      setIsAuthorized(true);
    };
    checkAuth();
  }, [user, hasRole, navigate]);

  // Mock data - replace with actual API calls
  const threatIntel: ThreatIntelligenceItem[] = [
    {
      id: "1",
      type: "CVE",
      identifier: "CVE-2025-12345",
      title: "Critical Authentication Bypass in Supabase Auth",
      description: "A critical vulnerability has been discovered in authentication flow that allows attackers to bypass MFA verification under specific conditions.",
      severity: "critical",
      confidence: 95,
      relevance: "high",
      indicators: ["auth_bypass_pattern", "mfa_skip_attempt"],
      affected_systems: ["Supabase Auth", "OAuth providers"],
      mitigations: [
        "Update to Supabase v2.39.1 or later",
        "Enable strict MFA validation",
        "Review authentication logs for bypass attempts"
      ],
      published: "2025-12-01T10:00:00Z",
      status: "active",
      source: "NVD",
      source_url: "https://nvd.nist.gov/vuln/detail/CVE-2025-12345",
      siem_integrated: true,
      applied_to_incidents: []
    },
    {
      id: "2",
      type: "IoC",
      identifier: "IP:192.0.2.100",
      title: "Known Malicious IP - Brute Force Campaign",
      description: "IP address associated with large-scale credential stuffing attacks targeting SaaS applications globally.",
      severity: "high",
      confidence: 88,
      relevance: "high",
      indicators: ["192.0.2.100", "192.0.2.101-110"],
      threat_actors: ["APT-2025-42"],
      affected_systems: ["Authentication services", "API endpoints"],
      mitigations: [
        "Block IP range 192.0.2.0/24 at firewall",
        "Enable rate limiting on authentication endpoints",
        "Monitor for similar attack patterns"
      ],
      published: "2025-11-30T14:30:00Z",
      status: "active",
      source: "Commercial TI Feed",
      source_url: "https://threatintel.example.com/ioc/192-0-2-100",
      siem_integrated: true,
      applied_to_incidents: ["INC-2025-001"]
    },
    {
      id: "3",
      type: "Advisory",
      identifier: "CERT-2025-0245",
      title: "Increasing OAuth Phishing Attacks in Q4 2025",
      description: "Security advisory regarding sophisticated OAuth consent phishing campaigns targeting business users. Attackers create malicious OAuth applications that mimic legitimate services.",
      severity: "medium",
      confidence: 82,
      relevance: "medium",
      indicators: ["oauth_consent_abuse", "suspicious_app_registration"],
      threat_actors: ["APT-2025-18", "Cybercrime Groups"],
      mitigations: [
        "Review OAuth application permissions regularly",
        "Implement application vetting process",
        "User education on OAuth consent screens",
        "Monitor for unusual OAuth application behavior"
      ],
      published: "2025-11-28T09:00:00Z",
      status: "active",
      source: "CERT",
      source_url: "https://cert.example.org/advisories/2025-0245",
      siem_integrated: false,
      applied_to_incidents: []
    },
    {
      id: "4",
      type: "TTP",
      identifier: "T1078.004",
      title: "Cloud Account Compromise via Token Theft",
      description: "MITRE ATT&CK technique: Adversaries may steal cloud service provider tokens to gain unauthorized access to cloud resources.",
      severity: "high",
      confidence: 90,
      relevance: "high",
      indicators: ["token_theft_pattern", "session_hijacking", "cloud_api_abuse"],
      affected_systems: ["Cloud services", "API tokens", "Session management"],
      mitigations: [
        "Implement token binding and rotation",
        "Enable continuous conditional access",
        "Monitor for token replay attacks",
        "Use hardware-backed key storage where possible"
      ],
      published: "2025-11-25T00:00:00Z",
      status: "active",
      source: "MITRE ATT&CK",
      source_url: "https://attack.mitre.org/techniques/T1078/004/",
      siem_integrated: true,
      applied_to_incidents: []
    },
    {
      id: "5",
      type: "Actor",
      identifier: "APT-2025-42",
      title: "APT Group Targeting SaaS Platforms",
      description: "Advanced persistent threat group with focus on credential harvesting and data exfiltration from cloud-based SaaS platforms. Active since Q3 2025.",
      severity: "high",
      confidence: 75,
      relevance: "medium",
      indicators: ["apt_2025_42_malware", "apt_2025_42_c2_domain"],
      threat_actors: ["APT-2025-42"],
      mitigations: [
        "Enhanced monitoring of authentication events",
        "Deploy endpoint detection and response (EDR)",
        "Network segmentation",
        "Regular security awareness training"
      ],
      published: "2025-11-20T00:00:00Z",
      status: "active",
      source: "Commercial CTI",
      source_url: "https://cti.example.com/actors/apt-2025-42",
      siem_integrated: false,
      applied_to_incidents: []
    }
  ];

  const filteredThreatIntel = threatIntel.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSeverity = filterSeverity === "all" || item.severity === filterSeverity;
    const matchesRelevance = filterRelevance === "all" || item.relevance === filterRelevance;
    return matchesSearch && matchesType && matchesSeverity && matchesRelevance;
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500"
    };
    return colors[severity as keyof typeof colors] || "bg-gray-500";
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      CVE: <AlertTriangle className="h-4 w-4" />,
      IoC: <Shield className="h-4 w-4" />,
      Advisory: <TrendingUp className="h-4 w-4" />,
      Actor: <Globe className="h-4 w-4" />,
      TTP: <Shield className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <AlertTriangle className="h-4 w-4" />;
  };

  const getRelevanceBadge = (relevance: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    };
    return (
      <Badge className={colors[relevance as keyof typeof colors]}>
        {relevance.toUpperCase()} RELEVANCE
      </Badge>
    );
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Threat Intelligence</h1>
            <p className="text-muted-foreground">Real-time threat intelligence feed and analysis</p>
          </div>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Query TI Sources
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{threatIntel.filter(t => t.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Relevance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {threatIntel.filter(t => t.relevance === 'high').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">SIEM Integrated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {threatIntel.filter(t => t.siem_integrated).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Applied to Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {threatIntel.filter(t => t.applied_to_incidents && t.applied_to_incidents.length > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(threatIntel.reduce((sum, t) => sum + t.confidence, 0) / threatIntel.length)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search threat intelligence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CVE">CVE</SelectItem>
                  <SelectItem value="IoC">IoC</SelectItem>
                  <SelectItem value="Advisory">Advisory</SelectItem>
                  <SelectItem value="Actor">Actor</SelectItem>
                  <SelectItem value="TTP">TTP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRelevance} onValueChange={setFilterRelevance}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Relevance</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Threat Intelligence Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Intelligence Feed</CardTitle>
            <CardDescription>{filteredThreatIntel.length} threat items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredThreatIntel.map((item) => (
                <Card key={item.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded ${getSeverityColor(item.severity)}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">{item.identifier}</span>
                          <Badge variant="outline">{item.type}</Badge>
                          {getRelevanceBadge(item.relevance)}
                          {item.siem_integrated && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              SIEM Integrated
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        
                        {item.indicators.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Indicators:</div>
                            <div className="flex flex-wrap gap-1">
                              {item.indicators.map((indicator, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs font-mono">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.mitigations && item.mitigations.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Recommended Mitigations:</div>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {item.mitigations.map((mitigation, idx) => (
                                <li key={idx}>{mitigation}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Published: {new Date(item.published).toLocaleDateString()}</span>
                          <span>Confidence: {item.confidence}%</span>
                          <span>Source: {item.source}</span>
                          {item.applied_to_incidents && item.applied_to_incidents.length > 0 && (
                            <span>Applied to {item.applied_to_incidents.length} incident(s)</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Source
                          </a>
                        </Button>
                        {!item.siem_integrated && (
                          <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4 mr-2" />
                            Integrate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ThreatIntelligenceDashboard;

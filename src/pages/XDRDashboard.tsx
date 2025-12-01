import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Cloud, Shield, Database, Globe, HardDrive, TrendingUp, AlertTriangle, Activity, Link2 } from "lucide-react";

interface DomainHealth {
  domain: string;
  icon: any;
  events_24h: number;
  high_risk_events: number;
  correlation_count: number;
  health_status: 'healthy' | 'warning' | 'critical';
}

interface CorrelatedAttack {
  correlation_id: string;
  attack_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  domains_involved: string[];
  event_count: number;
  started_at: string;
  mitre_tactics: string[];
  mitre_techniques: string[];
  ai_confidence: number;
  status: 'active' | 'investigating' | 'contained';
}

const XDRDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Mock data for domain health
  const domainHealth: DomainHealth[] = [
    {
      domain: "Endpoint",
      icon: Monitor,
      events_24h: 2847,
      high_risk_events: 12,
      correlation_count: 5,
      health_status: 'healthy'
    },
    {
      domain: "Cloud Infrastructure",
      icon: Cloud,
      events_24h: 15234,
      high_risk_events: 23,
      correlation_count: 8,
      health_status: 'warning'
    },
    {
      domain: "Identity & Access",
      icon: Shield,
      events_24h: 8956,
      high_risk_events: 45,
      correlation_count: 15,
      health_status: 'critical'
    },
    {
      domain: "Application",
      icon: Activity,
      events_24h: 45678,
      high_risk_events: 34,
      correlation_count: 12,
      health_status: 'warning'
    },
    {
      domain: "SaaS Services",
      icon: Globe,
      events_24h: 3421,
      high_risk_events: 8,
      correlation_count: 3,
      health_status: 'healthy'
    },
    {
      domain: "Data Security",
      icon: Database,
      events_24h: 12456,
      high_risk_events: 18,
      correlation_count: 7,
      health_status: 'healthy'
    }
  ];

  // Mock data for correlated attacks
  const correlatedAttacks: CorrelatedAttack[] = [
    {
      correlation_id: "ATK-2025-001",
      attack_name: "Multi-Stage Account Takeover",
      severity: "critical",
      domains_involved: ["Identity & Access", "Application", "Data Security"],
      event_count: 7,
      started_at: "2025-12-01T17:20:00Z",
      mitre_tactics: ["TA0006", "TA0010"],
      mitre_techniques: ["T1110.001", "T1078", "T1567"],
      ai_confidence: 0.95,
      status: "investigating"
    },
    {
      correlation_id: "ATK-2025-002",
      attack_name: "Cloud Resource Hijacking",
      severity: "high",
      domains_involved: ["Cloud Infrastructure", "Identity & Access"],
      event_count: 5,
      started_at: "2025-12-01T16:45:00Z",
      mitre_tactics: ["TA0040"],
      mitre_techniques: ["T1496"],
      ai_confidence: 0.87,
      status: "contained"
    },
    {
      correlation_id: "ATK-2025-003",
      attack_name: "Impossible Travel Detection",
      severity: "critical",
      domains_involved: ["Identity & Access", "Endpoint"],
      event_count: 3,
      started_at: "2025-12-01T16:10:00Z",
      mitre_tactics: ["TA0001"],
      mitre_techniques: ["T1078"],
      ai_confidence: 0.98,
      status: "active"
    },
    {
      correlation_id: "ATK-2025-004",
      attack_name: "Data Exfiltration Attempt",
      severity: "high",
      domains_involved: ["Data Security", "Application", "SaaS Services"],
      event_count: 9,
      started_at: "2025-12-01T15:30:00Z",
      mitre_tactics: ["TA0010"],
      mitre_techniques: ["T1567.002"],
      ai_confidence: 0.82,
      status: "investigating"
    }
  ];

  const getHealthColor = (status: string) => {
    const colors = {
      healthy: "bg-green-500",
      warning: "bg-yellow-500",
      critical: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500"
    };
    return colors[severity as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      active: { color: "bg-red-100 text-red-800", label: "ACTIVE" },
      investigating: { color: "bg-yellow-100 text-yellow-800", label: "INVESTIGATING" },
      contained: { color: "bg-green-100 text-green-800", label: "CONTAINED" }
    };
    const { color, label } = variants[status] || variants.active;
    return <Badge className={color}>{label}</Badge>;
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
            <h1 className="text-3xl font-bold">XDR Dashboard</h1>
            <p className="text-muted-foreground">Extended Detection and Response - Cross-Domain Security Monitoring</p>
          </div>
          <Button>
            <Link2 className="h-4 w-4 mr-2" />
            View Correlation Map
          </Button>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">88,592</div>
              <p className="text-xs text-muted-foreground">Across all 6 domains</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Correlated Attacks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">4</div>
              <p className="text-xs text-muted-foreground">Multi-domain threats detected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96.2%</div>
              <p className="text-xs text-muted-foreground">AI-powered correlation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.8m</div>
              <p className="text-xs text-muted-foreground">MTTA (Mean Time to Acknowledge)</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Domain Overview</TabsTrigger>
            <TabsTrigger value="attacks">Correlated Attacks</TabsTrigger>
            <TabsTrigger value="timeline">Attack Timeline</TabsTrigger>
            <TabsTrigger value="mitre">MITRE ATT&CK</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detection Domain Health</CardTitle>
                <CardDescription>Real-time monitoring across 6 security domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {domainHealth.map((domain) => {
                    const IconComponent = domain.icon;
                    return (
                      <Card key={domain.domain} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded ${getHealthColor(domain.health_status)}`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2">{domain.domain}</h3>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Events (24h)</span>
                                  <span className="font-medium">{domain.events_24h.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">High Risk</span>
                                  <span className="font-medium text-red-500">{domain.high_risk_events}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Correlations</span>
                                  <span className="font-medium">{domain.correlation_count}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Cross-Domain Correlation Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Cross-Domain Correlation Statistics</CardTitle>
                <CardDescription>Event correlation patterns across security domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-2">50</div>
                        <div className="text-sm text-muted-foreground">Total Correlations</div>
                        <div className="text-xs text-muted-foreground mt-1">Last 24 hours</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500 mb-2">42</div>
                        <div className="text-sm text-muted-foreground">Benign Patterns</div>
                        <div className="text-xs text-muted-foreground mt-1">84% accuracy</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-500 mb-2">4</div>
                        <div className="text-sm text-muted-foreground">Malicious Attacks</div>
                        <div className="text-xs text-muted-foreground mt-1">Requires action</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attacks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Correlated Attacks</CardTitle>
                <CardDescription>Multi-domain attack chains detected by XDR correlation engine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {correlatedAttacks.map((attack) => (
                    <Card key={attack.correlation_id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded ${getSeverityColor(attack.severity)}`}>
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm text-muted-foreground">{attack.correlation_id}</span>
                              {getStatusBadge(attack.status)}
                              <Badge variant="outline">{attack.event_count} events</Badge>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{attack.attack_name}</h3>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium">Domains Involved:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {attack.domains_involved.map((domain, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {domain}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <span className="text-sm font-medium">MITRE ATT&CK:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {attack.mitre_tactics.map((tactic, idx) => (
                                    <Badge key={idx} className="bg-purple-100 text-purple-800 text-xs">
                                      {tactic}
                                    </Badge>
                                  ))}
                                  {attack.mitre_techniques.map((technique, idx) => (
                                    <Badge key={idx} className="bg-indigo-100 text-indigo-800 text-xs">
                                      {technique}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Started: {new Date(attack.started_at).toLocaleString()}</span>
                                <span>AI Confidence: {Math.round(attack.ai_confidence * 100)}%</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attack Chain Timeline</CardTitle>
                <CardDescription>Temporal visualization of correlated attack events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Example attack chain for ATK-2025-001 */}
                  <div>
                    <h3 className="font-semibold mb-4">ATK-2025-001: Multi-Stage Account Takeover</h3>
                    <div className="relative pl-8 space-y-4">
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border"></div>
                      
                      <div className="relative">
                        <div className="absolute -left-5 w-3 h-3 rounded-full bg-red-500"></div>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">Identity & Access</Badge>
                                <div className="font-medium">Failed login attempts (5x)</div>
                                <div className="text-sm text-muted-foreground">IP: 203.0.113.50</div>
                              </div>
                              <span className="text-xs text-muted-foreground">17:20:00</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-5 w-3 h-3 rounded-full bg-orange-500"></div>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">Identity & Access</Badge>
                                <div className="font-medium">Successful login after password reset</div>
                                <div className="text-sm text-muted-foreground">Same IP address</div>
                              </div>
                              <span className="text-xs text-muted-foreground">17:22:00</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-5 w-3 h-3 rounded-full bg-yellow-500"></div>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">Application</Badge>
                                <div className="font-medium">Profile update - email changed, 2FA disabled</div>
                                <div className="text-sm text-muted-foreground">Attacker gaining persistence</div>
                              </div>
                              <span className="text-xs text-muted-foreground">17:25:00</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-5 w-3 h-3 rounded-full bg-purple-500"></div>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">Data Security</Badge>
                                <div className="font-medium">Bulk data export initiated</div>
                                <div className="text-sm text-muted-foreground text-red-500">🚨 Data exfiltration attempt</div>
                              </div>
                              <span className="text-xs text-muted-foreground">17:28:00</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-5 w-3 h-3 rounded-full bg-green-500"></div>
                        <Card className="border-green-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge className="bg-green-500 mb-2">Automated Response</Badge>
                                <div className="font-medium">Account locked, sessions invalidated</div>
                                <div className="text-sm text-muted-foreground">XDR automated containment</div>
                              </div>
                              <span className="text-xs text-muted-foreground">17:30:00</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitre" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>MITRE ATT&CK Coverage</CardTitle>
                <CardDescription>Detection coverage mapped to MITRE ATT&CK framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold mb-1">TA0006: Credential Access</h4>
                          <p className="text-sm text-muted-foreground">Techniques used to steal credentials</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">COVERED</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>T1110.001 - Password Guessing</span>
                          <Badge variant="outline">2 detections</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>T1110.003 - Password Spraying</span>
                          <Badge variant="outline">1 detection</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold mb-1">TA0010: Exfiltration</h4>
                          <p className="text-sm text-muted-foreground">Techniques to steal data</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">COVERED</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>T1567 - Exfiltration Over Web Service</span>
                          <Badge variant="outline">1 detection</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>T1567.002 - Exfiltration to Cloud Storage</span>
                          <Badge variant="outline">1 detection</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold mb-1">TA0040: Impact</h4>
                          <p className="text-sm text-muted-foreground">Techniques to manipulate, interrupt, or destroy systems</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">COVERED</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>T1496 - Resource Hijacking</span>
                          <Badge variant="outline">1 detection</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default XDRDashboard;

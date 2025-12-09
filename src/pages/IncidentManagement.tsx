import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, CheckCircle, XCircle, Search, Plus, Filter, Eye, Edit, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChatAnalysisTab } from "@/components/admin/ChatAnalysisTab";

interface SecurityIncident {
  id: string;
  incident_number: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  category: string;
  status: 'new' | 'triaged' | 'investigating' | 'contained' | 'remediated' | 'closed';
  stage: string;
  assigned_to?: string;
  detected_at: string;
  triaged_at?: string;
  acknowledged_at?: string;
  contained_at?: string;
  remediated_at?: string;
  closed_at?: string;
  ai_confidence: number;
  ai_risk_score: number;
  affected_assets?: string[];
  affected_users?: string[];
}

const IncidentManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
  const incidents: SecurityIncident[] = [
    {
      id: "1",
      incident_number: "INC-2025-001",
      title: "Brute Force Attack Detected",
      description: "Multiple failed login attempts from IP 192.0.2.100",
      severity: "high",
      priority: "P1",
      category: "authentication_attack",
      status: "investigating",
      stage: "investigation",
      assigned_to: "SOC Analyst",
      detected_at: "2025-12-01T14:23:00Z",
      triaged_at: "2025-12-01T14:25:00Z",
      acknowledged_at: "2025-12-01T14:26:00Z",
      ai_confidence: 0.92,
      ai_risk_score: 78,
      affected_users: ["user1@example.com", "user2@example.com"]
    },
    {
      id: "2",
      incident_number: "INC-2025-002",
      title: "Suspicious Data Access Pattern",
      description: "Unusual volume of database queries from admin account",
      severity: "critical",
      priority: "P0",
      category: "data_breach",
      status: "contained",
      stage: "containment",
      assigned_to: "Incident Response Team",
      detected_at: "2025-12-01T15:10:00Z",
      triaged_at: "2025-12-01T15:11:00Z",
      acknowledged_at: "2025-12-01T15:11:30Z",
      contained_at: "2025-12-01T15:25:00Z",
      ai_confidence: 0.87,
      ai_risk_score: 95,
      affected_assets: ["database-prod-01"],
      affected_users: ["admin@kumii.africa"]
    },
    {
      id: "3",
      incident_number: "INC-2025-003",
      title: "Potential Privilege Escalation",
      description: "User role change detected within 1 hour of failed access attempts",
      severity: "medium",
      priority: "P2",
      category: "privilege_escalation",
      status: "triaged",
      stage: "triage",
      detected_at: "2025-12-01T16:45:00Z",
      triaged_at: "2025-12-01T16:50:00Z",
      ai_confidence: 0.65,
      ai_risk_score: 58,
      affected_users: ["user3@example.com"]
    },
    {
      id: "4",
      incident_number: "INC-2025-004",
      title: "API Rate Limit Exceeded",
      description: "Suspicious API call pattern detected from single source",
      severity: "low",
      priority: "P3",
      category: "dos",
      status: "new",
      stage: "detection",
      detected_at: "2025-12-01T17:20:00Z",
      ai_confidence: 0.45,
      ai_risk_score: 32
    }
  ];

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.incident_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || incident.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
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

  const getStatusIcon = (status: string) => {
    const icons = {
      new: <AlertCircle className="h-4 w-4" />,
      triaged: <Clock className="h-4 w-4" />,
      investigating: <Search className="h-4 w-4" />,
      contained: <CheckCircle className="h-4 w-4" />,
      remediated: <CheckCircle className="h-4 w-4" />,
      closed: <CheckCircle className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="h-4 w-4" />;
  };

  const calculateMTTA = (incident: SecurityIncident) => {
    if (!incident.acknowledged_at) return "N/A";
    const detected = new Date(incident.detected_at).getTime();
    const acknowledged = new Date(incident.acknowledged_at).getTime();
    const minutes = Math.round((acknowledged - detected) / 60000);
    return `${minutes}m`;
  };

  const calculateMTTR = (incident: SecurityIncident) => {
    if (!incident.remediated_at) return "N/A";
    const detected = new Date(incident.detected_at).getTime();
    const remediated = new Date(incident.remediated_at).getTime();
    const minutes = Math.round((remediated - detected) / 60000);
    return `${minutes}m`;
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
            <h1 className="text-3xl font-bold">Incident Management</h1>
            <p className="text-muted-foreground">Security incident lifecycle management and case tracking</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Security Incident</DialogTitle>
                <DialogDescription>Manually create a security incident case</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Brief description of the incident" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Detailed description of the security incident" rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phishing">Phishing</SelectItem>
                        <SelectItem value="malware">Malware</SelectItem>
                        <SelectItem value="data_breach">Data Breach</SelectItem>
                        <SelectItem value="dos">Denial of Service</SelectItem>
                        <SelectItem value="privilege_escalation">Privilege Escalation</SelectItem>
                        <SelectItem value="authentication_attack">Authentication Attack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={() => {
                    // TODO: Implement incident creation
                    setShowCreateDialog(false);
                  }}>Create Incident</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents.filter(i => i.status !== 'closed').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical/High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {incidents.filter(i => ['P0', 'P1'].includes(i.priority) && i.status !== 'closed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg MTTA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2m</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg MTTR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15.7m</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Incidents and Chat Analysis */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="queue">
              <AlertCircle className="h-4 w-4 mr-2" />
              Incident Queue
            </TabsTrigger>
            <TabsTrigger value="chat-analysis">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Analysis
            </TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="queue" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search incidents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="triaged">Triaged</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="contained">Contained</SelectItem>
                      <SelectItem value="remediated">Remediated</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Incident List */}
            <Card>
          <CardHeader>
            <CardTitle>Incident Queue</CardTitle>
            <CardDescription>{filteredIncidents.length} incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIncidents.map((incident) => (
                <Card key={incident.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded ${getSeverityColor(incident.severity)}`}>
                          {getStatusIcon(incident.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-muted-foreground">{incident.incident_number}</span>
                            <Badge variant="outline">{incident.priority}</Badge>
                            <Badge variant="secondary">{incident.category.replace('_', ' ')}</Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{incident.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Detected: {new Date(incident.detected_at).toLocaleString()}</span>
                            {incident.assigned_to && <span>Assigned: {incident.assigned_to}</span>}
                            <span>MTTA: {calculateMTTA(incident)}</span>
                            {incident.remediated_at && <span>MTTR: {calculateMTTR(incident)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="text-sm font-medium">AI Confidence</div>
                          <div className="text-2xl font-bold">{Math.round(incident.ai_confidence * 100)}%</div>
                          <div className="text-sm text-muted-foreground">Risk: {incident.ai_risk_score}</div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Chat Analysis Tab */}
          <TabsContent value="chat-analysis">
            <ChatAnalysisTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IncidentManagement;

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
import { Search, Play, FileText, Download, TrendingUp, Activity, Database, Network, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  id: string;
  event_timestamp: string;
  event_type: string;
  sub_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  user_email?: string;
  source_ip?: string;
  action: string;
  outcome: string;
  details: any;
  ai_risk_score?: number;
  correlation_id?: string;
}

interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  query: string;
}

const SIEMDashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [timeRange, setTimeRange] = useState("24h");
  const [eventType, setEventType] = useState("all");
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [searchResults, setSearchResults] = useState<SecurityEvent[]>([]);
  const [chatSecurityEvents, setChatSecurityEvents] = useState<any[]>([]);

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
      loadChatSecurityEvents();
    };
    checkAuth();
  }, [user, hasRole, navigate]);

  const loadChatSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_session_activity')
        .select(`
          *,
          chat_sessions (
            session_number,
            user_email,
            ai_risk_score,
            security_flag_reason
          )
        `)
        .in('activity_type', ['security_flagged', 'analyzed', 'incident_created'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Transform to security events format
      const transformedEvents = (data || []).map(activity => ({
        id: activity.id,
        event_timestamp: activity.created_at,
        event_type: 'chat_security',
        sub_type: activity.activity_type,
        severity: 
          activity.activity_type === 'incident_created' ? 'critical' as const :
          activity.activity_type === 'security_flagged' ? 'high' as const :
          'medium' as const,
        user_email: activity.chat_sessions?.user_email,
        action: `Chat ${activity.activity_type}`,
        outcome: 'logged',
        details: {
          session_number: activity.chat_sessions?.session_number,
          description: activity.description,
          flag_reason: activity.chat_sessions?.security_flag_reason
        },
        ai_risk_score: activity.chat_sessions?.ai_risk_score,
        source_ip: null
      }));

      setChatSecurityEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading chat security events:', error);
    }
  };

  // Combine mock events with real chat security events
  const allEvents = [
    ...chatSecurityEvents,
    {
      id: "1",
      event_timestamp: "2025-12-01T17:45:23Z",
      event_type: "authentication",
      sub_type: "login_attempt",
      severity: "medium" as const,
      user_email: "user@example.com",
      source_ip: "192.0.2.100",
      action: "login",
      outcome: "failure",
      details: { failure_reason: "invalid_password", provider: "email" },
      ai_risk_score: 45
    },
    {
      id: "2",
      event_timestamp: "2025-12-01T17:44:12Z",
      event_type: "api_access",
      sub_type: "endpoint_call",
      severity: "low",
      user_email: "admin@kumii.africa",
      source_ip: "10.0.1.50",
      action: "POST /functions/v1/copilot-chat",
      outcome: "success",
      details: { status_code: 200, response_time_ms: 245 },
      ai_risk_score: 12
    },
    {
      id: "3",
      event_timestamp: "2025-12-01T17:43:05Z",
      event_type: "database_access",
      sub_type: "query",
      severity: "informational",
      user_email: "system",
      source_ip: "internal",
      action: "SELECT",
      outcome: "success",
      details: { table: "user_roles", affected_rows: 1 },
      ai_risk_score: 5
    },
    {
      id: "4",
      event_timestamp: "2025-12-01T17:42:30Z",
      event_type: "authentication",
      sub_type: "login_attempt",
      severity: "high",
      user_email: "admin@kumii.africa",
      source_ip: "203.0.113.50",
      action: "login",
      outcome: "success",
      details: { provider: "google", new_location: true },
      ai_risk_score: 68,
      correlation_id: "corr-001"
    },
    {
      id: "5",
      event_timestamp: "2025-12-01T17:40:15Z",
      event_type: "api_access",
      sub_type: "rate_limit",
      severity: "medium",
      user_email: "user2@example.com",
      source_ip: "198.51.100.25",
      action: "GET /api/data",
      outcome: "blocked",
      details: { rate_limit_hit: true, requests_per_minute: 120 },
      ai_risk_score: 55
    }
  ].sort((a, b) => new Date(b.event_timestamp).getTime() - new Date(a.event_timestamp).getTime());

  const mockEvents = allEvents;

  const queryTemplates: QueryTemplate[] = [
    {
      id: "1",
      name: "Failed Logins in Last Hour",
      description: "Find all failed authentication attempts in the last 60 minutes",
      category: "Authentication",
      query: `SELECT * FROM security_events
WHERE event_type = 'authentication'
  AND outcome = 'failure'
  AND event_timestamp > now() - interval '1 hour'
ORDER BY event_timestamp DESC;`
    },
    {
      id: "2",
      name: "High-Risk Events",
      description: "Find events with AI risk score above 70",
      category: "Risk Analysis",
      query: `SELECT * FROM security_events
WHERE ai_risk_score > 70
  AND event_timestamp > now() - interval '24 hours'
ORDER BY ai_risk_score DESC, event_timestamp DESC;`
    },
    {
      id: "3",
      name: "Suspicious API Activity",
      description: "Detect unusual API call patterns",
      category: "API Security",
      query: `SELECT source_ip, user_email, COUNT(*) as call_count
FROM security_events
WHERE event_type = 'api_access'
  AND event_timestamp > now() - interval '1 hour'
GROUP BY source_ip, user_email
HAVING COUNT(*) > 50
ORDER BY call_count DESC;`
    },
    {
      id: "4",
      name: "Admin Activity Audit",
      description: "Track all actions by admin users",
      category: "Access Control",
      query: `SELECT e.* FROM security_events e
JOIN user_roles r ON e.user_id = r.user_id
WHERE r.role = 'admin'
  AND e.event_timestamp > now() - interval '24 hours'
ORDER BY e.event_timestamp DESC;`
    },
    {
      id: "5",
      name: "Correlated Security Events",
      description: "Find related events in attack chain",
      category: "Correlation",
      query: `SELECT * FROM security_events
WHERE correlation_id IS NOT NULL
  AND event_timestamp > now() - interval '24 hours'
ORDER BY correlation_id, event_timestamp;`
    }
  ];

  const handleNaturalLanguageSearch = () => {
    // TODO: Implement AI-powered natural language query translation
    console.log("Natural language query:", naturalLanguageQuery);
    // Mock: Simulate AI translating query to SQL
    setSearchResults(mockEvents);
  };

  const handleRunQuery = (query: string) => {
    // TODO: Implement actual query execution
    console.log("Executing query:", query);
    setSearchQuery(query);
    setSearchResults(mockEvents);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500",
      informational: "bg-gray-500"
    };
    return colors[severity as keyof typeof colors] || "bg-gray-500";
  };

  const getEventIcon = (eventType: string) => {
    if (eventType === 'chat_security') {
      return <MessageCircle className="w-4 h-4" />;
    } else if (eventType === 'database_access') {
      return <Database className="w-4 h-4" />;
    } else if (eventType === 'api_access') {
      return <Network className="w-4 h-4" />;
    } else {
      return <Activity className="w-4 w-4" />;
    }
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
            <h1 className="text-3xl font-bold">SIEM Dashboard</h1>
            <p className="text-muted-foreground">Security Information and Event Management platform</p>
          </div>
          <Dialog open={showQueryBuilder} onOpenChange={setShowQueryBuilder}>
            <DialogTrigger asChild>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Advanced Query Builder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Advanced Query Builder</DialogTitle>
                <DialogDescription>Build custom SQL queries for security event analysis</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Query Templates</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {queryTemplates.map((template) => (
                      <Card key={template.id} className="hover:bg-accent/50 cursor-pointer transition-colors"
                            onClick={() => handleRunQuery(template.query)}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">{template.category}</Badge>
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Custom SQL Query</Label>
                  <Textarea 
                    placeholder="SELECT * FROM security_events WHERE..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowQueryBuilder(false)}>Cancel</Button>
                  <Button onClick={() => {
                    // TODO: Execute custom query
                    setShowQueryBuilder(false);
                  }}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Query
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Events/Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,234</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                High-Risk Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">127</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Ingested (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 GB</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="h-4 w-4" />
                Correlations Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="search">Event Search</TabsTrigger>
            <TabsTrigger value="queries">Saved Queries</TabsTrigger>
            <TabsTrigger value="correlation">Correlation Rules</TabsTrigger>
            <TabsTrigger value="analytics">Behavioral Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* Natural Language Search */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Natural Language Search</CardTitle>
                <CardDescription>Ask questions in plain English - AI will translate to SQL queries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 'Show me all failed logins from external IPs in the last 24 hours'"
                    value={naturalLanguageQuery}
                    onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
                  />
                  <Button onClick={handleNaturalLanguageSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Examples: "Find brute force attempts", "Show admin activity today", "High-risk events last hour"
                </div>
              </CardContent>
            </Card>

            {/* Filter Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Time Range</Label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Event Type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="authentication">Authentication</SelectItem>
                        <SelectItem value="api_access">API Access</SelectItem>
                        <SelectItem value="database_access">Database Access</SelectItem>
                        <SelectItem value="ai_operation">AI Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>SQL Query</Label>
                    <Input placeholder="SELECT * FROM security_events..." className="font-mono text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>{mockEvents.length} events found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className={`hover:bg-accent/50 transition-colors cursor-pointer ${
                        event.event_type === 'chat_security' ? 'border-l-4 border-l-orange-500' : ''
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-2 h-full ${getSeverityColor(event.severity)} rounded`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {getEventIcon(event.event_type)}
                                <Badge variant="outline">{event.event_type}</Badge>
                              </div>
                              <Badge variant="secondary">{event.sub_type}</Badge>
                              {event.ai_risk_score && event.ai_risk_score > 50 && (
                                <Badge className="bg-red-100 text-red-800">
                                  Risk: {event.ai_risk_score}
                                </Badge>
                              )}
                              {event.correlation_id && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  Correlated: {event.correlation_id}
                                </Badge>
                              )}
                            </div>
                            <div className="font-mono text-sm mb-2">
                              <span className="font-semibold">{event.action}</span>
                              <span className={`ml-2 ${event.outcome === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                → {event.outcome}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Time: {new Date(event.event_timestamp).toLocaleString()}</div>
                              {event.user_email && <div>User: {event.user_email}</div>}
                              {event.source_ip && <div>Source IP: {event.source_ip}</div>}
                              {event.details && (
                                <div>Details: {JSON.stringify(event.details)}</div>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queries">
            <Card>
              <CardHeader>
                <CardTitle>Saved Query Templates</CardTitle>
                <CardDescription>Pre-built queries for common security investigations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queryTemplates.map((template) => (
                    <Card key={template.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                            <div className="bg-muted p-2 rounded font-mono text-xs overflow-x-auto">
                              {template.query}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => handleRunQuery(template.query)}>
                              <Play className="h-4 w-4 mr-2" />
                              Run
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
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

          <TabsContent value="correlation">
            <Card>
              <CardHeader>
                <CardTitle>Active Correlation Rules</CardTitle>
                <CardDescription>Automated detection rules for multi-event attack patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="mb-2 bg-green-100 text-green-800">ACTIVE</Badge>
                          <h4 className="font-semibold">Brute Force Detection</h4>
                          <p className="text-sm text-muted-foreground">
                            Triggers when 5+ failed logins from same IP within 5 minutes
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Triggered</div>
                          <div className="text-2xl font-bold">12</div>
                          <div className="text-sm text-muted-foreground">times today</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="mb-2 bg-green-100 text-green-800">ACTIVE</Badge>
                          <h4 className="font-semibold">Privilege Escalation Pattern</h4>
                          <p className="text-sm text-muted-foreground">
                            Detects role changes within 1 hour of failed access attempts
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Triggered</div>
                          <div className="text-2xl font-bold">3</div>
                          <div className="text-sm text-muted-foreground">times today</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>User and Entity Behavior Analytics (UEBA)</CardTitle>
                <CardDescription>AI-powered anomaly detection and behavioral baselines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>UEBA analytics dashboard coming soon...</p>
                  <p className="text-sm mt-2">Will include behavioral baselines, anomaly detection, and risk scoring</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SIEMDashboard;

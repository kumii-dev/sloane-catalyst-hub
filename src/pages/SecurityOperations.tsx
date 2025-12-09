import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, AlertTriangle, Activity, TrendingUp, Clock, 
  CheckCircle2, XCircle, AlertCircle, Eye, Bot, 
  Zap, FileText, BarChart3, Settings, MessageCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SecurityOperations = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeAlerts, setActiveAlerts] = useState(12);
  const [mtta, setMtta] = useState("4.2");
  const [mttr, setMttr] = useState("18.5");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [flaggedChats, setFlaggedChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        toast.error("Please login to access Security Operations");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const isAdmin = await hasRole("admin");
      if (!isAdmin) {
        toast.error("Access denied. Admin role required.");
        navigate("/");
        return;
      }
      
      setIsAuthorized(true);
      loadFlaggedChats();
      subscribeToFlaggedChats();
    };

    checkAuth();
  }, [user, hasRole, navigate]);

  const loadFlaggedChats = async () => {
    try {
      const { data, error } = await supabase
        .from('security_flagged_chat_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFlaggedChats(data || []);
    } catch (error) {
      console.error('Error loading flagged chats:', error);
    }
  };

  const subscribeToFlaggedChats = () => {
    const channel = supabase
      .channel('flagged_chats_monitor')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_sessions',
        filter: 'security_flagged=eq.true'
      }, (payload) => {
        toast.error('🚨 New security-flagged chat session detected!');
        loadFlaggedChats();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleViewChatDetails = async (chat: any) => {
    setSelectedChat(chat);
    setChatDialogOpen(true);
    
    // Load messages for this session
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chat.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast.error('Failed to load chat messages');
    }
  };

  if (!isAuthorized) {
    return null; // or a loading spinner
  }

  // Mock data for demonstration
  const incidents = [
    {
      id: "INC-2025-001",
      title: "Suspicious Login Attempt - Multiple Failures",
      severity: "high",
      status: "investigating",
      aiConfidence: 0.89,
      timestamp: "2025-12-01 14:23:15",
      source: "Authentication Monitor",
      affectedUser: "user@example.com"
    },
    {
      id: "INC-2025-002",
      title: "Unusual API Access Pattern Detected",
      severity: "medium",
      status: "triaged",
      aiConfidence: 0.76,
      timestamp: "2025-12-01 13:45:22",
      source: "API Gateway Monitor",
      affectedUser: "api-user@example.com"
    },
    {
      id: "INC-2025-003",
      title: "Privilege Escalation Attempt",
      severity: "critical",
      status: "contained",
      aiConfidence: 0.95,
      timestamp: "2025-12-01 12:10:08",
      source: "RBAC Monitor",
      affectedUser: "admin@example.com"
    }
  ];

  const aiAgents = [
    {
      name: "Detection Agent",
      status: "active",
      tasksCompleted: 1247,
      accuracy: 94.2,
      lastAction: "Analyzed 45 authentication events"
    },
    {
      name: "Triage Agent",
      status: "active",
      tasksCompleted: 892,
      accuracy: 91.8,
      lastAction: "Prioritized 12 new alerts"
    },
    {
      name: "Investigation Agent",
      status: "active",
      tasksCompleted: 453,
      accuracy: 96.5,
      lastAction: "Completed root cause analysis for INC-2025-001"
    },
    {
      name: "Response Agent",
      status: "idle",
      tasksCompleted: 234,
      accuracy: 98.1,
      lastAction: "Executed containment playbook"
    }
  ];

  const threatIntelligence = [
    {
      type: "CVE",
      identifier: "CVE-2025-12345",
      severity: "high",
      description: "Remote Code Execution in Supabase Edge Functions",
      relevance: "high",
      published: "2025-12-01"
    },
    {
      type: "IoC",
      identifier: "IP: 192.0.2.100",
      severity: "medium",
      description: "Known malicious IP attempting authentication",
      relevance: "high",
      published: "2025-11-30"
    },
    {
      type: "Advisory",
      identifier: "ADV-2025-789",
      severity: "medium",
      description: "Phishing campaign targeting SaaS platforms",
      relevance: "medium",
      published: "2025-11-29"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "investigating": return <AlertCircle className="h-4 w-4" />;
      case "triaged": return <Eye className="h-4 w-4" />;
      case "contained": return <CheckCircle2 className="h-4 w-4" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              Security Operations Center
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-Powered Security Monitoring & Incident Response - ISO/IEC 27001:2022 Aligned
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/system-documentation")}>
            <FileText className="h-4 w-4 mr-2" />
            Documentation
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{activeAlerts}</div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                3 critical, 5 high, 4 medium
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mean Time to Acknowledge (MTTA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{mtta}m</div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-green-600 mt-2">
                ↓ 15% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mean Time to Remediate (MTTR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{mttr}m</div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-green-600 mt-2">
                ↓ 22% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Detection Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">94.3%</div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-green-600 mt-2">
                ↑ 3.2% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="incidents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="ai-agents">AI Agents</TabsTrigger>
            <TabsTrigger value="threat-intel">Threat Intelligence</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Incident Queue</CardTitle>
                <CardDescription>
                  Real-time security incidents detected and triaged by AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {incidents.map((incident) => (
                      <Card key={incident.id} className="border-l-4" style={{
                        borderLeftColor: 
                          incident.severity === "critical" ? "#ef4444" :
                          incident.severity === "high" ? "#f97316" :
                          incident.severity === "medium" ? "#eab308" : "#3b82f6"
                      }}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{incident.id}</Badge>
                                <Badge className={getSeverityColor(incident.severity)}>
                                  {incident.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  {getStatusIcon(incident.status)}
                                  {incident.status}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-lg">{incident.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Source: {incident.source} • {incident.timestamp}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Affected User: {incident.affectedUser}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">
                                  AI Confidence: {(incident.aiConfidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Button size="sm">
                                Investigate
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="ai-agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Agent Status Dashboard</CardTitle>
                <CardDescription>
                  Monitor AI agent performance and activity in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiAgents.map((agent) => (
                    <Card key={agent.name}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Bot className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-semibold">{agent.name}</h3>
                              <Badge 
                                variant={agent.status === "active" ? "default" : "secondary"}
                                className="mt-1"
                              >
                                {agent.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tasks Completed</span>
                            <span className="font-medium">{agent.tasksCompleted.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className="font-medium">{agent.accuracy}%</span>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">Last Action:</p>
                            <p className="text-sm mt-1">{agent.lastAction}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Flagged Chat Sessions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Security-Flagged Chat Sessions
                    </CardTitle>
                    <CardDescription>
                      Live chat sessions flagged for security review
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {flaggedChats.length} Flagged
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {flaggedChats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No security-flagged chat sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {flaggedChats.map((chat) => (
                      <Card key={chat.id} className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {chat.session_number}
                                </Badge>
                                {chat.ai_risk_score && (
                                  <Badge 
                                    variant={
                                      chat.ai_risk_score > 75 ? "destructive" : 
                                      chat.ai_risk_score > 50 ? "default" : 
                                      "secondary"
                                    }
                                  >
                                    Risk: {chat.ai_risk_score}/100
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {chat.message_count} messages
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  User: {chat.user_name || chat.user_email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                                  {chat.security_flag_reason}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Flagged: {new Date(chat.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewChatDetails(chat)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Threat Intelligence Tab */}
          <TabsContent value="threat-intel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Threat Intelligence Feed</CardTitle>
                <CardDescription>
                  Latest security threats, vulnerabilities, and indicators of compromise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {threatIntelligence.map((threat, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{threat.type}</Badge>
                                <Badge className={getSeverityColor(threat.severity)}>
                                  {threat.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="secondary">
                                  Relevance: {threat.relevance}
                                </Badge>
                              </div>
                              <h3 className="font-semibold">{threat.identifier}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {threat.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Published: {threat.published}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Incident Trends (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Chart visualization coming soon
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Total Incidents: 247 | Avg Response Time: 15.2m
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attack Vector Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Authentication Attacks</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{width: "42%"}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>API Abuse</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{width: "28%"}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Privilege Escalation</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{width: "18%"}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Data Exfiltration Attempts</span>
                        <span className="font-medium">12%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{width: "12%"}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ISO/IEC 27001:2022 Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { control: "A.5.7 Threat Intelligence", status: "compliant" },
                      { control: "A.5.36 Event Logging", status: "compliant" },
                      { control: "A.8.16 Monitoring Activities", status: "compliant" },
                      { control: "A.5.37 Learning from Incidents", status: "review" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{item.control}</span>
                        <Badge variant={item.status === "compliant" ? "default" : "secondary"}>
                          {item.status === "compliant" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Accuracy</span>
                        <span className="font-medium">94.3%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{width: "94.3%"}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>False Positive Rate</span>
                        <span className="font-medium">5.7%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{width: "5.7%"}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Automation Rate</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{width: "78%"}} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chat Details Dialog */}
        <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chat Session Details</DialogTitle>
              <DialogDescription>
                {selectedChat?.session_number} - Security Flagged Session
              </DialogDescription>
            </DialogHeader>
            
            {selectedChat && (
              <div className="space-y-4 mt-4">
                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground">User</div>
                    <div className="font-medium">{selectedChat.user_email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                    <Badge variant={selectedChat.ai_risk_score > 75 ? "destructive" : "default"}>
                      {selectedChat.ai_risk_score}/100
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Security Concern</div>
                    <div className="text-sm">{selectedChat.security_flag_reason}</div>
                  </div>
                  {selectedChat.ai_detected_issues && selectedChat.ai_detected_issues.length > 0 && (
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Detected Issues</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedChat.ai_detected_issues.map((issue: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {issue.issue || issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-semibold mb-3">Chat Messages ({chatMessages.length})</h4>
                  <ScrollArea className="h-[300px] border rounded-lg p-4">
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.sender_type === 'customer'
                              ? 'bg-primary/10 ml-8'
                              : 'bg-muted mr-8'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {message.sender_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setChatDialogOpen(false);
                      navigate('/incident-management');
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Create Incident
                  </Button>
                  <Button variant="outline" onClick={() => setChatDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SecurityOperations;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Brain, Activity, TrendingUp, AlertTriangle, CheckCircle2, Clock, Zap, Target, Shield, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Types
interface AIAgent {
  id: string;
  name: string;
  type: 'triage' | 'analysis' | 'remediation' | 'hunt' | 'report';
  status: 'active' | 'idle' | 'error';
  automation_rate: number;
  accuracy: number;
  tasks_completed: number;
  avg_execution_time: number;
  last_activity: string;
}

interface PlaybookExecution {
  id: string;
  playbook_id: string;
  playbook_name: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  completed_at?: string;
  agent: string;
  confidence: number;
  decision?: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

// Mock data - Replace with actual API calls
const mockAgents: AIAgent[] = [
  {
    id: '1',
    name: 'Triage Agent',
    type: 'triage',
    status: 'active',
    automation_rate: 78.5,
    accuracy: 94.2,
    tasks_completed: 847,
    avg_execution_time: 8.5,
    last_activity: '2 minutes ago',
  },
  {
    id: '2',
    name: 'Analysis Agent',
    type: 'analysis',
    status: 'active',
    automation_rate: 65.3,
    accuracy: 91.3,
    tasks_completed: 423,
    avg_execution_time: 45.2,
    last_activity: '5 minutes ago',
  },
  {
    id: '3',
    name: 'Remediation Agent',
    type: 'remediation',
    status: 'idle',
    automation_rate: 68.3,
    accuracy: 89.7,
    tasks_completed: 234,
    avg_execution_time: 12.8,
    last_activity: '15 minutes ago',
  },
  {
    id: '4',
    name: 'Hunt Agent',
    type: 'hunt',
    status: 'active',
    automation_rate: 45.2,
    accuracy: 87.4,
    tasks_completed: 156,
    avg_execution_time: 168.5,
    last_activity: '1 minute ago',
  },
  {
    id: '5',
    name: 'Report Agent',
    type: 'report',
    status: 'active',
    automation_rate: 73.4,
    accuracy: 96.1,
    tasks_completed: 612,
    avg_execution_time: 5.2,
    last_activity: '3 minutes ago',
  },
];

const mockPlaybookExecutions: PlaybookExecution[] = [
  {
    id: '1',
    playbook_id: 'PB-001',
    playbook_name: 'Real-Time Incident Triage',
    status: 'running',
    progress: 65,
    started_at: '2025-12-01T12:45:00Z',
    agent: 'Triage Agent',
    confidence: 92.5,
  },
  {
    id: '2',
    playbook_id: 'PB-006',
    playbook_name: 'Phishing Response',
    status: 'completed',
    progress: 100,
    started_at: '2025-12-01T12:30:00Z',
    completed_at: '2025-12-01T12:42:00Z',
    agent: 'Triage Agent',
    confidence: 94.8,
    decision: 'Malicious - Quarantined',
  },
  {
    id: '3',
    playbook_id: 'PB-003',
    playbook_name: 'Automated Threat Hunting',
    status: 'running',
    progress: 35,
    started_at: '2025-12-01T10:15:00Z',
    agent: 'Hunt Agent',
    confidence: 87.2,
  },
];

export function AIAgentMonitoringDashboard() {
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents);
  const [executions, setExecutions] = useState<PlaybookExecution[]>(mockPlaybookExecutions);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate metrics
  const metrics: MetricCard[] = [
    {
      title: 'Overall Automation',
      value: '68.7%',
      change: 5.2,
      trend: 'up',
      icon: Zap,
      color: 'text-blue-500',
    },
    {
      title: 'AI Accuracy',
      value: '91.3%',
      change: 2.1,
      trend: 'up',
      icon: Target,
      color: 'text-green-500',
    },
    {
      title: 'Active Playbooks',
      value: 2,
      change: 0,
      trend: 'stable',
      icon: Activity,
      color: 'text-purple-500',
    },
    {
      title: 'Incidents Triaged',
      value: 847,
      change: 12.3,
      trend: 'up',
      icon: Shield,
      color: 'text-orange-500',
    },
  ];

  // Fetch real-time data
  useEffect(() => {
    // TODO: Replace with actual API calls to fetch agent status and playbook executions
    // This would connect to your Supabase database and Edge Functions
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Example: Fetch from Supabase
        // const { data: agentData } = await supabase.from('ai_agents').select('*');
        // const { data: executionData } = await supabase.from('playbook_executions').select('*');
        // setAgents(agentData || []);
        // setExecutions(executionData || []);
      } catch (error) {
        console.error('Error fetching AI agent data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('ai-agent-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auth_events',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Update state based on real-time events
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'error':
      case 'failed':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      idle: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      error: 'bg-red-500/10 text-red-500 border-red-500/20',
      running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            AI Agent Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time visibility into AI-powered security operations
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            All Systems Operational
          </div>
        </Badge>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {metric.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                )}
                {metric.trend === 'down' && (
                  <TrendingUp className="h-3 w-3 text-red-500 mr-1 rotate-180" />
                )}
                <span className={metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : ''}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="ml-1">from last hour</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="playbooks">Active Playbooks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        {/* AI Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Card 
                key={agent.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedAgent(agent)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(agent.status)}`} />
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <Badge className={getStatusBadge(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription>Last active: {agent.last_activity}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Automation Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Automation Rate</span>
                      <span className="font-semibold">{agent.automation_rate}%</span>
                    </div>
                    <Progress value={agent.automation_rate} className="h-2" />
                  </div>

                  {/* Accuracy */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-semibold">{agent.accuracy}%</span>
                    </div>
                    <Progress value={agent.accuracy} className="h-2" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tasks Completed</p>
                      <p className="text-xl font-bold">{agent.tasks_completed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Avg. Time</p>
                      <p className="text-xl font-bold">{agent.avg_execution_time}min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Agent Details Modal */}
          {selectedAgent && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {selectedAgent.name} - Detailed Metrics
                  </CardTitle>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Tasks Today</p>
                    <p className="text-3xl font-bold">{selectedAgent.tasks_completed}</p>
                    <p className="text-xs text-green-500">+12% from yesterday</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-3xl font-bold">{selectedAgent.accuracy}%</p>
                    <p className="text-xs text-green-500">+2.1% from last week</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-3xl font-bold">{selectedAgent.avg_execution_time}m</p>
                    <p className="text-xs text-green-500">-1.2m faster</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Playbooks Tab */}
        <TabsContent value="playbooks" className="space-y-4">
          {executions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-semibold">No active playbooks</p>
                <p className="text-sm text-muted-foreground">All playbooks have completed successfully</p>
              </CardContent>
            </Card>
          ) : (
            executions.map((execution) => (
              <Card key={execution.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {execution.playbook_id}: {execution.playbook_name}
                        <Badge className={getStatusBadge(execution.status)}>
                          {execution.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Executed by {execution.agent} • Started {new Date(execution.started_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-2xl font-bold">{execution.confidence}%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  {execution.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{execution.progress}%</span>
                      </div>
                      <Progress value={execution.progress} className="h-2" />
                    </div>
                  )}

                  {/* Decision */}
                  {execution.decision && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Decision</AlertTitle>
                      <AlertDescription>{execution.decision}</AlertDescription>
                    </Alert>
                  )}

                  {/* Timeline */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Duration: {execution.completed_at 
                          ? `${Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 60000)}m`
                          : 'In progress'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                AI agent performance over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* SOC Health Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">SOC Health Score</p>
                    <p className="text-2xl font-bold">94/100</p>
                  </div>
                  <Progress value={94} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    Excellent - All KPIs exceeded targets
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1 p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground">MTTD</p>
                    <p className="text-2xl font-bold">4.2 min</p>
                    <p className="text-xs text-green-500">Target: &lt;5 min ✓</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground">MTTA</p>
                    <p className="text-2xl font-bold">8.5 min</p>
                    <p className="text-xs text-green-500">Target: &lt;10 min ✓</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground">MTTR</p>
                    <p className="text-2xl font-bold">18.3 min</p>
                    <p className="text-xs text-green-500">Target: &lt;20 min ✓</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground">False Positives</p>
                    <p className="text-2xl font-bold">4.8%</p>
                    <p className="text-xs text-green-500">Target: &lt;5% ✓</p>
                  </div>
                </div>

                {/* Business Impact */}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h4 className="font-semibold text-green-500 mb-3">Business Impact</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Incidents Prevented</p>
                      <p className="text-xl font-bold">127/month</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time Saved</p>
                      <p className="text-xl font-bold">342.8 hrs/week</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost Savings</p>
                      <p className="text-xl font-bold">$287/day</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ROI</p>
                      <p className="text-xl font-bold">3,463%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Real-time log of AI agent actions and decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    time: '2 minutes ago',
                    agent: 'Triage Agent',
                    action: 'Classified alert as high severity',
                    confidence: 94.2,
                    type: 'success',
                  },
                  {
                    time: '5 minutes ago',
                    agent: 'Analysis Agent',
                    action: 'Completed investigation of suspicious login',
                    confidence: 91.8,
                    type: 'success',
                  },
                  {
                    time: '8 minutes ago',
                    agent: 'Remediation Agent',
                    action: 'Automatically blocked malicious IP',
                    confidence: 96.5,
                    type: 'success',
                  },
                  {
                    time: '12 minutes ago',
                    agent: 'Triage Agent',
                    action: 'Escalated low-confidence alert to analyst',
                    confidence: 68.3,
                    type: 'warning',
                  },
                  {
                    time: '15 minutes ago',
                    agent: 'Report Agent',
                    action: 'Generated incident report for CISO',
                    confidence: 98.1,
                    type: 'success',
                  },
                ].map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      log.type === 'success' ? 'bg-green-500' : 
                      log.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{log.agent}</p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence: {log.confidence}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status Alert */}
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">All Systems Operational</AlertTitle>
        <AlertDescription>
          All AI agents are running optimally. 5 agents active, 0 errors in the last 24 hours.
        </AlertDescription>
      </Alert>
    </div>
  );
}

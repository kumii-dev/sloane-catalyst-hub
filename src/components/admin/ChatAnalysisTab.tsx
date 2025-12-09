import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, Search, AlertTriangle, CheckCircle2, Clock, User, Send } from "lucide-react";
import { toast } from "sonner";

interface ChatSession {
  id: string;
  session_number: string;
  user_email: string;
  user_name: string | null;
  status: string;
  priority: string;
  category: string | null;
  created_at: string;
  last_activity_at: string;
  message_count?: number;
}

interface ChatMessage {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  sender_id: string;
}

interface AnalysisForm {
  summary: string;
  sentiment: string;
  riskScore: number;
  detectedIssues: string[];
  recommendedActions: string;
}

const DETECTED_ISSUES = [
  "Suspicious behavior patterns",
  "Security concern mentioned",
  "Compliance violation",
  "Data breach risk",
  "Phishing attempt",
  "Fraudulent activity",
  "Policy violation",
  "Escalation required"
];

export const ChatAnalysisTab = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisForm, setAnalysisForm] = useState<AnalysisForm>({
    summary: "",
    sentiment: "neutral",
    riskScore: 0,
    detectedIssues: [],
    recommendedActions: ""
  });

  useEffect(() => {
    loadUnanalyzedSessions();
  }, []);

  const loadUnanalyzedSessions = async () => {
    setLoading(true);
    try {
      // Get unanalyzed sessions with message counts
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          session_number,
          user_email,
          user_name,
          status,
          priority,
          category,
          created_at,
          last_activity_at
        `)
        .eq('is_analyzed', false)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get message counts for each session
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);
          
          return { ...session, message_count: count || 0 };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load session messages');
    }
  };

  const handleAnalyzeClick = async (session: ChatSession) => {
    setSelectedSession(session);
    await loadSessionMessages(session.id);
    setAnalysisForm({
      summary: "",
      sentiment: "neutral",
      riskScore: 0,
      detectedIssues: [],
      recommendedActions: ""
    });
    setAnalysisOpen(true);
  };

  const handleSaveAnalysis = async () => {
    if (!selectedSession || !user) return;
    
    if (!analysisForm.summary.trim()) {
      toast.error('Please provide an AI summary');
      return;
    }

    setAnalyzing(true);
    try {
      // Call the analyze_chat_session function
      const { error } = await supabase.rpc('analyze_chat_session', {
        p_session_id: selectedSession.id,
        p_analyzer_id: user.id,
        p_ai_summary: analysisForm.summary,
        p_ai_sentiment: {
          overall: analysisForm.sentiment,
          confidence: 0.85
        },
        p_ai_risk_score: analysisForm.riskScore,
        p_ai_detected_issues: analysisForm.detectedIssues.map(issue => ({
          issue,
          severity: analysisForm.riskScore > 75 ? 'high' : analysisForm.riskScore > 50 ? 'medium' : 'low'
        })),
        p_ai_recommended_actions: analysisForm.recommendedActions
          .split('\n')
          .filter(a => a.trim())
          .map(action => ({ action, priority: 'medium' }))
      });

      if (error) throw error;

      toast.success('Chat session analyzed successfully');
      setAnalysisOpen(false);
      setSelectedSession(null);
      await loadUnanalyzedSessions();

      // Auto-flag if high risk
      if (analysisForm.riskScore > 75) {
        await handleSecurityFlag(selectedSession.id, 'High risk score detected during analysis');
      }
    } catch (error) {
      console.error('Error analyzing session:', error);
      toast.error('Failed to save analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSecurityFlag = async (sessionId: string, reason: string) => {
    try {
      const { error } = await supabase.rpc('flag_chat_security', {
        p_session_id: sessionId,
        p_flagged_by: user?.id,
        p_flag_reason: reason,
        p_create_incident: false
      });

      if (error) throw error;
      toast.warning('Session flagged for security review');
    } catch (error) {
      console.error('Error flagging session:', error);
    }
  };

  const handleCreateIncident = async () => {
    if (!selectedSession) return;
    
    toast.info('Incident creation from chat session coming soon');
    // This would integrate with your security_incidents table
  };

  const toggleIssue = (issue: string) => {
    setAnalysisForm(prev => ({
      ...prev,
      detectedIssues: prev.detectedIssues.includes(issue)
        ? prev.detectedIssues.filter(i => i !== issue)
        : [...prev.detectedIssues, issue]
    }));
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      urgent: "destructive",
      high: "default",
      normal: "secondary",
      low: "outline"
    };
    return variants[priority] || "secondary";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat Session Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review and analyze unprocessed chat sessions before AI agent processing
              </p>
            </div>
            <Button onClick={loadUnanalyzedSessions} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sessions.length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Analysis</div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {sessions.filter(s => s.priority === 'urgent' || s.priority === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sessions.reduce((sum, s) => sum + (s.message_count || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading sessions...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p className="text-muted-foreground">No sessions pending analysis</p>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-sm">
                      {session.session_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.user_name || 'Anonymous'}</div>
                        <div className="text-sm text-muted-foreground">{session.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadge(session.priority)}>
                        {session.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {session.category || 'General'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {session.message_count || 0} messages
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTime(session.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTime(session.last_activity_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAnalyzeClick(session)}
                        size="sm"
                        variant="default"
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Analyze
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analyze Chat Session</DialogTitle>
            <DialogDescription>
              Review messages and provide AI analysis for {selectedSession?.session_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground">User</div>
                <div className="font-medium">{selectedSession?.user_email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Priority</div>
                <Badge variant={getPriorityBadge(selectedSession?.priority || 'normal')}>
                  {selectedSession?.priority}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Session Messages ({messages.length})
              </Label>
              <ScrollArea className="h-[200px] border rounded-lg p-4">
                <div className="space-y-3">
                  {messages.map((message) => (
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
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Analysis Form */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="summary">AI Summary *</Label>
                <Textarea
                  id="summary"
                  placeholder="Provide a comprehensive summary of the chat session..."
                  value={analysisForm.summary}
                  onChange={(e) => setAnalysisForm(prev => ({ ...prev, summary: e.target.value }))}
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sentiment">Sentiment</Label>
                  <Select
                    value={analysisForm.sentiment}
                    onValueChange={(value) => setAnalysisForm(prev => ({ ...prev, sentiment: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="riskScore">Risk Score: {analysisForm.riskScore}/100</Label>
                  <div className="mt-2 pt-2">
                    <Slider
                      id="riskScore"
                      min={0}
                      max={100}
                      step={5}
                      value={[analysisForm.riskScore]}
                      onValueChange={(value) => setAnalysisForm(prev => ({ ...prev, riskScore: value[0] }))}
                      className={
                        analysisForm.riskScore > 75 ? 'accent-red-500' :
                        analysisForm.riskScore > 50 ? 'accent-yellow-500' :
                        'accent-green-500'
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Detected Issues</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {DETECTED_ISSUES.map((issue) => (
                    <div key={issue} className="flex items-center space-x-2">
                      <Checkbox
                        id={issue}
                        checked={analysisForm.detectedIssues.includes(issue)}
                        onCheckedChange={() => toggleIssue(issue)}
                      />
                      <label htmlFor={issue} className="text-sm cursor-pointer">
                        {issue}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="actions">Recommended Actions</Label>
                <Textarea
                  id="actions"
                  placeholder="One action per line..."
                  value={analysisForm.recommendedActions}
                  onChange={(e) => setAnalysisForm(prev => ({ ...prev, recommendedActions: e.target.value }))}
                  className="mt-2 min-h-[80px]"
                />
              </div>

              {analysisForm.riskScore > 75 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="w-5 h-5" />
                    High Risk Session
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    This session will be automatically flagged for security review due to high risk score.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCreateIncident}
                disabled={analyzing}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Create Incident
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAnalysisOpen(false)}
                  disabled={analyzing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAnalysis}
                  disabled={analyzing || !analysisForm.summary.trim()}
                >
                  {analyzing ? 'Analyzing...' : 'Save Analysis'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

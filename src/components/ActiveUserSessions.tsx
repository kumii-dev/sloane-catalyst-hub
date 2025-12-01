import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Monitor, MapPin, Shield, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserSession {
  id: string;
  session_id: string;
  user_id: string;
  ip_address: string;
  user_agent?: string;
  device_fingerprint?: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  is_active: boolean;
  mfa_verified: boolean;
  risk_level: string;
}

export function ActiveUserSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveSessions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions',
        },
        (payload) => {
          console.log('Session update:', payload);
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch active sessions',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.rpc('terminate_session', {
        p_session_id: sessionId,
        p_reason: 'Manually terminated by administrator',
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Session terminated successfully',
      });

      fetchActiveSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to terminate session',
      });
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
      case 'very_high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active User Sessions
            </CardTitle>
            <CardDescription>
              Monitor and manage currently active user sessions
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {sessions.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No active sessions</p>
            <p className="text-sm text-muted-foreground">No users are currently logged in</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-xs">
                      {session.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{session.ip_address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {session.user_agent?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(session.risk_level)} variant="outline">
                        {session.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.mfa_verified ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" variant="outline">
                          Not Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatTimeAgo(session.last_activity_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session.session_id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Terminate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

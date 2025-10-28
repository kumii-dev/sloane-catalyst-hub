import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Database, HardDrive, AlertTriangle, TrendingUp, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { usePerformanceMonitoring, DatabaseStat } from '@/hooks/usePerformanceMonitoring';

const PerformanceDashboard = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (error || !data) {
      toast({ title: "Access denied", description: "Admin privileges required", variant: "destructive" });
      navigate("/");
      return;
    }

    setIsAdmin(true);
  };

  const {
    dbStats,
    tableStats,
    indexUsage,
    tableBloat,
    partitionStats,
    activeQueries,
    refreshAll,
  } = usePerformanceMonitoring(autoRefresh);

  if (!isAdmin) {
    return null;
  }

  const handleRefreshAll = async () => {
    await refreshAll();
    toast({ title: 'Dashboard refreshed', description: 'All metrics updated' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'ACTIVE': 'default',
      'LOW USAGE': 'secondary',
      'UNUSED': 'destructive',
      'OK': 'default',
      'VACUUM RECOMMENDED': 'secondary',
      'VACUUM URGENT': 'destructive',
      'HEALTHY': 'default',
      'NEEDS VACUUM': 'secondary',
      'EMPTY': 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const statsByCategory = dbStats?.reduce((acc, stat) => {
    if (!acc[stat.category]) acc[stat.category] = [];
    acc[stat.category].push(stat);
    return acc;
  }, {} as Record<string, DatabaseStat[]>);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Database Performance</h1>
            <p className="text-muted-foreground">Monitor and optimize database performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button onClick={handleRefreshAll} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Database Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsByCategory && Object.entries(statsByCategory).map(([category, stats]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.map((stat) => (
                  <div key={stat.stat_name} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{stat.stat_name}</span>
                    <span className="text-sm font-semibold">{stat.stat_value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="tables" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tables">
              <Database className="mr-2 h-4 w-4" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="indexes">
              <HardDrive className="mr-2 h-4 w-4" />
              Indexes
            </TabsTrigger>
            <TabsTrigger value="bloat">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Bloat
            </TabsTrigger>
            <TabsTrigger value="partitions">
              <TrendingUp className="mr-2 h-4 w-4" />
              Partitions
            </TabsTrigger>
            <TabsTrigger value="queries">
              <Activity className="mr-2 h-4 w-4" />
              Active Queries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <CardTitle>Table Statistics</CardTitle>
                <CardDescription>Size and activity metrics for database tables</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Total Size</TableHead>
                      <TableHead>Table Size</TableHead>
                      <TableHead>Indexes</TableHead>
                      <TableHead>Live Rows</TableHead>
                      <TableHead>Dead Rows</TableHead>
                      <TableHead>Last Vacuum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableStats?.map((table) => (
                      <TableRow key={table.table_name}>
                        <TableCell className="font-mono text-sm">{table.table_name}</TableCell>
                        <TableCell>{table.total_size}</TableCell>
                        <TableCell>{table.table_size}</TableCell>
                        <TableCell>{table.indexes_size}</TableCell>
                        <TableCell>{table.live_rows.toLocaleString()}</TableCell>
                        <TableCell>{table.dead_rows.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {table.last_vacuum ? new Date(table.last_vacuum).toLocaleString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="indexes">
            <Card>
              <CardHeader>
                <CardTitle>Index Usage</CardTitle>
                <CardDescription>Analyze index effectiveness and identify unused indexes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Index</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Scans</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indexUsage?.map((idx) => (
                      <TableRow key={idx.index_name}>
                        <TableCell className="font-mono text-sm">{idx.table_name}</TableCell>
                        <TableCell className="font-mono text-sm">{idx.index_name}</TableCell>
                        <TableCell>{idx.index_size}</TableCell>
                        <TableCell>{idx.scans.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(idx.usage_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bloat">
            <Card>
              <CardHeader>
                <CardTitle>Table Bloat</CardTitle>
                <CardDescription>Monitor dead tuples and vacuum recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Bloat %</TableHead>
                      <TableHead>Est. Bloat Size</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableBloat?.map((bloat) => (
                      <TableRow key={bloat.table_name}>
                        <TableCell className="font-mono text-sm">{bloat.table_name}</TableCell>
                        <TableCell>{bloat.bloat_pct.toFixed(2)}%</TableCell>
                        <TableCell>{bloat.bloat_size}</TableCell>
                        <TableCell>{getStatusBadge(bloat.recommendation)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partitions">
            <Card>
              <CardHeader>
                <CardTitle>Partition Health</CardTitle>
                <CardDescription>Monitor partitioned table statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {partitionStats && partitionStats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partition</TableHead>
                        <TableHead>Row Count</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Vacuum</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partitionStats.map((part) => (
                        <TableRow key={part.partition_name}>
                          <TableCell className="font-mono text-sm">{part.partition_name}</TableCell>
                          <TableCell>{part.row_count.toLocaleString()}</TableCell>
                          <TableCell>{part.table_size}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {part.last_vacuum ? new Date(part.last_vacuum).toLocaleString() : 'Never'}
                          </TableCell>
                          <TableCell>{getStatusBadge(part.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No partitions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queries">
            <Card>
              <CardHeader>
                <CardTitle>Active Queries</CardTitle>
                <CardDescription>Real-time query monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                {activeQueries && activeQueries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PID</TableHead>
                        <TableHead>Duration (s)</TableHead>
                        <TableHead>Query</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Wait Event</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeQueries.map((query) => (
                        <TableRow key={query.pid}>
                          <TableCell>{query.pid}</TableCell>
                          <TableCell>{query.duration_seconds}s</TableCell>
                          <TableCell className="font-mono text-xs max-w-md truncate">{query.query_text}</TableCell>
                          <TableCell><Badge variant="outline">{query.state}</Badge></TableCell>
                          <TableCell className="text-sm">{query.wait_event}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No active queries</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PerformanceDashboard;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProviderAnalyticsDashboardProps {
  providerId: string;
  listings: any[];
}

interface AnalyticsMetrics {
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  activeSubscribers: number;
  viewsChange: number;
  bookingsChange: number;
  revenueChange: number;
  subscribersChange: number;
  conversionRate: number;
  averageRating: number;
}

const ProviderAnalyticsDashboard = ({ providerId, listings }: ProviderAnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalViews: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeSubscribers: 0,
    viewsChange: 0,
    bookingsChange: 0,
    revenueChange: 0,
    subscribersChange: 0,
    conversionRate: 0,
    averageRating: 0,
  });
  const { toast } = useToast();

  // Mock data for charts - replace with real data from Supabase
  const viewsOverTime = [
    { date: 'Week 1', views: 120, bookings: 8 },
    { date: 'Week 2', views: 180, bookings: 12 },
    { date: 'Week 3', views: 150, bookings: 10 },
    { date: 'Week 4', views: 220, bookings: 15 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5800 },
    { month: 'Mar', revenue: 7200 },
    { month: 'Apr', revenue: 6500 },
  ];

  const servicePerformance = listings.slice(0, 5).map((listing, idx) => ({
    name: listing.title.slice(0, 20),
    views: Math.floor(Math.random() * 500) + 100,
    subscribers: listing.total_subscriptions || 0,
  }));

  const conversionFunnel = [
    { stage: 'Views', count: 850, color: 'hsl(var(--primary))' },
    { stage: 'Clicks', count: 420, color: 'hsl(var(--chart-2))' },
    { stage: 'Bookings', count: 45, color: 'hsl(var(--chart-3))' },
    { stage: 'Subscribers', count: 28, color: 'hsl(var(--chart-4))' },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, providerId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate metrics from listings
      const totalSubs = listings.reduce((sum, l) => sum + (l.total_subscriptions || 0), 0);
      const mockViews = listings.length * 180; // Mock calculation
      const mockBookings = Math.floor(mockViews * 0.08);
      const mockRevenue = totalSubs * 2500; // Average revenue per subscriber

      setMetrics({
        totalViews: mockViews,
        totalBookings: mockBookings,
        totalRevenue: mockRevenue,
        activeSubscribers: totalSubs,
        viewsChange: 15.3,
        bookingsChange: 12.5,
        revenueChange: 8.7,
        subscribersChange: 5.2,
        conversionRate: mockViews > 0 ? (mockBookings / mockViews) * 100 : 0,
        averageRating: 4.6,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your analytics report is being generated...",
    });
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    prefix = '', 
    suffix = '' 
  }: { 
    title: string; 
    value: number; 
    change: number; 
    icon: any; 
    prefix?: string; 
    suffix?: string;
  }) => {
    const isPositive = change >= 0;
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change)}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Views"
          value={metrics.totalViews}
          change={metrics.viewsChange}
          icon={Eye}
        />
        <MetricCard
          title="Bookings"
          value={metrics.totalBookings}
          change={metrics.bookingsChange}
          icon={Calendar}
        />
        <MetricCard
          title="Active Subscribers"
          value={metrics.activeSubscribers}
          change={metrics.subscribersChange}
          icon={Users}
        />
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          change={metrics.revenueChange}
          icon={DollarSign}
          prefix="R"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(2)}%</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)} / 5.0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                <p className="text-2xl font-bold">
                  {listings.filter(l => l.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views & Bookings Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Views & Bookings Trend</CardTitle>
                <CardDescription>Weekly performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Views"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (R)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Service Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
              <CardDescription>Views and subscriber metrics by service</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={servicePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    stroke="hsl(var(--muted-foreground))" 
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
                  <Bar dataKey="subscribers" fill="hsl(var(--chart-2))" name="Subscribers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey from views to subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, idx) => {
                  const percentage = idx === 0 ? 100 : (stage.count / conversionFunnel[0].count) * 100;
                  const dropOff = idx > 0 
                    ? ((conversionFunnel[idx - 1].count - stage.count) / conversionFunnel[idx - 1].count) * 100
                    : 0;
                  
                  return (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            {stage.count.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                          {idx > 0 && (
                            <Badge variant="outline" className="text-xs">
                              -{dropOff.toFixed(1)}% drop-off
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: stage.color
                          }}
                        >
                          <span className="text-xs font-medium text-white">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderAnalyticsDashboard;

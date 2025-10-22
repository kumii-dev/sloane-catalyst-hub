import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Plus, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_listings: 0,
    active_subscriptions: 0,
    total_revenue: 0,
    total_views: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProviderData();
  }, [user]);

  const fetchProviderData = async () => {
    if (!user) return;

    try {
      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError) {
        console.error('Provider not found:', providerError);
        navigate('/become-provider');
        return;
      }

      setProvider(providerData);

      // Only fetch listings if approved
      if (providerData.vetting_status === 'approved') {
        const { data: listingsData } = await supabase
          .from('listings')
          .select('*')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false });

        if (listingsData) {
          setListings(listingsData);
          
          // Calculate stats
          const activeListings = listingsData.filter(l => l.status === 'active').length;
          const totalSubscriptions = listingsData.reduce((sum, l) => sum + (l.total_subscriptions || 0), 0);
          
          setStats({
            total_listings: listingsData.length,
            active_subscriptions: totalSubscriptions,
            total_revenue: 0, // TODO: Calculate from subscriptions
            total_views: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      pending: { variant: 'secondary', icon: Clock, label: 'Pending Review' },
      rejected: { variant: 'destructive', icon: AlertCircle, label: 'Rejected' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout showSidebar={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!provider || provider.vetting_status === 'pending') {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Clock className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-2xl">Application Under Review</CardTitle>
              <CardDescription>
                Your registration is under review — we'll notify you once approved to start listing!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Application Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      {getStatusBadge(provider.vetting_status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Company:</span>
                      <span className="text-sm font-medium">{provider.company_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Submitted:</span>
                      <span className="text-sm">{new Date(provider.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-sm mb-2">What's Next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Our vetting team is reviewing your application</li>
                    <li>• You'll receive an email notification once approved</li>
                    <li>• Typical review time: 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {provider.company_name}
            </p>
          </div>
          <Button asChild>
            <Link to="/create-listing">
              <Plus className="h-4 w-4 mr-2" />
              Create New Listing
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Listings</p>
                  <p className="text-2xl font-bold">{stats.total_listings}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Subscribers</p>
                  <p className="text-2xl font-bold">{stats.active_subscriptions}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                  <p className="text-2xl font-bold">{stats.total_views}</p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                  <p className="text-2xl font-bold">R{stats.total_revenue}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Management */}
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Manage your software service listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first software service listing to start connecting with customers
                    </p>
                    <Button asChild>
                      <Link to="/create-listing">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Listing
                      </Link>
                    </Button>
                  </div>
                ) : (
                  listings.map((listing) => (
                    <Card key={listing.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{listing.title}</h3>
                              {getStatusBadge(listing.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {listing.short_description}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {listing.total_subscriptions || 0} subscribers
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                {listing.credits_price} credits
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/listings/${listing.id}`}>View</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/listings/${listing.id}/edit`}>Edit</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                <p className="text-sm text-muted-foreground text-center py-8">
                  {listings.filter(l => l.status === 'active').length} active listings
                </p>
              </TabsContent>

              <TabsContent value="draft" className="mt-6">
                <p className="text-sm text-muted-foreground text-center py-8">
                  {listings.filter(l => l.status === 'draft').length} draft listings
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProviderDashboard;

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TrendingUp, Users, Coins, ArrowLeft } from 'lucide-react';
import { CurrencyIcon } from '@/components/ui/currency-icon';

export default function FinancialOverview() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCreditsInCirculation: 0,
    totalTransactions: 0,
    totalUsers: 0,
    creditsEarned: 0,
    creditsSpent: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [topWallets, setTopWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (error || !data) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchFinancialData();
  };

  const fetchFinancialData = async () => {
    setLoading(true);

    // Get wallet statistics
    const { data: wallets } = await supabase
      .from('credits_wallet')
      .select('balance, total_earned, total_spent');

    const totalBalance = wallets?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
    const totalEarned = wallets?.reduce((sum, w) => sum + (w.total_earned || 0), 0) || 0;
    const totalSpent = wallets?.reduce((sum, w) => sum + (w.total_spent || 0), 0) || 0;

    // Get transaction count
    const { count: txCount } = await supabase
      .from('credits_transactions')
      .select('*', { count: 'exact', head: true });

    // Get recent transactions with user details
    const { data: transactions } = await supabase
      .from('credits_transactions')
      .select('*, profiles(first_name, last_name, email)')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get top wallets
    const { data: topWalletData } = await supabase
      .from('credits_wallet')
      .select('user_id, balance, total_earned, total_spent, profiles(first_name, last_name, email)')
      .order('balance', { ascending: false })
      .limit(10);

    setStats({
      totalCreditsInCirculation: totalBalance,
      totalTransactions: txCount || 0,
      totalUsers: wallets?.length || 0,
      creditsEarned: totalEarned,
      creditsSpent: totalSpent
    });

    setRecentTransactions(transactions || []);
    setTopWallets(topWalletData || []);
    setLoading(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">Financial Overview</h1>
          <p className="text-muted-foreground">Monitor credits, transactions, and financial activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits in Circulation</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCreditsInCirculation.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
              <CurrencyIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.creditsEarned.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Spent</CardTitle>
              <CurrencyIcon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.creditsSpent.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest credit transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.profiles?.first_name} {tx.profiles?.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.transaction_type === 'credit' ? 'default' : 'secondary'}>
                            {tx.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </TableCell>
                        <TableCell>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Top Wallets */}
          <Card>
            <CardHeader>
              <CardTitle>Top Wallets</CardTitle>
              <CardDescription>Users with highest credit balances</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Total Earned</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topWallets.map((wallet) => (
                      <TableRow key={wallet.user_id}>
                        <TableCell>
                          {wallet.profiles?.first_name} {wallet.profiles?.last_name}
                        </TableCell>
                        <TableCell className="font-bold">{wallet.balance}</TableCell>
                        <TableCell className="text-green-600">{wallet.total_earned}</TableCell>
                        <TableCell className="text-red-600">{wallet.total_spent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

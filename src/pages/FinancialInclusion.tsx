import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCheck, 
  Shield, 
  DollarSign, 
  Smartphone, 
  CheckCircle, 
  ArrowRight,
  Building2,
  FileText,
  Users,
  Zap,
  LogOut,
  Plus,
  TrendingUp,
  Award,
  Wallet
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import BusinessScore from "@/components/BusinessScore";
import KYCUpgrade from "@/components/KYCUpgrade";
import RewardsManagement from "@/components/RewardsManagement";
import BusinessHealthReport from "@/components/BusinessHealthReport";

const FinancialInclusion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [businessScore, setBusinessScore] = useState<any>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const benefits = [
    {
      icon: Shield,
      title: "Alternative Credit Scoring",
      description: "Get scored without traditional banking history using business activity, mobile money, and operational data"
    },
    {
      icon: DollarSign,
      title: "Access to Funding",
      description: "Unlock funding opportunities typically reserved for businesses with banking relationships"
    },
    {
      icon: Smartphone,
      title: "Digital Onboarding",
      description: "Simple mobile-first registration using alternative verification methods"
    },
    {
      icon: Building2,
      title: "Service Marketplace",
      description: "Access software, mentorship, and professional services without credit cards"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a network of similar businesses building digital presence together"
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Get verified through business registration, tax compliance, and community endorsements"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Register Your Business",
      description: "Sign up using your mobile number, business registration documents, and basic business information"
    },
    {
      step: "2",
      title: "Alternative Verification",
      description: "We verify your business through CIPC records, tax compliance, and community references"
    },
    {
      step: "3",
      title: "Build Your Profile",
      description: "Add business activity data, mobile money transactions, and operational history"
    },
    {
      step: "4",
      title: "Get Scored & Matched",
      description: "Receive your credit score and get matched with funders, services, and opportunities"
    }
  ];

  const eligibility = [
    "Registered with CIPC or equivalent business registry",
    "Active business operations in formal sector",
    "Valid mobile number for verification",
    "Business registration documents available",
    "Tax compliance records (if available)",
    "Community or supplier references"
  ];

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
    }
  }, [user]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    setProfile(data);
    loadRewards(userId);
    loadBusinessScore(userId);
  };

  const loadRewards = async (userId: string) => {
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("trader_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading rewards:", error);
    } else {
      setRewards(data);
    }
  };

  const loadBusinessScore = async (userId: string) => {
    const { data, error } = await supabase
      .from("business_scores")
      .select("*")
      .eq("trader_id", userId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading score:", error);
    } else {
      setBusinessScore(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
    navigate("/");
  };

  // If logged in, show dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.business_name || "Financial Inclusion Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Business Health</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {businessScore?.score || "-"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {businessScore ? `Credit Tier: ${businessScore.credit_tier}` : "Start logging transactions"}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rewards Points</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rewards?.points || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Earn 10 points per transaction
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{profile?.kyc_tier || "none"}</div>
                <p className="text-xs text-muted-foreground">
                  Upgrade to unlock more features
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="business-health">Business Health</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="kyc">KYC</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Transactions</CardTitle>
                          <CardDescription>Log your daily sales and expenses</CardDescription>
                        </div>
                        <Button onClick={() => setShowTransactionForm(!showTransactionForm)}>
                          <Plus className="mr-2 h-4 w-4" />
                          {showTransactionForm ? "Cancel" : "Add Transaction"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showTransactionForm && (
                        <div className="mb-6">
                          <TransactionForm
                            traderId={user.id}
                            onSuccess={() => setShowTransactionForm(false)}
                            onTransactionAdded={() => {
                              setRefreshTrigger(prev => prev + 1);
                              loadRewards(user.id);
                              loadBusinessScore(user.id);
                            }}
                          />
                        </div>
                      )}
                      <TransactionList traderId={user.id} refreshTrigger={refreshTrigger} />
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <BusinessScore traderId={user.id} refreshTrigger={refreshTrigger} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business-health" className="space-y-6">
              <BusinessHealthReport 
                traderId={user.id} 
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              <RewardsManagement 
                traderId={user.id}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>

            <TabsContent value="kyc" className="space-y-6">
              <KYCUpgrade
                currentTier={profile?.kyc_tier || "none"}
                userId={user.id}
                onSuccess={() => loadProfile(user.id)}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // If not logged in, show landing page
  return (
    <Layout showSidebar={true}>
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-teal-500/5 via-background to-cyan-500/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              <UserCheck className="w-3 h-3 mr-1" />
              Financial Inclusion Program
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Banking the Unbanked
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Empowering formal sector businesses without traditional banking footprints to access 
              credit scoring, funding, software, and professional services through alternative verification methods.
            </p>
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Started Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto border-l-4 border-l-teal-500">
            <CardHeader>
              <CardTitle className="text-2xl">Breaking the Banking Barrier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Millions of formal sector small businesses operate without traditional bank accounts or credit histories, 
                excluding them from funding opportunities, business software subscriptions, and professional services that 
                require credit cards or banking relationships.
              </p>
              <p className="text-muted-foreground">
                Our Financial Inclusion Program changes this by using <strong>alternative data sources</strong> to assess 
                creditworthiness and enable access to the full ecosystem of business growth tools.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What You Get Access To</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete access to the platform's ecosystem designed specifically for businesses without traditional banking
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">
                Simple steps to get included in the ecosystem
              </p>
            </div>

            <div className="space-y-6">
              {howItWorks.map((item) => (
                <Card key={item.step} className="relative overflow-hidden">
                  <CardContent className="p-6 flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                  Eligibility Requirements
                </CardTitle>
                <CardDescription>
                  You qualify if you meet these criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {eligibility.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alternative Data Sources */}
      <section className="py-16 bg-gradient-to-br from-teal-500/5 to-cyan-500/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Alternative Credit Assessment</CardTitle>
                <CardDescription>
                  We evaluate your business using multiple data sources beyond traditional banking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Business Documentation
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• CIPC registration certificate</li>
                      <li>• Tax clearance certificates</li>
                      <li>• Business permits & licenses</li>
                      <li>• Supplier contracts & invoices</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-teal-600" />
                      Operational Data
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Mobile money transaction history</li>
                      <li>• Utility payment records</li>
                      <li>• Rent payment consistency</li>
                      <li>• Community & supplier references</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Join the Financial Inclusion Program?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your journey today and unlock access to funding, services, and opportunities 
                previously out of reach for unbanked businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/auth">
                    Create Free Account
                    <ArrowRight className="w-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default FinancialInclusion;

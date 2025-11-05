import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Zap, Lock, Book, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const APIDocumentation = () => {
  const edgeFunctions = [
    {
      name: "analyze-credit-assessment",
      method: "POST",
      auth: true,
      description: "AI-powered analysis of credit assessment data",
      endpoint: "/functions/v1/analyze-credit-assessment",
      requestBody: `{
  assessment_id: string;
  assessment_data: {
    financial_data: Record<string, any>;
    business_profile: Record<string, any>;
    governance_data: Record<string, any>;
  };
}`,
      response: `{
  overall_score: number;
  domain_scores: {
    financial_health_score: number;
    governance_score: number;
    skills_score: number;
  };
  risk_band: "low" | "medium" | "high";
  recommendations: string[];
  improvement_areas: string[];
}`
    },
    {
      name: "copilot-chat",
      method: "POST",
      auth: false,
      description: "AI chatbot for user assistance",
      endpoint: "/functions/v1/copilot-chat",
      requestBody: `{
  message: string;
  conversation_history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}`,
      response: `{
  response: string;
  suggestions?: string[];
}`
    },
    {
      name: "create-daily-room",
      method: "POST",
      auth: true,
      description: "Create video call rooms for mentorship sessions",
      endpoint: "/functions/v1/create-daily-room",
      requestBody: `{
  session_id: string;
  start_time: string;
  duration_minutes: number;
}`,
      response: `{
  room_url: string;
  room_name: string;
  token?: string;
}`
    },
    {
      name: "get-daily-token",
      method: "POST",
      auth: true,
      description: "Get participant token for video call",
      endpoint: "/functions/v1/get-daily-token",
      requestBody: `{
  room_name: string;
  user_id: string;
  is_owner: boolean;
}`,
      response: `{
  token: string;
}`
    },
    {
      name: "encrypt-pdf",
      method: "POST",
      auth: true,
      description: "Encrypt sensitive PDF documents",
      endpoint: "/functions/v1/encrypt-pdf",
      requestBody: `{
  file_path: string;
  password: string;
}`,
      response: `{
  encrypted_file_path: string;
}`
    },
    {
      name: "send-booking-email",
      method: "POST",
      auth: true,
      description: "Send booking confirmation emails",
      endpoint: "/functions/v1/send-booking-email",
      requestBody: `{
  to: string;
  mentor_name: string;
  mentee_name: string;
  session_date: string;
  session_time: string;
  meeting_link: string;
}`
    },
    {
      name: "send-review-request",
      method: "POST",
      auth: true,
      description: "Send review request after session",
      endpoint: "/functions/v1/send-review-request",
      requestBody: `{
  to: string;
  session_id: string;
  mentor_name: string;
  session_date: string;
}`
    },
    {
      name: "generate-narration",
      method: "POST",
      auth: false,
      description: "Generate audio narration using ElevenLabs",
      endpoint: "/functions/v1/generate-narration",
      requestBody: `{
  text: string;
  voice_id?: string;
}`,
      response: `{
  audio_url: string;
}`
    },
    {
      name: "generate-matches",
      method: "POST",
      auth: true,
      description: "AI-powered matching of startups with mentors and services",
      endpoint: "/functions/v1/generate-matches"
    }
  ];

  const storageBuckets = [
    {
      name: "profile-pictures",
      access: "Public",
      description: "User profile and avatar images"
    },
    {
      name: "listing-images",
      access: "Public",
      description: "Service listing and marketplace images"
    },
    {
      name: "assessment-documents",
      access: "Private",
      description: "Credit assessment and business documents"
    },
    {
      name: "general-files",
      access: "Private",
      description: "User-uploaded files and attachments"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive guide to integrating with the Kumii platform
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="pb-3">
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl">5+</CardTitle>
                <CardDescription>Edge Functions</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Database className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl">4</CardTitle>
                <CardDescription>Storage Buckets</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl">OAuth</CardTitle>
                <CardDescription>Authentication</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Code className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl">REST</CardTitle>
                <CardDescription>API Standard</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Learn how to integrate with the Kumii API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="block bg-muted p-3 rounded-md text-sm">
                      https://your-project.supabase.co
                    </code>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Required Headers</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`Authorization: Bearer YOUR_JWT_TOKEN
apikey: YOUR_SUPABASE_ANON_KEY
Content-Type: application/json`}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Rate Limits</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Edge Functions: 100 requests per minute per user</li>
                      <li>Database: 500 requests per minute per user</li>
                      <li>Storage: 100 uploads per minute per user</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">400</Badge>
                        <span className="font-medium">Bad Request</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Invalid request parameters</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">401</Badge>
                        <span className="font-medium">Unauthorized</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Missing or invalid authentication</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">403</Badge>
                        <span className="font-medium">Forbidden</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Insufficient permissions</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">404</Badge>
                        <span className="font-medium">Not Found</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Resource doesn't exist</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">500</Badge>
                        <span className="font-medium">Server Error</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Internal server error</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="functions" className="space-y-4 mt-6">
              {edgeFunctions.map((func) => (
                <Card key={func.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{func.method}</Badge>
                          <CardTitle className="text-lg">{func.name}</CardTitle>
                          {func.auth && <Badge variant="secondary">Auth Required</Badge>}
                        </div>
                        <code className="text-sm text-muted-foreground">{func.endpoint}</code>
                      </div>
                    </div>
                    <CardDescription className="mt-2">{func.description}</CardDescription>
                  </CardHeader>
                  {(func.requestBody || func.response) && (
                    <CardContent className="space-y-4">
                      {func.requestBody && (
                        <div>
                          <h4 className="font-semibold mb-2">Request Body</h4>
                          <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                            {func.requestBody}
                          </pre>
                        </div>
                      )}
                      {func.response && (
                        <div>
                          <h4 className="font-semibold mb-2">Response</h4>
                          <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                            {func.response}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="database" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Functions</CardTitle>
                  <CardDescription>SQL functions for common operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Role Management</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`-- Check if user has specific role
SELECT has_role(user_id, role);

-- Example
SELECT has_role(auth.uid(), 'admin'::app_role);`}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Credits Management</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`-- Add credits to user wallet
SELECT add_credits(
  p_user_id := 'uuid',
  p_amount := 100,
  p_description := 'Bonus credits',
  p_reference_id := NULL
);

-- Deduct credits from user wallet
SELECT deduct_credits(
  p_user_id := 'uuid',
  p_amount := 50,
  p_description := 'Session booking',
  p_reference_id := 'session_uuid'
);`}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Conversation Management</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`-- Create direct conversation between two users
SELECT create_direct_conversation(
  p_user1 := 'uuid_1',
  p_user2 := 'uuid_2',
  p_title := 'Direct conversation'
);

-- Check if user is participant
SELECT is_conversation_participant(conversation_id, user_id);`}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Assessment Functions</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`-- Check if user owns assessment
SELECT is_assessment_owner(assessment_id, user_id);

-- Check if funder has access to assessment
SELECT has_funder_assessment_access(assessment_id, user_id);`}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">React Query Hooks</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`// Paginated listings
const { data, isLoading } = useListings({ 
  status: 'active',
  category_id: 'uuid',
  search: 'query'
}, page);

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteListings({
  status: 'active'
});

// Single listing with relations
const { data: listing } = useListingDetail(id);

// Authentication
const { user, session, loading, signOut } = useAuth();`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="storage" className="space-y-4 mt-6">
              {storageBuckets.map((bucket) => (
                <Card key={bucket.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{bucket.name}</CardTitle>
                          <Badge variant={bucket.access === "Public" ? "default" : "secondary"}>
                            {bucket.access}
                          </Badge>
                        </div>
                        <CardDescription>{bucket.description}</CardDescription>
                      </div>
                      <Database className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="auth" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Methods</CardTitle>
                  <CardDescription>
                    Secure authentication options for accessing the API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">JWT Token Authentication</h3>
                    <p className="text-muted-foreground mb-3">
                      Use bearer tokens obtained from the authentication flow
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Use data.session.access_token in API calls`}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">API Key Authentication</h3>
                    <p className="text-muted-foreground mb-3">
                      Include your Supabase anon key in all requests
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`apikey: your-anon-key-here`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>OAuth Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="font-medium">Google</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="font-medium">Email/Password</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium">Phone (SMS)</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Example: Creating a Mentorship Session</CardTitle>
                  <CardDescription>Complete workflow for booking a mentorship session</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
{`// 1. Check mentor availability
const { data: availability } = await supabase
  .from('mentor_availability')
  .select('*')
  .eq('mentor_id', mentorId)
  .eq('day_of_week', dayOfWeek);

// 2. Create Daily.co room
const { data: room } = await supabase.functions.invoke('create-daily-room', {
  body: { session_id, start_time, duration_minutes: 60 }
});

// 3. Create session record
const { data: session } = await supabase
  .from('mentoring_sessions')
  .insert({
    mentor_id: mentorId,
    mentee_id: user.id,
    scheduled_at: startTime,
    session_status: 'scheduled',
    meeting_link: room.room_url
  });

// 4. Deduct credits
await supabase.rpc('deduct_credits', {
  p_user_id: user.id,
  p_amount: sessionCost,
  p_description: 'Mentorship session booking',
  p_reference_id: session.id
});

// 5. Send confirmation email
await supabase.functions.invoke('send-booking-email', {
  body: { ...emailData }
});`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Testing</CardTitle>
                  <CardDescription>Mock API responses for testing</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
{`// Use Vitest to mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));

// Load testing scripts available in k6-tests/ directory`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Always use RLS policies - Never query tables directly without RLS</li>
                    <li>Validate input data - Use Zod schemas for validation</li>
                    <li>Handle errors gracefully - Show user-friendly error messages</li>
                    <li>Cache appropriately - Use React Query staleTime for better UX</li>
                    <li>Optimize queries - Select only needed columns, use indexes</li>
                    <li>Secure edge functions - Validate JWT tokens, sanitize inputs</li>
                    <li>Rate limit - Implement client-side throttling</li>
                    <li>Log errors - Use Sentry for production error tracking</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Additional Resources */}
          <div className="max-w-6xl mx-auto mt-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  <CardTitle>Additional Resources</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <a href="https://qypazgkngxhazgkuevwq.supabase.co" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Supabase Dashboard
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/help-center" target="_blank" rel="noopener noreferrer">
                    <Code className="h-4 w-4 mr-2" />
                    Help Center
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/system-status" target="_blank" rel="noopener noreferrer">
                    <Database className="h-4 w-4 mr-2" />
                    System Status
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default APIDocumentation;

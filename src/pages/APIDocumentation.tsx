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
      description: "AI-powered analysis of credit assessment responses",
      endpoint: "/functions/v1/analyze-credit-assessment"
    },
    {
      name: "copilot-chat",
      method: "POST",
      auth: true,
      description: "AI chatbot for business guidance and support",
      endpoint: "/functions/v1/copilot-chat"
    },
    {
      name: "create-daily-room",
      method: "POST",
      auth: true,
      description: "Create video call rooms for mentorship sessions",
      endpoint: "/functions/v1/create-daily-room"
    },
    {
      name: "generate-matches",
      method: "POST",
      auth: true,
      description: "AI-powered matching of startups with mentors and services",
      endpoint: "/functions/v1/generate-matches"
    },
    {
      name: "send-booking-email",
      method: "POST",
      auth: true,
      description: "Send booking confirmation emails",
      endpoint: "/functions/v1/send-booking-email"
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="functions">Edge Functions</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
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
                </Card>
              ))}
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
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full API Docs
                </Button>
                <Button variant="outline" className="flex-1">
                  <Code className="h-4 w-4 mr-2" />
                  Code Examples
                </Button>
                <Button variant="outline" className="flex-1">
                  <Database className="h-4 w-4 mr-2" />
                  Database Schema
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

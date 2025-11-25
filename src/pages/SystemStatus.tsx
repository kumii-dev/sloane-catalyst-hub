import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Activity, Database, Zap, Cloud } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import { ComingSoon } from "@/components/ComingSoon";
import { useState } from "react";

const SystemStatus = () => {
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const services = [
    {
      name: "Web Application",
      status: "operational",
      uptime: "99.9%",
      icon: Cloud,
      description: "Main platform and user interface"
    },
    {
      name: "API Services",
      status: "operational",
      uptime: "99.8%",
      icon: Zap,
      description: "REST API and edge functions"
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.9%",
      icon: Database,
      description: "PostgreSQL database services"
    },
    {
      name: "Authentication",
      status: "operational",
      uptime: "99.9%",
      icon: CheckCircle,
      description: "User authentication and authorization"
    },
    {
      name: "File Storage",
      status: "operational",
      uptime: "99.7%",
      icon: Cloud,
      description: "Media and document storage"
    },
    {
      name: "AI Services",
      status: "operational",
      uptime: "99.5%",
      icon: Activity,
      description: "AI-powered features and copilot"
    }
  ];

  const recentIncidents = [
    {
      date: "2024-01-15",
      title: "Scheduled Maintenance",
      status: "resolved",
      description: "Database optimization and performance improvements",
      duration: "2 hours"
    },
    {
      date: "2024-01-10",
      title: "API Rate Limit Adjustments",
      status: "resolved",
      description: "Updated rate limiting for improved service quality",
      duration: "30 minutes"
    }
  ];

  const upcomingMaintenance = [
    {
      date: "2024-02-01",
      time: "02:00 - 04:00 SAST",
      title: "Infrastructure Upgrade",
      impact: "Minimal downtime expected"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Degraded</Badge>;
      case "outage":
        return <Badge variant="destructive">Outage</Badge>;
      case "resolved":
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <h1 className="text-4xl font-bold">All Systems Operational</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleString('en-ZA', { 
                dateStyle: 'medium', 
                timeStyle: 'short',
                timeZone: 'Africa/Johannesburg' 
              })} SAST
            </p>
          </div>

          {/* Overall Status */}
          <Card className="mb-8 border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>All services are running smoothly</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Services Status */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <service.icon className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(service.status)}
                      <div className="text-sm text-muted-foreground">
                        Uptime: {service.uptime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Incidents */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Incidents</h2>
              <div className="space-y-4">
                {recentIncidents.map((incident, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{incident.date}</span>
                          </div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {incident.description}
                          </CardDescription>
                          <div className="mt-3 text-sm text-muted-foreground">
                            Duration: {incident.duration}
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(incident.status)}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Maintenance */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Scheduled Maintenance</h2>
              <div className="space-y-4">
                {upcomingMaintenance.map((maintenance, index) => (
                  <Card key={index} className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{maintenance.title}</CardTitle>
                          <div className="mt-2 space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Date:</span> {maintenance.date}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Time:</span> {maintenance.time}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Impact:</span> {maintenance.impact}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Subscribe Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Stay Informed</CardTitle>
              <CardDescription>
                Subscribe to status updates and maintenance notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div 
                  onClick={() => setShowSubscribeDialog(true)}
                  className="flex-1 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <div className="font-medium mb-1">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified about incidents and maintenance
                  </div>
                </div>
                <div 
                  onClick={() => setShowHistoryDialog(true)}
                  className="flex-1 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <div className="font-medium mb-1">Status History</div>
                  <div className="text-sm text-muted-foreground">
                    View 90-day uptime and incident history
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribe Dialog */}
        <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscribe to System Status Updates</DialogTitle>
              <DialogDescription>
                Get notified about system incidents and scheduled maintenance
              </DialogDescription>
            </DialogHeader>
            <NewsletterSubscription />
          </DialogContent>
        </Dialog>

        {/* Status History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent>
            <ComingSoon 
              title="Status History" 
              description="Detailed 90-day uptime and incident history coming soon."
              showBackButton={false}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SystemStatus;

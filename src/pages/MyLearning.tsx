import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Clock,
  Calendar,
  CheckCircle2,
  Star,
  Flame,
  Zap,
  BarChart3,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

const MyLearning = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Learning Dashboard</h1>
            <p className="text-muted-foreground">Track your progress, achievements, and personalized recommendations</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="text-3xl font-bold mb-1">12</div>
                <div className="text-sm text-muted-foreground">Courses Enrolled</div>
                <div className="mt-2 text-xs text-success">+3 this month</div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-gradient-to-br from-success/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-full bg-success/10">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    67%
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">8</div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <Progress value={67} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-full bg-destructive/10">
                    <Flame className="w-6 h-6 text-destructive" />
                  </div>
                  <Zap className="w-5 h-5 text-destructive" />
                </div>
                <div className="text-3xl font-bold mb-1">14</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
                <div className="mt-2 text-xs text-destructive">Keep it going! 🔥</div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    TOP 10%
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">127h</div>
                <div className="text-sm text-muted-foreground">Learning Time</div>
                <div className="mt-2 text-xs text-accent">+12h this week</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-card">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Continue Learning */}
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2].map((item) => (
                      <Card key={item} className="border-border/50 hover:border-primary/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img 
                              src="/services/credit-scoring-banner.jpg"
                              alt="Course"
                              className="w-32 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold mb-1">Financial Modeling for Startups</h3>
                                  <p className="text-sm text-muted-foreground">22 On Sloane</p>
                                </div>
                                <Badge>Intermediate</Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Module 2 of 6</span>
                                  <span className="font-medium">65% Complete</span>
                                </div>
                                <Progress value={65} className="h-2" />
                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-sm text-muted-foreground">Next: Revenue Modeling</span>
                                  <Link to="/learning/course/1">
                                    <Button size="sm">Continue</Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Live Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Live Sessions
                  </CardTitle>
                  <CardDescription>Don't miss these interactive sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((session) => (
                      <div key={session} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[60px]">
                            <div className="text-xl font-bold text-primary">15</div>
                            <div className="text-xs text-muted-foreground">NOV</div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Advanced Financial Modeling Q&A</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>14:00 - 16:00</span>
                              <span>•</span>
                              <span>22 On Sloane</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline">Join Session</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Learning Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Learning Activity
                    </CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Videos Watched</span>
                        <span className="text-2xl font-bold">45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Quizzes Completed</span>
                        <span className="text-2xl font-bold">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Assignments Submitted</span>
                        <span className="text-2xl font-bold">8</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Live Sessions Attended</span>
                        <span className="text-2xl font-bold">6</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription>Your learning effectiveness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Average Quiz Score</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Engagement Level</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Skill Mastery</span>
                          <span className="font-medium">68%</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="col-span-full border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-primary" />
                      Achievement Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-1">12</div>
                        <div className="text-sm text-muted-foreground">Badges Earned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-success mb-1">8</div>
                        <div className="text-sm text-muted-foreground">Certificates</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-accent mb-1">1,247</div>
                        <div className="text-sm text-muted-foreground">XP Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-destructive mb-1">5</div>
                        <div className="text-sm text-muted-foreground">Level</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {[1, 2, 3, 4, 5, 6].map((badge) => (
                  <Card key={badge} className="text-center hover:shadow-lg transition-all group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-full p-8 mb-4 group-hover:scale-110 transition-transform">
                        <Trophy className="w-12 h-12 text-primary mx-auto" />
                      </div>
                      <h3 className="font-semibold mb-2">Achievement Badge</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Completed Financial Modeling Track
                      </p>
                      <Badge variant="secondary">Earned Nov 2025</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Learning Goals
                  </CardTitle>
                  <CardDescription>Set and track your learning objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { title: "Complete Financial Modeling Track", progress: 65, target: "End of Q4 2025" },
                      { title: "Earn 5 New Certifications", progress: 40, target: "By December 2025" },
                      { title: "Maintain 7-day Learning Streak", progress: 100, target: "Ongoing" }
                    ].map((goal, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">Target: {goal.target}</p>
                          </div>
                          <Badge variant={goal.progress === 100 ? "default" : "secondary"}>
                            {goal.progress}%
                          </Badge>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default MyLearning;
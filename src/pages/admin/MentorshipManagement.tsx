import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, XCircle, UserX, Eye } from "lucide-react";

export default function MentorshipManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<any[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, [user]);

  const checkAuthorization = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "mentorship_admin"]);

    if (error || !data || data.length === 0) {
      toast.error("Access denied. Mentorship admin privileges required.");
      navigate("/");
      return;
    }

    setIsAuthorized(true);
    fetchMentors();
  };

  const fetchMentors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mentors")
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email,
          profile_picture_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching mentors:", error);
      toast.error("Failed to load mentors");
    } else {
      setMentors(data || []);
    }
    setLoading(false);
  };

  const handleApproveMentor = async (mentorId: string, userId: string) => {
    const { error } = await supabase
      .from("mentors")
      .update({ status: "available" })
      .eq("id", mentorId);

    if (error) {
      toast.error("Failed to approve mentor");
      console.error(error);
      return;
    }

    // Add mentor role
    await supabase.from("user_roles").insert({
      user_id: userId,
      role: "mentor",
    });

    toast.success("Mentor approved successfully");
    fetchMentors();
  };

  const handleRejectMentor = async (mentorId: string) => {
    const { error } = await supabase
      .from("mentors")
      .update({ status: "unavailable" })
      .eq("id", mentorId);

    if (error) {
      toast.error("Failed to reject mentor");
      console.error(error);
      return;
    }

    toast.success("Mentor application rejected");
    fetchMentors();
  };

  const handleTerminateAccess = async (mentorId: string, userId: string) => {
    const { error: mentorError } = await supabase
      .from("mentors")
      .update({ status: "unavailable" })
      .eq("id", mentorId);

    if (mentorError) {
      toast.error("Failed to terminate mentor access");
      return;
    }

    // Remove mentor role
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "mentor");

    toast.success("Mentor access terminated");
    fetchMentors();
  };

  const viewMentorDetails = (mentor: any) => {
    setSelectedMentor(mentor);
    setViewDialogOpen(true);
  };

  const pendingMentors = mentors.filter((m) => m.status === "pending");
  const activeMentors = mentors.filter((m) => m.status === "available");
  const inactiveMentors = mentors.filter((m) => m.status === "unavailable" || m.status === "busy");

  if (!isAuthorized) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mentorship Management</h1>
          <p className="text-muted-foreground">
            Manage mentor applications, approvals, and access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Applications</CardDescription>
              <CardTitle className="text-3xl">{pendingMentors.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Mentors</CardDescription>
              <CardTitle className="text-3xl">{activeMentors.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Inactive</CardDescription>
              <CardTitle className="text-3xl">{inactiveMentors.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingMentors.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeMentors.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveMentors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Mentor Applications</CardTitle>
                <CardDescription>
                  Review and approve or reject mentor applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingMentors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending applications
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingMentors.map((mentor) => (
                        <TableRow key={mentor.id}>
                          <TableCell>
                            {mentor.profiles?.first_name} {mentor.profiles?.last_name}
                          </TableCell>
                          <TableCell>{mentor.profiles?.email}</TableCell>
                          <TableCell>{mentor.title || "N/A"}</TableCell>
                          <TableCell>{mentor.company || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(mentor.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => viewMentorDetails(mentor)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveMentor(mentor.id, mentor.user_id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectMentor(mentor.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Mentors</CardTitle>
                <CardDescription>Currently active mentors on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {activeMentors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active mentors</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Total Reviews</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMentors.map((mentor) => (
                        <TableRow key={mentor.id}>
                          <TableCell>
                            {mentor.profiles?.first_name} {mentor.profiles?.last_name}
                          </TableCell>
                          <TableCell>{mentor.title || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              ⭐ {mentor.rating || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>{mentor.total_reviews || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => viewMentorDetails(mentor)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleTerminateAccess(mentor.id, mentor.user_id)
                                }
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Terminate
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive">
            <Card>
              <CardHeader>
                <CardTitle>Inactive Mentors</CardTitle>
                <CardDescription>Rejected or terminated mentors</CardDescription>
              </CardHeader>
              <CardContent>
                {inactiveMentors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No inactive mentors</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status Changed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveMentors.map((mentor) => (
                        <TableRow key={mentor.id}>
                          <TableCell>
                            {mentor.profiles?.first_name} {mentor.profiles?.last_name}
                          </TableCell>
                          <TableCell>{mentor.profiles?.email}</TableCell>
                          <TableCell>{mentor.title || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(mentor.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewMentorDetails(mentor)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mentor Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Mentor Details</DialogTitle>
            </DialogHeader>
            {selectedMentor && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMentor.profiles?.first_name}{" "}
                      {selectedMentor.profiles?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMentor.profiles?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Title</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMentor.title || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMentor.company || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge>{selectedMentor.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rating</p>
                    <p className="text-sm text-muted-foreground">
                      ⭐ {selectedMentor.rating || "No rating yet"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Expertise Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.expertise_areas?.map((area: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {area}
                      </Badge>
                    )) || <p className="text-sm text-muted-foreground">None specified</p>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.specializations?.map((spec: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {spec}
                      </Badge>
                    )) || <p className="text-sm text-muted-foreground">None specified</p>}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

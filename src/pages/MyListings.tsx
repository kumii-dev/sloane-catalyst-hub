import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useListings } from "@/hooks/useListings";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Eye, Edit, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Listing {
  id: string;
  title: string;
  short_description: string;
  listing_type: string;
  status: string;
  thumbnail_url: string | null;
  base_price: number | null;
  credits_price: number | null;
  total_subscriptions: number;
  created_at: string;
}

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  const { data, isLoading, error } = useListings(
    { provider_id: user?.id },
    page
  );

  const listings = data?.listings || [];
  const hasMore = data?.hasMore || false;
  const totalCount = data?.count || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending_approval":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Edit className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success hover:bg-success/20";
      case "pending_approval":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      case "rejected":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground hover:bg-muted/20";
    }
  };

  const handleDeleteClick = (listingId: string) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingToDelete);

      if (error) throw error;

      toast({
        title: "Listing deleted",
        description: "Your listing has been successfully deleted.",
      });

      // Refresh the page to show updated listings
      window.location.reload();
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Layout showSidebar={true}>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your marketplace listings • {totalCount} total
            </p>
          </div>
          <Button onClick={() => navigate("/listings/create")}>
            <Plus className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </div>

        {error && (
          <Card className="border-destructive mb-6">
            <CardContent className="p-4">
              <p className="text-destructive">Failed to load listings. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {listings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't created any listings yet
              </p>
              <Button onClick={() => navigate("/listings/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {listing.thumbnail_url && (
                        <img
                          src={listing.thumbnail_url}
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{listing.title}</CardTitle>
                          <Badge className={getStatusColor(listing.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(listing.status)}
                              {listing.status.replace("_", " ")}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {listing.short_description}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="capitalize">{listing.listing_type}</span>
                          {listing.base_price && (
                            <span>R {listing.base_price.toFixed(2)}</span>
                          )}
                          {listing.credits_price && (
                            <span>{listing.credits_price} credits</span>
                          )}
                          <span>{listing.total_subscriptions} subscriptions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listings/${listing.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(listing.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {Math.ceil(totalCount / 20)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={!hasMore || isLoading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this listing? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default MyListings;

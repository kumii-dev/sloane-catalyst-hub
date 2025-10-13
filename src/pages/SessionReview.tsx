import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const SessionReview = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const reviewerType = searchParams.get("reviewer"); // 'mentor' or 'mentee'

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    if (!user || !sessionId) return;
    fetchSessionAndReview();
  }, [user, sessionId]);

  const fetchSessionAndReview = async () => {
    try {
      // Fetch session details with mentor and mentee information
      const { data: session, error: sessionError } = await supabase
        .from("mentoring_sessions")
        .select(`
          *,
          mentor:mentors!inner(
            id,
            user_id,
            title
          ),
          mentee:profiles!mentoring_sessions_mentee_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(session);

      // Check if review already exists
      const reviewerId = user?.id;
      
      // Get the mentor's user_id from the mentor record
      const mentorUserId = session.mentor?.user_id;
      
      const revieweeId = reviewerType === 'mentor' 
        ? session.mentee_id 
        : mentorUserId;

      const { data: reviewData } = await supabase
        .from("session_reviews")
        .select("*")
        .eq("session_id", sessionId)
        .eq("reviewer_id", reviewerId)
        .eq("reviewee_id", revieweeId)
        .maybeSingle();

      if (reviewData) {
        setExistingReview(reviewData);
        setRating(reviewData.rating);
        setReviewText(reviewData.review_text || "");
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error("Failed to load session details");
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !sessionId || rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setLoading(true);

    try {
      const reviewerId = user.id;
      
      // Get mentor's user_id from the mentor table
      const mentorUserId = session.mentor?.user_id;
      
      const actualRevieweeId = reviewerType === 'mentor' 
        ? session.mentee_id 
        : mentorUserId;

      const reviewData = {
        session_id: sessionId,
        reviewer_id: reviewerId,
        reviewee_id: actualRevieweeId,
        rating,
        review_text: reviewText,
      };

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("session_reviews")
          .update(reviewData)
          .eq("id", existingReview.id);

        if (error) throw error;
        toast.success("Review updated successfully!");
      } else {
        // Create new review
        const { error } = await supabase
          .from("session_reviews")
          .insert(reviewData);

        if (error) throw error;
        toast.success("Review submitted successfully!");
      }

      // Navigate back to appropriate dashboard
      if (reviewerType === 'mentor') {
        navigate("/mentor-dashboard");
      } else {
        navigate("/mentee-dashboard");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const revieweeName = reviewerType === 'mentor'
    ? `${session.mentee.first_name} ${session.mentee.last_name}`
    : session.mentor.title;

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {existingReview ? 'Update Your Review' : 'Leave a Review'}
          </CardTitle>
          <p className="text-muted-foreground">
            Share your experience with {revieweeName}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Session Details</h3>
            <p className="text-sm text-muted-foreground">{session.title}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(session.scheduled_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-3">
              How would you rate your experience?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Share your feedback (optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={`Tell us about your experience with ${revieweeName}...`}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitReview}
              disabled={loading || rating === 0}
              className="flex-1"
            >
              {loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionReview;

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewRequestPayload {
  sessionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId }: ReviewRequestPayload = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch session details with mentor and mentee information
    const { data: session, error: sessionError } = await supabase
      .from("mentoring_sessions")
      .select(`
        *,
        mentor:mentors!inner(
          id,
          user_id,
          title,
          profiles:user_id(
            first_name,
            last_name,
            email
          )
        ),
        mentee:profiles!mentoring_sessions_mentee_id_fkey(
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      console.error("Error fetching session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const mentorEmail = session.mentor.profiles.email;
    const menteeEmail = session.mentee.email;
    const mentorName = `${session.mentor.profiles.first_name} ${session.mentor.profiles.last_name}`;
    const menteeName = `${session.mentee.first_name} ${session.mentee.last_name}`;

    const reviewUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/review/${sessionId}`;

    // Send email to mentor to review mentee
    const mentorEmailResponse = await resend.emails.send({
      from: "Kumii <onboarding@resend.dev>",
      to: [mentorEmail],
      subject: `Please review your session with ${menteeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Session Completed!</h2>
          <p>Hi ${mentorName},</p>
          <p>Your mentoring session with <strong>${menteeName}</strong> has been completed.</p>
          <p><strong>Session:</strong> ${session.title}</p>
          <p><strong>Date:</strong> ${new Date(session.scheduled_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>We'd love to hear about your experience! Please take a moment to review ${menteeName}:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${reviewUrl}?reviewer=mentor" 
               style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Leave a Review
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Your feedback helps build trust in our community and improves the mentoring experience for everyone.</p>
          <p>Best regards,<br>The Kumii Team</p>
        </div>
      `,
    });

    // Send email to mentee to review mentor
    const menteeEmailResponse = await resend.emails.send({
      from: "Kumii <onboarding@resend.dev>",
      to: [menteeEmail],
      subject: `Please review your session with ${mentorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Session Completed!</h2>
          <p>Hi ${menteeName},</p>
          <p>Your mentoring session with <strong>${mentorName}</strong> has been completed.</p>
          <p><strong>Session:</strong> ${session.title}</p>
          <p><strong>Date:</strong> ${new Date(session.scheduled_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>We'd love to hear about your experience! Please take a moment to review ${mentorName}:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${reviewUrl}?reviewer=mentee" 
               style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Leave a Review
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Your feedback helps build trust in our community and improves the mentoring experience for everyone.</p>
          <p>Best regards,<br>The Kumii Team</p>
        </div>
      `,
    });

    console.log("Review request emails sent:", {
      mentor: mentorEmailResponse,
      mentee: menteeEmailResponse,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Review request emails sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-review-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

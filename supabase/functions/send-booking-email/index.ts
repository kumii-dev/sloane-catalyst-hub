import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  type: "booking_created" | "booking_accepted";
  mentorEmail: string;
  mentorName: string;
  menteeEmail: string;
  menteeName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  message?: string;
  sessionId: string;
  mentorUserId: string;
  menteeUserId: string;
}

// Simple retry helper to avoid transient failures and rate limits
async function sendEmailWithRetry(
  params: any,
  attempts = 3
): Promise<{ data: any; error: any }> {
  let last: { data: any; error: any } | null = null;
  for (let i = 0; i < attempts; i++) {
    last = await resend.emails.send(params);
    if (!last?.error) return last;
    const status = last.error?.statusCode ?? 0;
    // Retry on 429 (rate limit) and 5xx errors
    if (status === 429 || status >= 500) {
      const delay = (i + 1) * 600; // backoff: 600ms, 1200ms, 1800ms
      console.warn(`Resend error (status ${status}), retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    break;
  }
  return last as { data: any; error: any };
}

async function getEmailStatusWithRetry(id: string, attempts = 3) {
  let last: any = null;
  for (let i = 0; i < attempts; i++) {
    try {
      last = await resend.emails.get(id);
      if (last) return last;
    } catch (e) {
      console.warn(`Status fetch error on attempt ${i + 1}`, e);
    }
    const delay = (i + 1) * 800;
    await new Promise((r) => setTimeout(r, delay));
  }
  return last;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type,
      mentorEmail,
      mentorName,
      menteeEmail,
      menteeName,
      sessionDate,
      sessionTime,
      sessionType,
      message,
      sessionId,
      mentorUserId,
      menteeUserId,
    }: BookingEmailRequest = await req.json();

    console.log("Sending booking email:", { type, mentorEmail, menteeEmail, mentorUserId, menteeUserId });

    if (type === "booking_created") {
      // Email to mentor about new booking request
      const mentorEmailResponse = await resend.emails.send({
        from: "22 on Sloane <noreply@kumii-test.com>",
        to: [mentorEmail],
        bcc: ["nkambumw@gmail.com", "ruth@22onsloane.co"],
        subject: "New Mentoring Session Booking Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">New Session Booking Request</h1>
            <p>Hi ${mentorName},</p>
            <p>You have a new mentoring session booking request from <strong>${menteeName}</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Session Details:</h3>
              <p><strong>Date:</strong> ${sessionDate}</p>
              <p><strong>Time:</strong> ${sessionTime}</p>
              <p><strong>Type:</strong> ${sessionType}</p>
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            </div>
            
            <p>Please log in to your dashboard to review and accept or decline this booking.</p>
            
            <a href="https://kumii-test.com/mentor-dashboard" 
               style="display: inline-block; background-color: #9b87f5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View Dashboard
            </a>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The 22 on Sloane Team
            </p>
          </div>
        `,
      });

      console.log("Mentor email response:", mentorEmailResponse);
      if (mentorEmailResponse?.error) {
        console.error("Failed to send mentor email:", mentorEmailResponse.error);
        throw new Error(mentorEmailResponse.error.message || "Failed to send mentor email");
      }
      const mentorId = mentorEmailResponse?.data?.id;
      if (mentorId) {
        const status = await getEmailStatusWithRetry(mentorId, 4);
        console.log("Mentor email delivery status:", status);
      }

      // Create notification for mentor
      const { data: notification, error: notificationError } = await supabase
        .from("messages")
        .insert({
          user_id: mentorUserId,
          subject: "New Mentoring Session Booking Request",
          body: `You have a new mentoring session booking request from ${menteeName} on ${sessionDate} at ${sessionTime}. ${message ? `Message: ${message}` : ''}`,
          message_type: "notification",
          related_entity_type: "mentoring_session",
          related_entity_id: sessionId,
        })
        .select()
        .single();

      if (notificationError) {
        console.error("Failed to create notification for mentor:", notificationError);
      } else {
        console.log("Notification created for mentor:", notification);
      }

      return new Response(
        JSON.stringify({ success: true, data: mentorEmailResponse }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else if (type === "booking_accepted") {
      // Email to mentee about accepted booking
      const menteeEmailResponse = await resend.emails.send({
        from: "22 on Sloane <noreply@kumii-test.com>",
        to: [menteeEmail],
        bcc: ["nkambumw@gmail.com", "ruth@22onsloane.co"],
        subject: "Your Mentoring Session Has Been Confirmed!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Session Confirmed! 🎉</h1>
            <p>Hi ${menteeName},</p>
            <p>Great news! <strong>${mentorName}</strong> has accepted your mentoring session request.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Session Details:</h3>
              <p><strong>Date:</strong> ${sessionDate}</p>
              <p><strong>Time:</strong> ${sessionTime}</p>
              <p><strong>Type:</strong> ${sessionType}</p>
              <p><strong>Mentor:</strong> ${mentorName}</p>
            </div>
            
            <p>You'll receive the meeting link closer to the session time. Make sure to prepare any questions or topics you'd like to discuss.</p>
            
            <a href="https://kumii-test.com/mentee-dashboard" 
               style="display: inline-block; background-color: #9b87f5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              View My Sessions
            </a>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The 22 on Sloane Team
            </p>
          </div>
        `,
      });

      console.log("Mentee email response:", menteeEmailResponse);
      if (menteeEmailResponse?.error) {
        console.error("Failed to send mentee email:", menteeEmailResponse.error);
        throw new Error(menteeEmailResponse.error.message || "Failed to send mentee email");
      }
      const menteeId = menteeEmailResponse?.data?.id;
      if (menteeId) {
        const status = await getEmailStatusWithRetry(menteeId, 4);
        console.log("Mentee email delivery status:", status);
      }

      // Create notification for mentee
      const { data: notification, error: notificationError } = await supabase
        .from("messages")
        .insert({
          user_id: menteeUserId,
          subject: "Your Mentoring Session Has Been Confirmed!",
          body: `Great news! ${mentorName} has accepted your mentoring session request for ${sessionDate} at ${sessionTime}. You'll receive the meeting link closer to the session time.`,
          message_type: "notification",
          related_entity_type: "mentoring_session",
          related_entity_id: sessionId,
        })
        .select()
        .single();

      if (notificationError) {
        console.error("Failed to create notification for mentee:", notificationError);
      } else {
        console.log("Notification created for mentee:", notification);
      }

      return new Response(
        JSON.stringify({ success: true, data: menteeEmailResponse }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else {
      throw new Error("Invalid email type");
    }
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    }: BookingEmailRequest = await req.json();

    console.log("Sending booking email:", { type, mentorEmail, menteeEmail });

    if (type === "booking_created") {
      // Email to mentor about new booking request
      const mentorEmailResponse = await resend.emails.send({
        from: "22 on Sloane <onboarding@resend.dev>",
        to: [mentorEmail],
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
            
            <a href="https://preview--sloane-catalyst-hub.lovable.app/mentor-dashboard" 
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

      console.log("Mentor email sent:", mentorEmailResponse);

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
        from: "22 on Sloane <onboarding@resend.dev>",
        to: [menteeEmail],
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
            
            <a href="https://preview--sloane-catalyst-hub.lovable.app/mentee-dashboard" 
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

      console.log("Mentee email sent:", menteeEmailResponse);

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

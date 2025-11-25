import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscriptionRequest = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscriptions")
      .select("email")
      .eq("email", email)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "You're already subscribed to our newsletter!" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert subscription
    const { error: insertError } = await supabase
      .from("newsletter_subscriptions")
      .insert([{ email }]);

    if (insertError) {
      console.error("Error inserting subscription:", insertError);
      throw insertError;
    }

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "Kumii <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Kumii Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5f2d;">Thank you for subscribing!</h1>
          <p>You've successfully subscribed to the Kumii Marketplace newsletter.</p>
          <p>We'll keep you updated on:</p>
          <ul>
            <li>Latest funding opportunities</li>
            <li>New services and features</li>
            <li>Success stories from our community</li>
            <li>Exclusive events and webinars</li>
          </ul>
          <p>Stay tuned for exciting updates!</p>
          <p style="margin-top: 30px;">
            <strong>The Kumii Team</strong><br>
            Empowering SMMEs and startups across Africa
          </p>
        </div>
      `,
    });

    console.log("Confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        message: "Successfully subscribed! Check your email for confirmation.",
        success: true 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to subscribe" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "makeportfolios@gmail.com";
const SENDER_NAME = Deno.env.get("SENDER_NAME") || "Make Portfolio";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 3; // Max 3 OTP requests
const RATE_LIMIT_WINDOW_MINUTES = 15; // Per 15 minute window

interface OTPRequest {
  email: string;
  type: "email_verification" | "password_reset" | "login";
}

interface RateLimitRecord {
  id: string;
  email: string;
  request_count: number;
  window_start: string;
  created_at: string;
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date | null;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getEmailSubject(type: string): string {
  switch (type) {
    case "email_verification":
      return "Verify your email - MakePortfolios";
    case "password_reset":
      return "Reset your password - MakePortfolios";
    case "login":
      return "Your login code - MakePortfolios";
    default:
      return "Your OTP Code - MakePortfolios";
  }
}

function getEmailBody(code: string, type: string): string {
  const action = type === "email_verification"
    ? "verify your email"
    : type === "password_reset"
      ? "reset your password"
      : "log in to your account";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #18181b; font-size: 24px; margin: 0;">MakePortfolios</h1>
    </div>
    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Use the following code to ${action}:
    </p>
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <span style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</span>
    </div>
    <p style="color: #71717a; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
      This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
`;
}

// deno-lint-ignore no-explicit-any
async function checkRateLimit(supabase: any, email: string): Promise<RateLimitResult> {
  const normalizedEmail = email.toLowerCase();
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

  // Count requests in the current window
  const { data: records, error } = await supabase
    .from("otp_rate_limits")
    .select("id, request_count, window_start")
    .eq("email", normalizedEmail)
    .gte("window_start", windowStart.toISOString())
    .order("window_start", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Rate limit check error:", error);
    // Fail open but log the error - consider failing closed in production
    return { allowed: true, remainingRequests: RATE_LIMIT_MAX_REQUESTS, resetTime: null };
  }

  const typedRecords = records as RateLimitRecord[] | null;

  if (!typedRecords || typedRecords.length === 0) {
    // No recent requests, create new record
    await supabase.from("otp_rate_limits").insert({
      email: normalizedEmail,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
    return { 
      allowed: true, 
      remainingRequests: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
    };
  }

  const currentRecord = typedRecords[0];
  const requestCount = currentRecord.request_count;

  if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    const resetTime = new Date(new Date(currentRecord.window_start).getTime() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    return { 
      allowed: false, 
      remainingRequests: 0,
      resetTime
    };
  }

  // Increment request count
  await supabase
    .from("otp_rate_limits")
    .update({ request_count: requestCount + 1 })
    .eq("id", currentRecord.id);

  return { 
    allowed: true, 
    remainingRequests: RATE_LIMIT_MAX_REQUESTS - requestCount - 1,
    resetTime: new Date(new Date(currentRecord.window_start).getTime() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000)
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { email, type }: OTPRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Email and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate type is one of the allowed values
    const allowedTypes = ["email_verification", "password_reset", "login"];
    if (!allowedTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit BEFORE any other operations
    const rateLimitResult = await checkRateLimit(supabase, email);
    
    if (!rateLimitResult.allowed) {
      const retryAfterSeconds = rateLimitResult.resetTime 
        ? Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000)
        : RATE_LIMIT_WINDOW_MINUTES * 60;
      
      console.log(`Rate limit exceeded for ${email}. Retry after ${retryAfterSeconds}s`);
      
      return new Response(
        JSON.stringify({ 
          error: "Too many OTP requests. Please try again later.",
          retryAfter: retryAfterSeconds
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSeconds)
          } 
        }
      );
    }

    // For password_reset only, check if user exists
    if (type === "password_reset") {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (profileError) {
        console.error("Failed to check profile existence:", profileError);
        return new Response(
          JSON.stringify({ error: "Failed to process request" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!profile) {
        // Return generic message to prevent email enumeration
        // But still count against rate limit (already done above)
        return new Response(
          JSON.stringify({ success: true, message: "If an account exists, an OTP has been sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing unused OTPs for this email and type
    await supabase
      .from("otp_codes")
      .delete()
      .eq("email", email.toLowerCase())
      .eq("type", type)
      .is("used_at", null);

    // Insert new OTP
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email: email.toLowerCase(),
        code,
        type,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Gmail SMTP
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: SENDER_EMAIL,
          password: GMAIL_APP_PASSWORD,
        },
      },
    });

    try {
      await client.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: email,
        subject: getEmailSubject(type),
        content: "auto",
        html: getEmailBody(code, type),
      });

      await client.close();

      console.log(`OTP email sent to ${email} for ${type}. Remaining requests: ${rateLimitResult.remainingRequests}`);

      return new Response(
        JSON.stringify({ success: true, message: "OTP sent successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      await client.close();
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error("Error in send-otp-email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

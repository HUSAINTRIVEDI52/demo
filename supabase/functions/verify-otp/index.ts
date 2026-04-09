import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface VerifyOTPRequest {
  email: string;
  code: string;
  type: "email_verification" | "password_reset" | "login";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, type }: VerifyOTPRequest = await req.json();

    if (!email || !code || !type) {
      return new Response(
        JSON.stringify({ error: "Email, code, and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("type", type)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to fetch OTP:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to verify OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      // Expected validation failure (wrong/expired code) → return 200 so the client can show the message
      // without supabase-js throwing a FunctionsHttpError.
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP", valid: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // If email verification, update profile
    if (type === "email_verification") {
      // Get user by email
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // Update email_verified in profiles
        await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("id", user.id);

        // Also confirm the user's email in auth
        await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        });
      }
    }

    // For login type, create user if needed and generate magic link
    if (type === "login") {
      let isNewUser = false;
      let userId: string | null = null;

      // First, check if user exists in auth.users
      const { data: userData } = await supabase.auth.admin.listUsers();
      const existingAuthUser = userData?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (existingAuthUser) {
        // User exists in auth - check if they have a profile with full_name
        userId = existingAuthUser.id;
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", existingAuthUser.id)
          .maybeSingle();

        // User is "new" if they haven't completed their profile (no full_name)
        isNewUser = !profile?.full_name;
        console.log(`Existing user found: ${userId}, isNewUser: ${isNewUser}`);
      } else {
        // No user in auth - create new user account (passwordless)
        isNewUser = true;
        
        // Generate a random password for the passwordless account
        const randomPassword = crypto.randomUUID() + crypto.randomUUID();
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email.toLowerCase(),
          password: randomPassword,
          email_confirm: true, // Auto-confirm since they verified via OTP
        });

        if (createError) {
          // Double-check if the error is because user already exists (race condition)
          if (createError.message?.includes("already been registered")) {
            // User was created in parallel, try to find them again
            const { data: retryUserData } = await supabase.auth.admin.listUsers();
            const retryUser = retryUserData?.users?.find(
              (u) => u.email?.toLowerCase() === email.toLowerCase()
            );
            if (retryUser) {
              userId = retryUser.id;
              console.log(`User found on retry: ${userId}`);
            } else {
              console.error("Failed to find user after race condition:", createError);
              return new Response(
                JSON.stringify({ error: "Failed to create account" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          } else {
            console.error("Failed to create user:", createError);
            return new Response(
              JSON.stringify({ error: "Failed to create account" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          userId = newUser.user.id;
          console.log(`Created new user: ${userId} for email: ${email}`);
        }
      }

      // Generate a one-time login link
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email.toLowerCase(),
      });

      if (linkError) {
        console.error("Failed to generate login link:", linkError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          valid: true, 
          message: "OTP verified successfully",
          actionUrl: linkData.properties?.action_link,
          accessToken: linkData.properties?.hashed_token,
          isNewUser,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, message: "OTP verified successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-otp:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ResetPasswordRequest {
  email: string;
  code: string; // OTP code - now required for authentication
  newPassword: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, newPassword }: ResetPasswordRequest = await req.json();

    // Validate all required fields
    if (!email || !code || !newPassword) {
      console.error("Missing required fields:", { email: !!email, code: !!code, newPassword: !!newPassword });
      return new Response(
        JSON.stringify({ error: "Email, OTP code, and new password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // SECURITY: Verify OTP code before allowing password reset
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .eq('type', 'password_reset')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (otpError) {
      console.error("OTP lookup error:", otpError);
      return new Response(
        JSON.stringify({ error: "Failed to verify OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      console.error("Invalid or expired OTP for email:", normalizedEmail);
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP code. Please request a new code." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used immediately to prevent reuse
    const { error: updateOtpError } = await supabase
      .from('otp_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    if (updateOtpError) {
      console.error("Failed to mark OTP as used:", updateOtpError);
      // Continue anyway - password reset is more important
    }

    // Find user by email
    const { data: userData, error: listUsersError } = await supabase.auth.admin.listUsers();
    
    if (listUsersError) {
      console.error("Failed to list users:", listUsersError);
      return new Response(
        JSON.stringify({ error: "Failed to find user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (!user) {
      console.error("User not found for email:", normalizedEmail);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error("Failed to update password:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Password reset successfully for ${normalizedEmail} (OTP verified)`);

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in reset-password:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

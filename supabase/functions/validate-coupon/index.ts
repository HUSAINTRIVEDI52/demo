import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateCouponRequest {
  code: string;
  workspace_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("No auth header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData.user) {
      console.error("Invalid token:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.user.id;
    console.log("Validating coupon for user:", userId);

    const { code, workspace_id } = await req.json() as ValidateCouponRequest;

    if (!code || !workspace_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: code and workspace_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is a workspace member
    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspace_id)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership) {
      console.error("User not a workspace member:", membershipError);
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pro plan price in paise (e.g., ₹99 = 9900 paise)
    const PLAN_PRICE = 9900;

    // Use admin client for the RPC call
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Call the validate_coupon function
    const { data: validationResult, error: validationError } = await supabaseAdmin
      .rpc("validate_coupon", {
        p_code: code.toUpperCase(),
        p_user_id: userId,
        p_workspace_id: workspace_id,
        p_plan_price: PLAN_PRICE,
      });

    if (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: "Failed to validate coupon" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = validationResult?.[0];

    if (!result) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error_message: "Invalid coupon code" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!result.valid) {
      console.log("Coupon validation failed:", result.error_message);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error_message: result.error_message 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Coupon validated successfully:", {
      coupon_id: result.coupon_id,
      discount_amount: result.discount_amount,
      final_amount: result.final_amount,
    });

    return new Response(
      JSON.stringify({
        valid: true,
        coupon_id: result.coupon_id,
        discount_type: result.discount_type,
        discount_value: result.discount_value,
        discount_amount: result.discount_amount,
        final_amount: result.final_amount,
        original_amount: PLAN_PRICE,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

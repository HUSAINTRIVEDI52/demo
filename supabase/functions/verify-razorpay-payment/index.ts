import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

// HMAC-SHA256 implementation using Web Crypto API
async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;

    // Get request body - includes subscription support
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      workspace_id,
      coupon_id,
      discount_amount,
      target_plan = "pro",
      is_subscription = false,
      trial_days = 7,
    } = await req.json();

    // Validate target_plan
    const validPlans = ["starter", "pro"];
    if (!validPlans.includes(target_plan)) {
      return new Response(
        JSON.stringify({ error: "Invalid target plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !workspace_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for all database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user is member of workspace
    const { data: membership, error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .select("id")
      .eq("user_id", userId)
      .eq("workspace_id", workspace_id)
      .single();

    if (memberError || !membership) {
      return new Response(
        JSON.stringify({ error: "You are not a member of this workspace" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the payment record exists and belongs to this workspace
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("workspace_id", workspace_id)
      .single();

    if (paymentError || !payment) {
      console.error("Payment record not found:", paymentError);
      return new Response(
        JSON.stringify({ error: "Payment record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already processed
    if (payment.status === "success") {
      return new Response(
        JSON.stringify({ success: true, message: "Payment already verified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify Razorpay signature using Web Crypto API
    const generatedSignature = await hmacSha256(
      RAZORPAY_KEY_SECRET,
      `${razorpay_order_id}|${razorpay_payment_id}`
    );

    if (generatedSignature !== razorpay_signature) {
      console.error("Signature verification failed");
      
      // Update payment status to failed
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", payment.id);

      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Signature verified successfully for order:", razorpay_order_id);

    // Update payment record
    const { error: updatePaymentError } = await supabaseAdmin
      .from("payments")
      .update({
        razorpay_payment_id,
        status: "success",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updatePaymentError) {
      console.error("Failed to update payment:", updatePaymentError);
    }

    // Record coupon usage if a coupon was applied
    if (coupon_id && discount_amount > 0) {
      console.log("Recording coupon usage:", coupon_id, "discount:", discount_amount);
      
      const { data: useCouponResult, error: useCouponError } = await supabaseAdmin
        .rpc("use_coupon", {
          p_coupon_id: coupon_id,
          p_discount_applied: discount_amount,
          p_payment_id: payment.id,
          p_user_id: userId,
          p_workspace_id: workspace_id,
        });

      if (useCouponError) {
        console.error("Failed to record coupon usage:", useCouponError);
        // Don't fail the payment - coupon usage is secondary
      } else {
        console.log("Coupon usage recorded successfully:", useCouponResult);
      }
    }

    // Get the current workspace plan for event tracking
    const { data: currentWorkspace } = await supabaseAdmin
      .from("workspaces")
      .select("plan")
      .eq("id", workspace_id)
      .single();

    const fromPlan = currentWorkspace?.plan || "free";

    // Calculate subscription periods
    const now = new Date();
    const trialEnd = new Date(now.getTime() + (trial_days * 24 * 60 * 60 * 1000));
    const periodEnd = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year

    // Upgrade workspace to target plan with subscription info
    const updateData: Record<string, any> = { 
      plan: target_plan,
    };

    // Add subscription tracking if this is a subscription payment
    if (is_subscription) {
      updateData.subscription_id = `order_${razorpay_order_id}`;
      updateData.subscription_status = 'active';
      updateData.trial_start = now.toISOString();
      updateData.trial_end = trialEnd.toISOString();
      updateData.current_period_start = now.toISOString();
      updateData.current_period_end = periodEnd.toISOString();

      // Create subscription record
      await supabaseAdmin.from("subscriptions").insert({
        workspace_id,
        user_id: userId,
        razorpay_subscription_id: `order_${razorpay_order_id}`,
        plan_id: target_plan,
        status: "active",
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });
    }

    const { error: upgradeError } = await supabaseAdmin
      .from("workspaces")
      .update(updateData)
      .eq("id", workspace_id);

    if (upgradeError) {
      console.error("Failed to upgrade workspace:", upgradeError);
      return new Response(
        JSON.stringify({ error: "Payment verified but failed to upgrade plan. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Workspace upgraded to ${target_plan} with ${is_subscription ? 'subscription' : 'one-time'} payment:`, workspace_id);

    // Track the upgrade event with coupon info
    await supabaseAdmin
      .from("events")
      .insert({
        user_id: userId,
        workspace_id,
        event_type: "plan_upgrade",
        metadata: {
          from_plan: fromPlan,
          to_plan: target_plan,
          razorpay_order_id,
          razorpay_payment_id,
          amount: payment.amount,
          coupon_id: coupon_id || null,
          discount_amount: discount_amount || 0,
        },
      });

    const planName = target_plan.charAt(0).toUpperCase() + target_plan.slice(1);
    return new Response(
      JSON.stringify({ success: true, message: `Payment verified and plan upgraded to ${planName}!` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

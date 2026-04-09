import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PLAN_CONFIG: Record<string, { price: number; displayName: string }> = {
  starter: { price: 4900, displayName: 'Starter' },
  pro: { price: 9900, displayName: 'Pro' },
};

// Helper: always return 200 so the Supabase JS client doesn't swallow the body
function errorResponse(error: string, step: string) {
  return new Response(
    JSON.stringify({ success: false, error, step }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Unauthorized - no bearer token", "auth_header");
    }

    // Step 2: Create supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Step 3: Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return errorResponse(`Invalid token: ${userError?.message || 'no user data'}`, "auth_verify");
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    // Step 4: Parse body
    const { workspace_id, target_plan = "pro", coupon_code } = await req.json();

    if (!workspace_id) {
      return errorResponse("workspace_id is required", "parse_body");
    }

    if (!PLAN_CONFIG[target_plan]) {
      return errorResponse(`Invalid target plan: ${target_plan}`, "validate_plan");
    }

    // Step 5: Create admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 6: Check workspace membership
    const { data: membership, error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .select("id")
      .eq("user_id", userId)
      .eq("workspace_id", workspace_id)
      .single();

    if (memberError || !membership) {
      return errorResponse(`Not a workspace member: ${memberError?.message || 'no membership found'}`, "check_membership");
    }

    // Step 7: Get workspace info
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from("workspaces")
      .select("plan, subscription_status, subscription_id, razorpay_customer_id")
      .eq("id", workspace_id)
      .single();

    if (workspaceError) {
      return errorResponse(`Workspace query failed: ${workspaceError.message}`, "get_workspace");
    }

    if (workspace?.subscription_status === 'active') {
      return errorResponse("Workspace already has an active subscription", "check_subscription");
    }

    // Step 8: Validate coupon if provided
    let finalAmount = PLAN_CONFIG[target_plan].price;
    let discountAmount = 0;
    let couponId: string | null = null;

    if (coupon_code) {
      try {
        const { data: couponResult, error: couponError } = await supabaseAdmin
          .rpc("validate_coupon", {
            p_code: coupon_code,
            p_plan_price: PLAN_CONFIG[target_plan].price,
            p_user_id: userId,
            p_workspace_id: workspace_id,
          });

        if (!couponError) {
          const validation = couponResult?.[0];
          if (validation?.valid) {
            finalAmount = validation.final_amount;
            discountAmount = validation.discount_amount;
            couponId = validation.coupon_id;
          }
        }
      } catch (e) {
        // Coupon validation is non-critical
        console.error("Coupon validation error:", e);
      }
    }

    // Step 9: Create Razorpay auth
    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    // Step 10: Create or get customer
    let customerId = workspace?.razorpay_customer_id;
    
    if (!customerId) {
      try {
        const customerResponse = await fetch("https://api.razorpay.com/v1/customers", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${razorpayAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userData.user.user_metadata?.full_name || userEmail || "User",
            email: userEmail || "user@example.com",
            notes: { workspace_id, user_id: userId },
          }),
        });

        if (!customerResponse.ok) {
          const errorText = await customerResponse.text();
          return errorResponse(`Razorpay customer creation failed: ${errorText.substring(0, 200)}`, "create_customer");
        }

        const customer = await customerResponse.json();
        customerId = customer.id;

        // Store customer ID (non-blocking)
        await supabaseAdmin
          .from("workspaces")
          .update({ razorpay_customer_id: customerId })
          .eq("id", workspace_id);
      } catch (e: any) {
        return errorResponse(`Customer creation exception: ${e?.message || String(e)}`, "create_customer_exception");
      }
    }

    // Step 11: Try subscription API first
    const trialDays = 7;
    const now = Math.floor(Date.now() / 1000);
    const trialEnd = now + (trialDays * 24 * 60 * 60);

    let useOrderFallback = true;

    try {
      const subscriptionResponse = await fetch("https://api.razorpay.com/v1/subscriptions", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${razorpayAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: `plan_${target_plan}`,
          customer_id: customerId,
          total_count: 12,
          start_at: trialEnd,
        }),
      });

      if (subscriptionResponse.ok) {
        useOrderFallback = false;
        const subscription = await subscriptionResponse.json();

        // Store subscription (non-blocking)
        try {
          await supabaseAdmin.from("subscriptions").insert({
            workspace_id,
            user_id: userId,
            razorpay_subscription_id: subscription.id,
            razorpay_customer_id: customerId,
            plan_id: target_plan,
            status: subscription.status,
            trial_start: new Date().toISOString(),
            trial_end: new Date(trialEnd * 1000).toISOString(),
          });
        } catch (e) {
          console.error("Failed to store subscription:", e);
        }

        // Update workspace (non-blocking)
        try {
          await supabaseAdmin
            .from("workspaces")
            .update({
              subscription_id: subscription.id,
              subscription_status: 'trialing',
              trial_start: new Date().toISOString(),
              trial_end: new Date(trialEnd * 1000).toISOString(),
            })
            .eq("id", workspace_id);
        } catch (e) {
          console.error("Failed to update workspace:", e);
        }

        return new Response(
          JSON.stringify({
            success: true,
            type: "subscription",
            subscription_id: subscription.id,
            short_url: subscription.short_url,
            amount: finalAmount,
            original_amount: PLAN_CONFIG[target_plan].price,
            discount_amount: discountAmount,
            currency: "INR",
            key_id: RAZORPAY_KEY_ID,
            coupon_id: couponId,
            target_plan,
            trial_days: trialDays,
            trial_end: trialEnd,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        const subErrText = await subscriptionResponse.text();
        console.log("Subscription API failed, falling back to order:", subErrText);
      }
    } catch (e) {
      console.log("Subscription API exception, falling back to order:", e);
    }

    // Step 12: Fallback to order-based flow
    if (useOrderFallback) {
      try {
        const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${razorpayAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalAmount,
            currency: "INR",
            receipt: `${target_plan}_sub_${workspace_id.slice(0, 8)}`,
            notes: {
              workspace_id,
              user_id: userId,
              plan: target_plan,
              coupon_id: couponId || "",
              discount_amount: discountAmount,
              is_subscription: true,
              trial_days: trialDays,
            },
          }),
        });

        if (!orderResponse.ok) {
          const orderErrText = await orderResponse.text();
          return errorResponse(`Razorpay order creation failed: ${orderErrText.substring(0, 200)}`, "create_order");
        }

        const order = await orderResponse.json();

        // Store payment (non-blocking)
        try {
          await supabaseAdmin.from("payments").insert({
            workspace_id,
            user_id: userId,
            razorpay_order_id: order.id,
            amount: finalAmount,
            currency: "INR",
            status: "pending",
          });
        } catch (e) {
          console.error("Failed to store payment record:", e);
        }

        return new Response(
          JSON.stringify({
            success: true,
            type: "order",
            order_id: order.id,
            amount: finalAmount,
            original_amount: PLAN_CONFIG[target_plan].price,
            discount_amount: discountAmount,
            currency: "INR",
            key_id: RAZORPAY_KEY_ID,
            coupon_id: couponId,
            target_plan,
            trial_days: trialDays,
            customer_id: customerId,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e: any) {
        return errorResponse(`Order creation exception: ${e?.message || String(e)}`, "create_order_exception");
      }
    }

    return errorResponse("Unexpected flow - no response generated", "unexpected");
  } catch (error: any) {
    return errorResponse(`Unhandled error: ${error?.message || String(error)}`, "catch_all");
    }
});

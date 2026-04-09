import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

// Plan pricing in paise
const PLAN_PRICES: Record<string, number> = {
  starter: 4900, // ₹49
  pro: 9900,     // ₹99
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const { workspace_id, coupon_code, target_plan = "pro" } = await req.json();
    
    if (!workspace_id) {
      return new Response(
        JSON.stringify({ error: "workspace_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!PLAN_PRICES[target_plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid target plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const basePlanAmount = PLAN_PRICES[target_plan];

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from("workspaces")
      .select("plan")
      .eq("id", workspace_id)
      .single();

    if (workspaceError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch workspace" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already on same or higher plan
    const planHierarchy = ["free", "starter", "pro"];
    const currentPlanIndex = planHierarchy.indexOf(workspace.plan);
    const targetPlanIndex = planHierarchy.indexOf(target_plan);
    
    if (currentPlanIndex >= targetPlanIndex) {
      return new Response(
        JSON.stringify({ error: `Workspace is already on ${workspace.plan} plan` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let finalAmount = basePlanAmount;
    let discountAmount = 0;
    let couponId: string | null = null;

    if (coupon_code) {
      const { data: couponResult, error: couponError } = await supabaseAdmin
        .rpc("validate_coupon", {
          p_code: coupon_code,
          p_plan_price: basePlanAmount,
          p_user_id: userId,
          p_workspace_id: workspace_id,
        });

      if (couponError) {
        return new Response(
          JSON.stringify({ error: "Failed to validate coupon" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const validation = couponResult?.[0];
      if (!validation?.valid) {
        return new Response(
          JSON.stringify({ error: validation?.error_message || "Invalid coupon code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      finalAmount = validation.final_amount;
      discountAmount = validation.discount_amount;
      couponId = validation.coupon_id;
    }

    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${razorpayAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency: "INR",
        receipt: `${target_plan}_upgrade_${workspace_id.slice(0, 8)}`,
        notes: {
          workspace_id,
          user_id: userId,
          plan: target_plan,
          coupon_id: couponId || "",
          discount_amount: discountAmount,
          original_amount: basePlanAmount,
        },
      }),
    });

    if (!orderResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to create payment order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await orderResponse.json();

    await supabaseAdmin.from("payments").insert({
      workspace_id,
      user_id: userId,
      razorpay_order_id: order.id,
      amount: finalAmount,
      currency: "INR",
      status: "pending",
    });

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: finalAmount,
        original_amount: basePlanAmount,
        discount_amount: discountAmount,
        currency: "INR",
        key_id: RAZORPAY_KEY_ID,
        coupon_id: couponId,
        target_plan,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

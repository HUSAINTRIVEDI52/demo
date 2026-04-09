import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Verify Razorpay webhook signature using Web Crypto API
async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature || "", RAZORPAY_KEY_SECRET);
    if (!signature || !isValid) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    console.log(`Received webhook event: ${eventType}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (eventType) {
      case "subscription.authenticated": {
        // User has authorized the subscription (card saved)
        const subscription = payload.subscription.entity;
        await handleSubscriptionAuthenticated(supabase, subscription);
        break;
      }

      case "subscription.activated": {
        // Subscription is now active (first payment successful)
        const subscription = payload.subscription.entity;
        await handleSubscriptionActivated(supabase, subscription);
        break;
      }

      case "subscription.charged": {
        // Recurring payment successful
        const subscription = payload.subscription.entity;
        const payment = payload.payment?.entity;
        await handleSubscriptionCharged(supabase, subscription, payment);
        break;
      }

      case "subscription.pending": {
        // Payment is pending
        const subscription = payload.subscription.entity;
        await handleSubscriptionPending(supabase, subscription);
        break;
      }

      case "subscription.halted": {
        // Subscription halted due to payment failures
        const subscription = payload.subscription.entity;
        await handleSubscriptionHalted(supabase, subscription);
        break;
      }

      case "subscription.cancelled": {
        // Subscription was cancelled
        const subscription = payload.subscription.entity;
        await handleSubscriptionCancelled(supabase, subscription);
        break;
      }

      case "subscription.completed": {
        // All billing cycles completed
        const subscription = payload.subscription.entity;
        await handleSubscriptionCompleted(supabase, subscription);
        break;
      }

      case "payment.captured": {
        // One-time payment captured (for order-based fallback)
        const payment = payload.payment.entity;
        if (payment.notes?.is_subscription) {
          await handleOneTimePaymentWithTrial(supabase, payment);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleSubscriptionAuthenticated(supabase: any, subscription: any) {
  console.log("Subscription authenticated:", subscription.id);
  
  await supabase
    .from("subscriptions")
    .update({ status: "authenticated" })
    .eq("razorpay_subscription_id", subscription.id);
}

async function handleSubscriptionActivated(supabase: any, subscription: any) {
  console.log("Subscription activated:", subscription.id);
  
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("workspace_id, plan_id")
    .eq("razorpay_subscription_id", subscription.id)
    .single();

  if (sub) {
    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: new Date(subscription.current_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_end * 1000).toISOString(),
      })
      .eq("razorpay_subscription_id", subscription.id);

    // Update workspace plan
    await supabase
      .from("workspaces")
      .update({
        plan: sub.plan_id,
        subscription_status: "active",
        current_period_start: new Date(subscription.current_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_end * 1000).toISOString(),
      })
      .eq("id", sub.workspace_id);

    console.log(`Workspace ${sub.workspace_id} upgraded to ${sub.plan_id}`);
  }
}

async function handleSubscriptionCharged(supabase: any, subscription: any, payment: any) {
  console.log("Subscription charged:", subscription.id);
  
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("workspace_id, user_id, plan_id")
    .eq("razorpay_subscription_id", subscription.id)
    .single();

  if (sub && payment) {
    // Record payment
    await supabase.from("payments").insert({
      workspace_id: sub.workspace_id,
      user_id: sub.user_id,
      razorpay_order_id: payment.order_id || subscription.id,
      razorpay_payment_id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: "captured",
    });

    // Update subscription period
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: new Date(subscription.current_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_end * 1000).toISOString(),
      })
      .eq("razorpay_subscription_id", subscription.id);

    // Update workspace period
    await supabase
      .from("workspaces")
      .update({
        current_period_start: new Date(subscription.current_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_end * 1000).toISOString(),
      })
      .eq("id", sub.workspace_id);
  }
}

async function handleSubscriptionPending(supabase: any, subscription: any) {
  console.log("Subscription pending:", subscription.id);
  
  await supabase
    .from("subscriptions")
    .update({ status: "pending" })
    .eq("razorpay_subscription_id", subscription.id);

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("workspace_id")
    .eq("razorpay_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("workspaces")
      .update({ subscription_status: "pending" })
      .eq("id", sub.workspace_id);
  }
}

async function handleSubscriptionHalted(supabase: any, subscription: any) {
  console.log("Subscription halted:", subscription.id);
  
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("workspace_id")
    .eq("razorpay_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("subscriptions")
      .update({ status: "halted" })
      .eq("razorpay_subscription_id", subscription.id);

    // Downgrade to free plan
    await supabase
      .from("workspaces")
      .update({
        plan: "free",
        subscription_status: "halted",
      })
      .eq("id", sub.workspace_id);

    console.log(`Workspace ${sub.workspace_id} downgraded due to payment failure`);
  }
}

async function handleSubscriptionCancelled(supabase: any, subscription: any) {
  console.log("Subscription cancelled:", subscription.id);
  
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("workspace_id")
    .eq("razorpay_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("razorpay_subscription_id", subscription.id);

    // Keep access until end of current period, then webhook for completed will downgrade
    await supabase
      .from("workspaces")
      .update({ subscription_status: "cancelled" })
      .eq("id", sub.workspace_id);
  }
}

async function handleSubscriptionCompleted(supabase: any, subscription: any) {
  console.log("Subscription completed:", subscription.id);
  
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("workspace_id")
    .eq("razorpay_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("subscriptions")
      .update({ status: "completed" })
      .eq("razorpay_subscription_id", subscription.id);

    // Downgrade to free plan
    await supabase
      .from("workspaces")
      .update({
        plan: "free",
        subscription_status: "expired",
      })
      .eq("id", sub.workspace_id);
  }
}

async function handleOneTimePaymentWithTrial(supabase: any, payment: any) {
  console.log("One-time payment with trial:", payment.id);
  
  const workspaceId = payment.notes?.workspace_id;
  const targetPlan = payment.notes?.plan;
  const trialDays = parseInt(payment.notes?.trial_days || "7");
  const userId = payment.notes?.user_id;
  const couponId = payment.notes?.coupon_id;
  const discountAmount = parseInt(payment.notes?.discount_amount || "0");

  if (!workspaceId || !targetPlan) {
    console.error("Missing workspace_id or plan in payment notes");
    return;
  }

  const now = new Date();
  const trialEnd = new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000));
  const periodEnd = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year

  // Update payment status
  await supabase
    .from("payments")
    .update({
      razorpay_payment_id: payment.id,
      status: "captured",
    })
    .eq("razorpay_order_id", payment.order_id);

  // Create subscription record
  await supabase.from("subscriptions").insert({
    workspace_id: workspaceId,
    user_id: userId,
    razorpay_subscription_id: `order_${payment.order_id}`,
    plan_id: targetPlan,
    status: "active",
    trial_start: now.toISOString(),
    trial_end: trialEnd.toISOString(),
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
  });

  // Update workspace
  await supabase
    .from("workspaces")
    .update({
      plan: targetPlan,
      subscription_status: "active",
      subscription_id: `order_${payment.order_id}`,
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .eq("id", workspaceId);

  // Use coupon if provided
  if (couponId && discountAmount > 0) {
    await supabase.rpc("use_coupon", {
      p_coupon_id: couponId,
      p_user_id: userId,
      p_workspace_id: workspaceId,
      p_payment_id: payment.id,
      p_discount_applied: discountAmount,
    });
  }

  console.log(`Workspace ${workspaceId} upgraded to ${targetPlan} with trial until ${trialEnd.toISOString()}`);
}

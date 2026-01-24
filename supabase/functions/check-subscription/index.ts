import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseUrl = Deno.env.get("SB_URL");
    const supabaseServiceKey = Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not set");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    let user = null as null | { id: string; email: string | null };

    if (authHeader) {
      logStep("Authorization header found");
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      user = userData.user as typeof user;
    } else {
      const body = await req.json().catch(() => ({}));
      const email = (body as { email?: string }).email;
      if (!email) throw new Error("No authorization or email provided");
      const { data: adminData, error: adminError } = await supabaseClient.auth.admin.getUserByEmail(email);
      if (adminError || !adminData?.user) {
        throw new Error(`User lookup failed: ${adminError?.message || "No user found"}`);
      }
      user = { id: adminData.user.id, email: adminData.user.email };
    }

    if (!user?.email) throw new Error("User email not available");
    logStep("User resolved", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Look up Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      
      // Update profile to not premium
      await supabaseClient
        .from("profiles")
        .update({ 
          is_premium: false, 
          premium_updated_at: new Date().toISOString() 
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ 
          premium: false, 
          status: "inactive",
          message: "Kein Stripe-Kunde gefunden" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Also check for trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 10,
    });

    const allActiveSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data];
    
    let isPremium = false;
    let status: "active" | "trialing" | "inactive" | "unknown" = "inactive";
    let subscriptionId: string | undefined;
    let subscriptionEnd: string | undefined;

    if (allActiveSubscriptions.length > 0) {
      const subscription = allActiveSubscriptions[0];
      isPremium = true;
      status = subscription.status as "active" | "trialing";
      subscriptionId = subscription.id;
      
      // Safely convert subscription end date
      if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
        try {
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        } catch (e) {
          logStep("Warning: Could not parse subscription end date", { value: subscription.current_period_end });
          subscriptionEnd = undefined;
        }
      }
      
      logStep("Active subscription found", { subscriptionId, status, endDate: subscriptionEnd });
    } else {
      logStep("No active subscription found");
    }

    // Update profile in database
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        is_premium: isPremium,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId || null,
        premium_updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
    } else {
      logStep("Profile updated successfully", { isPremium });
    }

    return new Response(
      JSON.stringify({
        premium: isPremium,
        status,
        subscriptionId,
        subscriptionEnd,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, premium: false, status: "unknown" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

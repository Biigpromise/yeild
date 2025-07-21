import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    meta: {
      user_id?: string;
      payment_type?: string;
      campaign_id?: string;
      reward_id?: string;
      task_id?: string;
      quantity?: number;
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature (recommended for production)
    const webhookSecret = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET");
    if (webhookSecret) {
      const signature = req.headers.get("verif-hash");
      if (signature !== webhookSecret) {
        console.error("Invalid webhook signature");
        return new Response("Unauthorized", { status: 401 });
      }
    }

    const payload: FlutterwaveWebhookPayload = await req.json();
    console.log("Webhook received:", payload.event, payload.data.tx_ref);

    // Only process successful payments
    if (payload.event !== "charge.completed" || payload.data.status !== "successful") {
      console.log("Ignoring non-successful payment event");
      return new Response("OK", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update payment transaction record
    const { data: transaction, error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status: "successful",
        flutterwave_id: payload.data.id.toString(),
        amount_settled: payload.data.charged_amount,
        processor_response: {
          processor_response: payload.data.processor_response,
          auth_model: payload.data.auth_model,
          flw_ref: payload.data.flw_ref
        },
        payment_method: payload.data.payment_type,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("transaction_ref", payload.data.tx_ref)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      return new Response("Database Error", { status: 500 });
    }

    if (!transaction) {
      console.error("Transaction not found:", payload.data.tx_ref);
      return new Response("Transaction Not Found", { status: 404 });
    }

    console.log("Transaction updated:", transaction.id);

    // Process based on payment type
    await processPaymentByType(supabase, transaction, payload.data);

    // Send success notification
    await sendPaymentNotification(supabase, transaction, payload.data);

    return new Response("Webhook processed successfully", { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

async function processPaymentByType(supabase: any, transaction: any, paymentData: any) {
  const paymentType = transaction.payment_type;
  const meta = paymentData.meta || {};

  switch (paymentType) {
    case "campaign_funding":
      await processCampaignFunding(supabase, transaction, meta);
      break;
    
    case "reward_purchase":
      await processRewardPurchase(supabase, transaction, meta);
      break;
    
    case "task_payment":
      await processTaskPayment(supabase, transaction, meta);
      break;
    
    case "premium_subscription":
      await processPremiumSubscription(supabase, transaction, meta);
      break;
    
    default:
      console.log("Unknown payment type:", paymentType);
  }
}

async function processCampaignFunding(supabase: any, transaction: any, meta: any) {
  if (!transaction.campaign_id) return;

  try {
    // Update campaign funded amount
    const { error: campaignError } = await supabase
      .from("campaigns")
      .update({
        funded_amount: supabase.sql`funded_amount + ${transaction.amount}`,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.campaign_id);

    if (campaignError) {
      console.error("Error updating campaign:", campaignError);
      return;
    }

    console.log("Campaign funded successfully:", transaction.campaign_id);

    // Log the funding event
    await supabase.from("user_activity_logs").insert({
      user_id: transaction.user_id,
      action: "campaign_funded",
      details: {
        campaign_id: transaction.campaign_id,
        amount: transaction.amount,
        transaction_id: transaction.id
      }
    });

  } catch (error) {
    console.error("Error processing campaign funding:", error);
  }
}

async function processRewardPurchase(supabase: any, transaction: any, meta: any) {
  if (!transaction.reward_id) return;

  try {
    const quantity = meta.quantity || 1;

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", transaction.reward_id)
      .single();

    if (rewardError || !reward) {
      console.error("Error fetching reward:", rewardError);
      return;
    }

    // Create reward redemption record
    const redemptionCode = `RWD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const { error: redemptionError } = await supabase
      .from("reward_redemptions")
      .insert({
        user_id: transaction.user_id,
        reward_id: transaction.reward_id,
        points_spent: 0, // Cash purchase, no points
        redemption_code: redemptionCode,
        status: "pending",
        admin_notes: `Cash purchase via Flutterwave - ${transaction.transaction_ref}`
      });

    if (redemptionError) {
      console.error("Error creating redemption:", redemptionError);
      return;
    }

    // Update stock if applicable
    if (reward.stock_quantity !== null) {
      await supabase
        .from("rewards")
        .update({
          stock_quantity: Math.max(0, reward.stock_quantity - quantity)
        })
        .eq("id", transaction.reward_id);
    }

    console.log("Reward purchase processed:", transaction.reward_id);

    // Log the purchase event
    await supabase.from("user_activity_logs").insert({
      user_id: transaction.user_id,
      action: "reward_purchased",
      details: {
        reward_id: transaction.reward_id,
        redemption_code: redemptionCode,
        amount: transaction.amount,
        quantity: quantity,
        transaction_id: transaction.id
      }
    });

  } catch (error) {
    console.error("Error processing reward purchase:", error);
  }
}

async function processTaskPayment(supabase: any, transaction: any, meta: any) {
  if (!transaction.task_id) return;

  try {
    // Credit user account for task completion payment
    const { error: creditError } = await supabase.rpc("credit_user_account", {
      user_id: transaction.user_id,
      amount: transaction.amount,
      reference: `task_payment_${transaction.task_id}`,
    });

    if (creditError) {
      console.error("Error crediting user account:", creditError);
      return;
    }

    console.log("Task payment processed:", transaction.task_id);

    // Log the payment event
    await supabase.from("user_activity_logs").insert({
      user_id: transaction.user_id,
      action: "task_payment_received",
      details: {
        task_id: transaction.task_id,
        amount: transaction.amount,
        transaction_id: transaction.id
      }
    });

  } catch (error) {
    console.error("Error processing task payment:", error);
  }
}

async function processPremiumSubscription(supabase: any, transaction: any, meta: any) {
  try {
    // Activate premium subscription for user
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_expires_at: expiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.user_id);

    if (profileError) {
      console.error("Error updating user subscription:", profileError);
      return;
    }

    console.log("Premium subscription activated:", transaction.user_id);

    // Log the subscription event
    await supabase.from("user_activity_logs").insert({
      user_id: transaction.user_id,
      action: "premium_subscription_activated",
      details: {
        amount: transaction.amount,
        expires_at: expiryDate.toISOString(),
        transaction_id: transaction.id
      }
    });

  } catch (error) {
    console.error("Error processing premium subscription:", error);
  }
}

async function sendPaymentNotification(supabase: any, transaction: any, paymentData: any) {
  try {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: transaction.user_id,
        title: "Payment Successful",
        content: `Your payment of ₦${transaction.amount} has been processed successfully.`,
        type: "payment_success",
        created_at: new Date().toISOString(),
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

  } catch (error) {
    console.error("Error sending payment notification:", error);
  }
}
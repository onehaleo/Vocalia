import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeWebhookSecret } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      getStripeWebhookSecret(),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      session.metadata?.supabase_user_id ?? session.client_reference_id;
    if (!userId) {
      console.error("checkout.session.completed missing user id");
      return NextResponse.json({ received: true });
    }

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        has_paid_access: true,
        stripe_customer_id: customerId,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("profile update", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { error: paymentError } = await admin.from("payments").insert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_checkout_session_id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
    });

    if (paymentError) {
      console.error("payment insert", paymentError);
    }
  }

  return NextResponse.json({ received: true });
}

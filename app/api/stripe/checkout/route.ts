import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl, getStripePriceId } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import type { Database } from "@/types/database";

type ProfileCheckout = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "has_paid_access" | "email"
>;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("has_paid_access, email")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRaw as ProfileCheckout | null;

  const appUrl = getAppUrl();

  if (profile?.has_paid_access) {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  const stripe = getStripe();
  const priceId = getStripePriceId();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
    customer_email: profile?.email ?? user.email ?? undefined,
    client_reference_id: user.id,
    metadata: {
      supabase_user_id: user.id,
    },
    payment_intent_data: {
      metadata: {
        supabase_user_id: user.id,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(session.url, 303);
}

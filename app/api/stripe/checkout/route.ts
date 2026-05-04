import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { resolveCheckoutPriceId } from "@/lib/stripe-resolve-price";
import type { Database } from "@/types/database";

type ProfileCheckout = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "has_paid_access" | "email"
>;

function pricingError(
  appUrl: string,
  code: string,
  detail?: string,
): NextResponse {
  const u = new URL(`${appUrl}/pricing`);
  u.searchParams.set("checkout", "error");
  u.searchParams.set("code", code);
  if (detail) u.searchParams.set("detail", detail.slice(0, 400));
  return NextResponse.redirect(u.toString(), 303);
}

export async function POST() {
  const appUrl = getAppUrl();

  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId) {
    return pricingError(appUrl, "missing_price_id");
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return pricingError(appUrl, "missing_stripe_secret");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL(`${appUrl}/login`);
    login.searchParams.set("next", "/pricing");
    return NextResponse.redirect(login.toString(), 303);
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("has_paid_access, email")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRaw as ProfileCheckout | null;

  if (profile?.has_paid_access) {
    return NextResponse.redirect(`${appUrl}/dashboard`, 303);
  }

  try {
    const stripe = getStripe();

    const resolved = await resolveCheckoutPriceId(stripe, priceId);
    if ("error" in resolved) {
      return pricingError(appUrl, "invalid_price_config", resolved.error);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: resolved.priceId, quantity: 1 }],
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
      return pricingError(appUrl, "no_checkout_url");
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe_error";
    return pricingError(appUrl, "stripe_api", message);
  }
}

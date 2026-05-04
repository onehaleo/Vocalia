import type Stripe from "stripe";
import { ensureProfileRow } from "@/lib/ensure-profile";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function sessionProfileHints(session: Stripe.Checkout.Session): {
  email?: string | null;
  full_name?: string | null;
} {
  const email =
    session.customer_details?.email?.trim() ||
    (typeof session.customer_email === "string" ? session.customer_email.trim() : null) ||
    null;
  return { email, full_name: null };
}

function missingServiceRole(): { ok: false; reason: string } {
  return {
    ok: false,
    reason:
      "missing_service_role — add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Settings → API → service_role) and restart the dev server.",
  };
}

function sessionEligibleForUnlock(session: Stripe.Checkout.Session, userId: string): boolean {
  const metaUid =
    session.metadata?.supabase_user_id ?? session.client_reference_id ?? null;
  if (!metaUid || metaUid !== userId) return false;
  return session.payment_status === "paid";
}

async function persistUnlockFromPaidSession(
  session: Stripe.Checkout.Session,
  userId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const ensured = await ensureProfileRow(userId, sessionProfileHints(session));
  if (!ensured.ok) {
    return {
      ok: false,
      reason:
        ensured.reason === "missing_service_role"
          ? missingServiceRole().reason
          : `could_not_create_profile — ${ensured.reason}`,
    };
  }

  const admin = createAdminClient();
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const { data: updatedRows, error: profileError } = await admin
    .from("profiles")
    .update({
      has_paid_access: true,
      stripe_customer_id: customerId,
    })
    .eq("id", userId)
    .select("id");

  if (profileError) {
    return { ok: false, reason: profileError.message };
  }
  if (!updatedRows?.length) {
    return {
      ok: false,
      reason:
        "profile_update_matched_no_rows — no public.profiles row for this user id. Usually NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY point at a different Supabase project than where you signed up, or the profiles trigger did not run.",
    };
  }

  const { data: existingPayment } = await admin
    .from("payments")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (!existingPayment) {
    const { error: payErr } = await admin.from("payments").insert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_checkout_session_id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
    });
    if (payErr) {
      return { ok: false, reason: `payments_insert: ${payErr.message}` };
    }
  }

  return { ok: true };
}

/**
 * After Checkout redirects back with ?session_id=…, verify the session with Stripe
 * and flip `has_paid_access` using the service role. Use when webhooks are not wired
 * (e.g. local dev without `stripe listen`) or as a backup after payment.
 */
export async function trySyncPaidAccessFromCheckoutSession(
  userId: string,
  checkoutSessionId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return missingServiceRole();
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (!sessionEligibleForUnlock(session, userId)) {
      if (session.payment_status !== "paid") {
        return { ok: false, reason: `payment_not_complete (${session.payment_status})` };
      }
      return { ok: false, reason: "checkout_session_user_mismatch" };
    }

    return persistUnlockFromPaidSession(session, userId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "stripe_sync_failed";
    return { ok: false, reason: msg };
  }
}

/**
 * When the success URL lost `session_id` (bookmark, manual navigation), find a recent
 * completed Checkout Session in Stripe for the same email and matching `client_reference_id` /
 * `metadata.supabase_user_id`, then unlock.
 */
export async function trySyncPaidAccessFromCheckoutEmail(
  userId: string,
  email: string | null | undefined,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return missingServiceRole();
  }

  const trimmed = email?.trim();
  if (!trimmed) {
    return {
      ok: false,
      reason:
        "no_account_email — use the full Stripe return URL that includes session_id=… (check your browser history), or add an email to your Supabase Auth user.",
    };
  }

  try {
    const stripe = getStripe();
    const sessions = await stripe.checkout.sessions.list({
      status: "complete",
      customer_details: { email: trimmed },
      limit: 25,
    });

    for (const session of sessions.data) {
      if (!sessionEligibleForUnlock(session, userId)) continue;
      const applied = await persistUnlockFromPaidSession(session, userId);
      if (applied.ok) return applied;
      return applied;
    }

    return {
      ok: false,
      reason:
        "no_matching_paid_checkout — In Stripe Dashboard open the payment → Checkout session and copy its id (cs_test_… / cs_live_…), then visit /dashboard?checkout=success&session_id=PASTE_HERE",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "stripe_email_lookup_failed";
    return { ok: false, reason: msg };
  }
}

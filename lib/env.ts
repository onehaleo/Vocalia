function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function getSupabasePublishableKey(): string {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const legacyAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = publishable ?? legacyAnon;
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
  return key;
}

/** Used by middleware and code that reads Supabase public config. */
export function getSupabasePublicEnv() {
  return {
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
    /** Prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; falls back to anon key. */
    supabasePublishableKey: getSupabasePublishableKey(),
    /** @deprecated Use supabasePublishableKey — kept for call sites that still expect anon naming. */
    get supabaseAnonKey() {
      return this.supabasePublishableKey;
    },
  };
}

export function getAppUrl() {
  return required("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

/** Full public env including Stripe publishable key. */
export function getPublicEnv() {
  return {
    ...getSupabasePublicEnv(),
    appUrl: getAppUrl(),
    stripePublishableKey: required("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  };
}

export function getStripeSecret() {
  return required("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return required("STRIPE_WEBHOOK_SECRET");
}

export function getSupabaseServiceRoleKey() {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function getStripePriceId() {
  return required("STRIPE_PRICE_ID");
}

/**
 * Environment configuration and validation.
 *
 * - Never log secret values.
 * - Client-safe vars use NEXT_PUBLIC_* only.
 * - Server secrets are read only on the server (API routes, Server Actions, server-only modules).
 */

export type AppDeploymentEnv = "local" | "staging" | "production";

/** Canonical origins per environment (no trailing slash). */
const EXPECTED_APP_URL: Record<AppDeploymentEnv, string> = {
  local: "http://localhost:3000",
  staging: "https://staging.speakvocalia.com",
  production: "https://beta.speakvocalia.com",
};

function required(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

function normalizeAppUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function getSupabasePublishableKeyRaw(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  );
}

/** Prefer `NEXT_PUBLIC_SUPABASE_ANON_KEY`; falls back to publishable key naming. */
export function getSupabasePublishableKey(): string {
  const key = getSupabasePublishableKeyRaw();
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  return key;
}

/** Used by middleware and code that reads Supabase public config. */
export function getSupabasePublicEnv() {
  return {
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
    supabasePublishableKey: getSupabasePublishableKey(),
    /** @deprecated Use supabasePublishableKey — kept for call sites that still expect anon naming. */
    get supabaseAnonKey() {
      return this.supabasePublishableKey;
    },
  };
}

export function getAppDeploymentEnv(): AppDeploymentEnv {
  const raw = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();
  if (raw === "local" || raw === "staging" || raw === "production") {
    return raw;
  }
  throw new Error(
    "NEXT_PUBLIC_APP_ENV must be set to local, staging, or production.",
  );
}

export function getAppUrl(): string {
  return normalizeAppUrl(required("NEXT_PUBLIC_APP_URL"));
}

/** Full public env including Stripe publishable key (safe for client bundles). */
export function getPublicEnv() {
  return {
    ...getSupabasePublicEnv(),
    appUrl: getAppUrl(),
    appEnv: getAppDeploymentEnv(),
    stripePublishableKey: required("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  };
}

export function getStripeSecret(): string {
  return required("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string {
  return required("STRIPE_WEBHOOK_SECRET");
}

export function getSupabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function getStripePriceId(): string {
  return required("STRIPE_PRICE_ID");
}

/**
 * Validates deployment consistency (URLs, Stripe mode vs environment).
 * Call from server instrumentation once per process. Never prints secrets.
 *
 * Set SKIP_ENV_VALIDATION=1 to bypass (e.g. CI smoke builds without secrets).
 */
export function validateDeploymentEnvOrThrow(): void {
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return;
  }
  // Avoid failing Next.js production builds before env files are loaded for static generation.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  const deployment = getAppDeploymentEnv();
  const appUrl = normalizeAppUrl(required("NEXT_PUBLIC_APP_URL"));
  const expected = EXPECTED_APP_URL[deployment];

  if (appUrl !== expected) {
    throw new Error(
      `NEXT_PUBLIC_APP_URL must be "${expected}" when NEXT_PUBLIC_APP_ENV is "${deployment}" (got "${appUrl}").`,
    );
  }

  getSupabasePublicEnv();

  const pk = required("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  const sk = required("STRIPE_SECRET_KEY");

  if (deployment === "production") {
    if (!pk.startsWith("pk_live_")) {
      throw new Error(
        'Production requires Stripe publishable key with prefix "pk_live_".',
      );
    }
    if (!sk.startsWith("sk_live_")) {
      throw new Error(
        'Production requires Stripe secret key with prefix "sk_live_".',
      );
    }
  } else {
    if (!pk.startsWith("pk_test_")) {
      throw new Error(
        'Local and staging require Stripe publishable key with prefix "pk_test_".',
      );
    }
    if (!sk.startsWith("sk_test_")) {
      throw new Error(
        'Local and staging require Stripe secret key with prefix "sk_test_".',
      );
    }
  }

  required("STRIPE_WEBHOOK_SECRET");
  required("SUPABASE_SERVICE_ROLE_KEY");
  required("STRIPE_PRICE_ID");
}

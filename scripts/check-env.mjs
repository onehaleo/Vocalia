#!/usr/bin/env node
/**
 * Validates .env.local (or current process.env) for Vocalia deployment rules.
 * Does not print secret values — only prefixes and pass/fail.
 *
 * Usage:
 *   node scripts/check-env.mjs
 *   node --env-file=.env.local scripts/check-env.mjs   # Node 20+
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_LOCAL = path.join(ROOT, ".env.local");

function loadDotEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch {
    // optional file
  }
}

loadDotEnvFile(ENV_LOCAL);

const errors = [];
const warnings = [];

function need(name) {
  const v = process.env[name]?.trim();
  if (!v) errors.push(`missing ${name}`);
  return v;
}

const EXPECTED_APP_URL = {
  local: ["http://localhost:3000"],
  staging: ["https://staging.speakvocalia.com", "https://beta-staging.speakvocalia.com"],
  production: ["https://beta.speakvocalia.com"],
};
const PROD_BETA_URL = "https://beta.speakvocalia.com";
const STAGING_BETA_URL = "https://beta-staging.speakvocalia.com";

function norm(u) {
  return u.replace(/\/$/, "");
}

const appEnv = need("NEXT_PUBLIC_APP_ENV");
const appUrl = need("NEXT_PUBLIC_APP_URL");
const betaAppUrl = need("NEXT_PUBLIC_BETA_APP_URL");
need("NEXT_PUBLIC_SUPABASE_URL");

const pub =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!pub) {
  errors.push(
    "missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

need("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
need("STRIPE_SECRET_KEY");
need("STRIPE_WEBHOOK_SECRET");
need("STRIPE_PRICE_ID");
need("SUPABASE_SERVICE_ROLE_KEY");

if (appEnv && appUrl && EXPECTED_APP_URL[appEnv]) {
  const allowed = EXPECTED_APP_URL[appEnv];
  if (!allowed.includes(norm(appUrl))) {
    errors.push(
      `NEXT_PUBLIC_APP_URL should be one of: ${allowed.join(", ")} for NEXT_PUBLIC_APP_ENV=${appEnv}`,
    );
  }
}

if (appEnv === "production" && betaAppUrl && norm(betaAppUrl) !== PROD_BETA_URL) {
  errors.push(`NEXT_PUBLIC_BETA_APP_URL must be ${PROD_BETA_URL} in production`);
}
if (appEnv === "staging" && betaAppUrl && norm(betaAppUrl) !== STAGING_BETA_URL) {
  errors.push(`NEXT_PUBLIC_BETA_APP_URL must be ${STAGING_BETA_URL} in staging`);
}
if (
  appEnv === "local" &&
  betaAppUrl &&
  !["http://localhost:3000", STAGING_BETA_URL].includes(norm(betaAppUrl))
) {
  errors.push(
    `NEXT_PUBLIC_BETA_APP_URL must be http://localhost:3000 or ${STAGING_BETA_URL} in local`,
  );
}

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
const sk = process.env.STRIPE_SECRET_KEY?.trim();

if (pk && sk && appEnv) {
  if (appEnv === "production") {
    if (!pk.startsWith("pk_live_")) {
      errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_live_ in production');
    }
    if (!sk.startsWith("sk_live_")) {
      errors.push('STRIPE_SECRET_KEY must start with sk_live_ in production');
    }
  } else if (appEnv === "local" || appEnv === "staging") {
    if (!pk.startsWith("pk_test_")) {
      errors.push(
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_test_ for local/staging',
      );
    }
    if (!sk.startsWith("sk_test_")) {
      errors.push('STRIPE_SECRET_KEY must start with sk_test_ for local/staging');
    }
  }
}

if (
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY
) {
  warnings.push(
    "Remove any NEXT_PUBLIC_* copies of server secrets — service role and Stripe secret must not be public.",
  );
}

console.log("[check-env] Vocalia environment check");
if (!errors.length && !warnings.length) {
  console.log("[check-env] OK — required variables present (secrets not shown).");
  process.exit(0);
}

for (const w of warnings) {
  console.warn("[check-env] WARN:", w);
}
if (errors.length) {
  for (const e of errors) {
    console.error("[check-env] FAIL:", e);
  }
  process.exit(1);
}

console.log("[check-env] OK with warnings.");
process.exit(0);

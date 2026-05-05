/**
 * Fallback when `NEXT_PUBLIC_APP_URL` is unset (e.g. misconfigured deploy).
 * Production app URL is **beta.speakvocalia.com**; always prefer env in real deployments.
 */
export const DEFAULT_PUBLIC_ORIGIN = "https://beta.speakvocalia.com";
export const DEFAULT_BETA_APP_ORIGIN = "https://beta.speakvocalia.com";
export const DEFAULT_MARKETING_ORIGIN = "https://speakvocalia.com";
export const DEFAULT_MARKETING_URL = DEFAULT_MARKETING_ORIGIN;

/** Public site origin, no trailing slash. Always set `NEXT_PUBLIC_APP_URL` per environment. */
export function getCanonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return DEFAULT_PUBLIC_ORIGIN;
}

/** External beta app origin used by marketing CTAs. */
export function getBetaAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BETA_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return DEFAULT_BETA_APP_ORIGIN;
}

/** Builds a full beta-app URL for paths like `/login`, `/pricing`, `/dashboard`. */
export function betaUrl(path: string): string {
  const base = getBetaAppUrl();
  const nextPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${nextPath}`;
}

/** External marketing-site origin used by marketing CTAs and "back to Vocalia" links. */
export function getMarketingUrl(): string {
  const raw = process.env.NEXT_PUBLIC_MARKETING_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return DEFAULT_MARKETING_URL;
}

/** Builds a full marketing-site URL for paths like `"/"` or `"/#pricing"`. */
export function marketingUrl(path: string): string {
  const base = getMarketingUrl();
  const nextPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${nextPath}`;
}

/**
 * Best-effort domain classification based on the host header.
 * Useful for domain-aware UI (client) or additional middleware logic.
 */
export function getCurrentDomainType(host: string): "marketing" | "app" | "unknown" {
  const h = host.toLowerCase().split(":")[0].trim();
  const marketingBase = getMarketingUrl().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  const betaBase = getBetaAppUrl().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];

  if (h === marketingBase || h === marketingBase.replace(/^www\./, "")) return "marketing";
  if (h === betaBase || h === betaBase.replace(/^www\./, "")) return "app";
  if (h.includes("localhost")) return "marketing";

  return "unknown";
}


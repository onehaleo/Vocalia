/**
 * Fallback when `NEXT_PUBLIC_APP_URL` is unset (e.g. misconfigured deploy).
 * Production app URL is **beta.speakvocalia.com**; always prefer env in real deployments.
 */
export const DEFAULT_PUBLIC_ORIGIN = "https://beta.speakvocalia.com";
export const DEFAULT_BETA_APP_ORIGIN = "https://beta.speakvocalia.com";

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

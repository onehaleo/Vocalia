/**
 * Fallback when `NEXT_PUBLIC_APP_URL` is unset (e.g. misconfigured deploy).
 * Production app URL is **beta.speakvocalia.com**; always prefer env in real deployments.
 */
export const DEFAULT_PUBLIC_ORIGIN = "https://beta.speakvocalia.com";

/** Public site origin, no trailing slash. Always set `NEXT_PUBLIC_APP_URL` per environment. */
export function getCanonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return DEFAULT_PUBLIC_ORIGIN;
}

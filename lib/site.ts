/** Production hostname — used when `NEXT_PUBLIC_APP_URL` is unset (e.g. some CI). */
export const CANONICAL_HOST = "speakvocalia.com";

/** Public site origin, no trailing slash. Prefer `NEXT_PUBLIC_APP_URL` in every deployed environment. */
export function getCanonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return `https://${CANONICAL_HOST}`;
}

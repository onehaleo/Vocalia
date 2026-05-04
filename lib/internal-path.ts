/**
 * Prevent open redirects: only allow same-origin relative paths.
 */
export function safeInternalPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

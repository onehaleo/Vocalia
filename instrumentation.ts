/**
 * Next.js instrumentation — runs once when the Node server starts (dev / `next start`).
 * See https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  const run =
    process.env.NODE_ENV === "production" ||
    process.env.FORCE_ENV_VALIDATION === "1";
  if (!run) {
    return;
  }
  const { validateDeploymentEnvOrThrow } = await import("@/lib/env");
  try {
    validateDeploymentEnvOrThrow();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[env] Invalid configuration:", msg);
    throw err;
  }
}

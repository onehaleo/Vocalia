import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Insert a missing `public.profiles` row (same shape as the auth.users trigger).
 * Needed when users signed up before the trigger existed or it failed once.
 */
export async function ensureProfileRow(
  userId: string,
  hints: { email?: string | null; full_name?: string | null },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { ok: false, reason: "missing_service_role" };
  }

  try {
    const admin = createAdminClient();
    const { data: existing } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (existing) return { ok: true };

    const { error } = await admin.from("profiles").insert({
      id: userId,
      email: hints.email ?? null,
      full_name: hints.full_name ?? null,
    });

    if (error) {
      if (error.code === "23505") return { ok: true };
      return { ok: false, reason: error.message };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "ensure_profile_failed" };
  }
}

import type { User } from "@supabase/supabase-js";
import { ensureProfileRow } from "@/lib/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<{
  user: User | null;
  profile: ProfileRow | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile = profileRaw as ProfileRow | null;

  if (!profile) {
    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null;

    const repaired = await ensureProfileRow(user.id, {
      email: user.email ?? null,
      full_name: fullName,
    });

    if (repaired.ok) {
      const { data: again } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = again as ProfileRow | null;
    }
  }

  return { user, profile };
}

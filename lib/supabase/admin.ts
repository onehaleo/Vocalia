import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "@/lib/env";

export function createAdminClient() {
  const { supabaseUrl } = getSupabasePublicEnv();
  return createClient<Database>(supabaseUrl, getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Supabase admin client — **server-only**. Uses the service role key for privileged writes.
 * Do not import from Client Components or any code bundled for the browser.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "@/lib/env";

export function createAdminClient() {
  const { supabaseUrl } = getSupabasePublicEnv();
  return createClient<Database>(supabaseUrl, getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

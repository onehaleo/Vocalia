import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Server-side Supabase client. Pass the cookie store from `await cookies()` (App Router).
 * Matches Supabase’s recommended `createClient(cookieStore)` pattern.
 */
export function createClient(
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>,
) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
          );
        } catch {
          /* Called from a Server Component without mutable cookies — middleware refreshes session. */
        }
      },
    },
  });
}

import { cookies } from "next/headers";
import { createClient as createSupabaseServerClient } from "@/utils/supabase/server";

/** App-wide server client — uses `utils/supabase/server` + `cookies()`. */
export async function createClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(cookieStore);
}

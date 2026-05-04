import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";
import { safeInternalPath } from "@/lib/internal-path";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${getAppUrl()}${next}`);
    }
  }

  return NextResponse.redirect(`${getAppUrl()}/login?error=auth`);
}

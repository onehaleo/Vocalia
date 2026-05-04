import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const protectedPrefixes = [
  "/dashboard",
  "/levels",
  "/lessons",
  "/learn",
  "/practice",
  "/review",
  "/dictionary",
  "/progress",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  const { user, response } = await updateSession(request);

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach((c) => {
      redirect.cookies.set(c.name, c.value);
    });
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

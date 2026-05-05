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
const betaAppHosts = new Set(["beta.speakvocalia.com", "beta-staging.speakvocalia.com"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost ?? request.headers.get("host") ?? "";
  const host = hostHeader.toLowerCase().split(",")[0].trim().split(":")[0];

  if (pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  if (betaAppHosts.has(host) && pathname === "/") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
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

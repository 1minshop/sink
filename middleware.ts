import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signToken, verifyToken } from "@/lib/auth/session";

const protectedRoutes = "/dashboard";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Extract subdomain from hostname
  const subdomain = getSubdomain(hostname);

  // Handle subdomain routing to shopfront
  if (
    subdomain &&
    subdomain !== "www" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next")
  ) {
    // Check if it's already a shopfront route to avoid infinite redirect
    if (!pathname.startsWith("/shop")) {
      const shopfrontUrl = new URL(
        `/shop/${subdomain}${pathname}`,
        request.url
      );
      return NextResponse.rewrite(shopfrontUrl);
    }
  }

  const sessionCookie = request.cookies.get("session");
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: "session",
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error("Error updating session:", error);
      res.cookies.delete("session");
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  return res;
}

function getSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(":")[0];

  // Split by dots
  const parts = host.split(".");

  // For localhost development, treat the first part as subdomain if it's not localhost
  if (parts.length === 1 && parts[0] === "localhost") {
    return null;
  }

  // For development with custom hosts (e.g., shop1.localhost:3000)
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    const subdomain = parts[0];
    return subdomain === "localhost" ? null : subdomain;
  }

  // For 1min.shop domain (e.g., shop1.1min.shop)
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === "1min" &&
    parts[parts.length - 1] === "shop"
  ) {
    const subdomain = parts[0];
    return subdomain === "www" ? null : subdomain;
  }

  // For production domains (e.g., shop1.example.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
};

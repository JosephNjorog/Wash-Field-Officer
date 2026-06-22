import { NextResponse, type NextRequest } from "next/server";
import { MANAGEMENT_PATHS, ROLE_COOKIE } from "@/lib/auth";

const SUPERVISOR_ONLY_API_RULES: { test: (pathname: string, method: string) => boolean }[] = [
  { test: (p, m) => p.startsWith("/api/officers") && (m === "POST" || m === "PATCH") },
  { test: (p, m) => p.startsWith("/api/assets") && m === "PATCH" },
  { test: (p) => p.startsWith("/api/reports") },
  { test: (p) => p.startsWith("/api/settings") },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/public/") || pathname === "/api/auth/login") {
      return NextResponse.next();
    }
    if (!role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const requiresSupervisor = SUPERVISOR_ONLY_API_RULES.some((rule) =>
      rule.test(pathname, request.method)
    );
    if (requiresSupervisor && role !== "supervisor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  const isManagementPath = MANAGEMENT_PATHS.some((p) => pathname.startsWith(p));
  const isFieldPath = pathname.startsWith("/field");

  if (!role && (isManagementPath || isFieldPath)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role === "officer" && isManagementPath) {
    return NextResponse.redirect(new URL("/field", request.url));
  }

  if (role === "supervisor" && isFieldPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/login" && role) {
    return NextResponse.redirect(
      new URL(role === "officer" ? "/field" : "/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/officers/:path*",
    "/assets/:path*",
    "/complaints/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/field/:path*",
    "/api/:path*",
  ],
};

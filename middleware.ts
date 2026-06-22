import { NextResponse, type NextRequest } from "next/server";
import { MANAGEMENT_PATHS, ROLE_COOKIE } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

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
    "/assets/:path*",
    "/complaints/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/field/:path*",
  ],
};

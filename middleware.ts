import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicRoute =
    path === "/" ||
    path === "/log-in" ||
    path === "/sign-up" ||
    path === "/forgot-password" ||
    path === "/check-email" ||
    path === "/verify"

  const isProtectedRoute =
    path.startsWith("/users") ||
    path.startsWith("/cleaning-business") ||
    path.startsWith("/property") ||
    path.startsWith("/booking") ||
    path.startsWith("/payment") ||
    path.startsWith("/analytics") ||
    path.startsWith("/settings")

  // Check for session cookie instead of token
  const sessionCookie = request.cookies.get("session")?.value

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isPublicRoute && sessionCookie && path !== "/verify") {
    return NextResponse.redirect(new URL("/users", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)"],
}


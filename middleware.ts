import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROUTES } from "./lib/constants"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  const isPublicRoute =
    path === ROUTES.HOME ||
    path === ROUTES.LOGIN ||
    path === ROUTES.SIGNUP ||
    path === ROUTES.FORGOT_PASSWORD ||
    path === "/check-email" ||
    path === ROUTES.VERIFY;

  const isProtectedRoute =
    path.startsWith(ROUTES.USERS) ||
    path.startsWith(ROUTES.CLEANING_BUSINESSES) ||
    path.startsWith(ROUTES.PROPERTIES) ||
    path.startsWith(ROUTES.BOOKINGS) ||
    path.startsWith(ROUTES.PAYMENTS) ||
    path.startsWith("/analytics") ||
    path.startsWith(ROUTES.SETTINGS);

  // Check for JWT token in cookies or Authorization header
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
  }

  if (isPublicRoute && token && path !== ROUTES.VERIFY) {
    return NextResponse.redirect(new URL(ROUTES.USERS, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)"],
}


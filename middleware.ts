import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  isPreviewCookieEnabled,
  isPreviewRouteAllowed,
  PREVIEW_MODE_COOKIE,
  PREVIEW_MODE_REQUEST_HEADER,
} from "@/lib/previewMode"

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete(PREVIEW_MODE_REQUEST_HEADER)

  if (
    isPreviewCookieEnabled(request.cookies.get(PREVIEW_MODE_COOKIE)?.value) &&
    isPreviewRouteAllowed(request.nextUrl.pathname)
  ) {
    requestHeaders.set(PREVIEW_MODE_REQUEST_HEADER, "1")
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/blog/preview",
  ],
}

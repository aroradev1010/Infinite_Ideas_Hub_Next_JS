import "server-only"

import { cookies, headers } from "next/headers"

import {
  isPreviewCookieEnabled,
  PREVIEW_MODE_COOKIE,
  PREVIEW_MODE_REQUEST_HEADER,
} from "@/lib/previewMode"

export async function isPreviewRequest(): Promise<boolean> {
  try {
    const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])

    return (
      isPreviewCookieEnabled(cookieStore.get(PREVIEW_MODE_COOKIE)?.value) &&
      headerStore.get(PREVIEW_MODE_REQUEST_HEADER) === "1"
    )
  } catch {
    return false
  }
}

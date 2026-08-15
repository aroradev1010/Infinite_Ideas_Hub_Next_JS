export const PREVIEW_MODE_COOKIE = "infinite-ideas-preview"
export const PREVIEW_MODE_REQUEST_HEADER = "x-infinite-ideas-preview-route"
export const PREVIEW_MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
export const PREVIEW_MUTATION_MESSAGE =
  "Preview mode: changes are disabled in the public demo."

const PREVIEW_EXACT_ROUTES = new Set([
  "/dashboard",
  "/dashboard/posts",
  "/dashboard/create",
  "/admin",
  "/admin/posts",
  "/admin/authors",
  "/api/blog/preview",
])

const PREVIEW_DYNAMIC_ROUTES = [/^\/dashboard\/edit\/[^/]+$/]

export function isPreviewRouteAllowed(pathname: string): boolean {
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname

  return (
    PREVIEW_EXACT_ROUTES.has(normalizedPathname) ||
    PREVIEW_DYNAMIC_ROUTES.some((pattern) => pattern.test(normalizedPathname))
  )
}

export function isPreviewCookieEnabled(value?: string): boolean {
  return value === "1"
}

export type PreviewAccessDecision = "authenticated" | "preview" | "denied"

export function resolvePreviewAccess({
  allowedRoles,
  hasSession,
  previewRequest,
  role,
}: {
  allowedRoles: readonly string[]
  hasSession: boolean
  previewRequest: boolean
  role?: string
}): PreviewAccessDecision {
  if (hasSession) {
    return role && allowedRoles.includes(role) ? "authenticated" : "denied"
  }

  return previewRequest ? "preview" : "denied"
}

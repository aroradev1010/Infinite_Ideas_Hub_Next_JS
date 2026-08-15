import "server-only"

import type { Session } from "next-auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { resolvePreviewAccess } from "@/lib/previewMode"
import { isPreviewRequest } from "@/lib/previewRequest.server"

type AuthenticatedAccess = {
  kind: "authenticated"
  session: Session
}

type PreviewAccess = {
  kind: "preview"
  session: null
}

export type ExperienceAccess = AuthenticatedAccess | PreviewAccess

async function getExperienceAccess(
  allowedRoles: readonly string[]
): Promise<{ access: ExperienceAccess | null; hasSession: boolean }> {
  const [session, previewRequest] = await Promise.all([
    getServerSession(authOptions),
    isPreviewRequest(),
  ])
  const decision = resolvePreviewAccess({
    allowedRoles,
    hasSession: Boolean(session),
    previewRequest,
    role: session?.user?.role,
  })

  if (decision === "authenticated" && session) {
    return {
      access: { kind: "authenticated", session },
      hasSession: true,
    }
  }

  if (decision === "preview") {
    return {
      access: { kind: "preview", session: null },
      hasSession: false,
    }
  }

  return { access: null, hasSession: Boolean(session) }
}

export async function requireRoleOrPreviewPage(
  allowedRoles: readonly string[],
  redirectTo = "/auth/sign-in"
): Promise<ExperienceAccess> {
  const { access, hasSession } = await getExperienceAccess(allowedRoles)
  if (access) return access

  if (hasSession) redirect("/")
  redirect(redirectTo)
}

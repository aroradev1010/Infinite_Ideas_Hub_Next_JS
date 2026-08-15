import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireRoleOrPreviewPage(["admin", "author"])

  return <DashboardShell>{children}</DashboardShell>
}

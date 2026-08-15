import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireRoleOrPreviewPage(["admin"])

  return <DashboardShell mode="admin">{children}</DashboardShell>
}

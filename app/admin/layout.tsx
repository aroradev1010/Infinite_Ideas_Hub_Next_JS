import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { requireRolePage } from "@/lib/requireRole"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireRolePage(["admin"])

  return <DashboardShell mode="admin">{children}</DashboardShell>
}

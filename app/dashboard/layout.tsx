import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { requireRolePage } from "@/lib/requireRole"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireRolePage(["admin", "author"])

  return <DashboardShell>{children}</DashboardShell>
}

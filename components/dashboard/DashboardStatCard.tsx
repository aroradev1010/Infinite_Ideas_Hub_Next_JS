import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface DashboardStatCardProps {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: number
}

export function DashboardStatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: DashboardStatCardProps) {
  return (
    <Card className="border-white/[0.08] bg-card/20 shadow-none">
      <CardContent className="flex items-center justify-between p-5 sm:p-6">
        <div>
          <p className="text-sm font-bold text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">
            {value}
          </p>
        </div>
        <span
          className={`flex size-11 items-center justify-center rounded-xl border ${iconClassName}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}

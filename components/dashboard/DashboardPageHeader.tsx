import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface DashboardPageHeaderProps {
  action?: ReactNode
  className?: string
  description: string
  eyebrow: string
  title: string
}

export function DashboardPageHeader({
  action,
  className,
  description,
  eyebrow,
  title,
}: DashboardPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </header>
  )
}

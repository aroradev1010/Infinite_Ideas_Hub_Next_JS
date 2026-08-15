"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, FileText, LayoutDashboard } from "lucide-react"

import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: ReactNode
}

const navigation = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/posts", icon: FileText, label: "Posts" },
]

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href

  return (
    pathname === href ||
    pathname.startsWith("/dashboard/create") ||
    pathname.startsWith("/dashboard/edit") ||
    pathname.startsWith("/dashboard/drafts")
  )
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()

  return (
    <div className="-mb-20 min-h-[calc(100dvh-4.75rem)] border-t border-white/[0.06] bg-background text-foreground">
      <nav
        aria-label="Dashboard sections"
        className="sticky top-0 z-20 border-b border-white/[0.07] bg-background/95 backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto flex w-full max-w-7xl px-4 sm:px-6">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(pathname, item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm font-bold text-gray-500 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/70",
                    isActive && "border-cyan-400 text-cyan-300"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="lg:grid lg:min-h-[calc(100dvh-4.75rem)] lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/[0.07] bg-black/20 lg:block">
          <div className="sticky top-0 flex h-[calc(100dvh-4.75rem)] min-h-[32rem] flex-col py-7">
            <nav aria-label="Dashboard navigation" className="flex-1">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = isItemActive(pathname, item.href)

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-white/[0.025] hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/70",
                          isActive && "bg-cyan-400/[0.05] text-cyan-300"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute inset-y-2 left-0 w-0.5 rounded-r bg-transparent",
                            isActive && "bg-cyan-400"
                          )}
                          aria-hidden="true"
                        />
                        <Icon
                          className={cn(
                            "size-4 text-gray-600",
                            isActive && "text-cyan-300"
                          )}
                          aria-hidden="true"
                        />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-white/[0.07] px-3 pt-3">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to Blog
              </Link>
            </div>
          </div>
        </aside>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}

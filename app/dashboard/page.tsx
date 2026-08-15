import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  FilePenLine,
  FileText,
} from "lucide-react"

import DashboardBlogsTable from "@/components/dashboard/DashboardBlogsTable"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getAuthorByUserId } from "@/lib/authorService"
import { getDashboardPostsByAuthorId } from "@/lib/blogService.server"
import { requireRolePage } from "@/lib/requireRole"
import PrimaryButton from "@/components/PrimaryButton"

const summaryCards = [
  {
    key: "total" as const,
    label: "Total Posts",
    icon: FileText,
    iconClassName: "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300",
  },
  {
    key: "published" as const,
    label: "Published",
    icon: CheckCircle2,
    iconClassName:
      "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
  },
  {
    key: "drafts" as const,
    label: "Drafts",
    icon: FilePenLine,
    iconClassName: "border-amber-300/15 bg-amber-300/[0.07] text-amber-200",
  },
]

export default async function DashboardPage() {
  const session = await requireRolePage(["author", "admin"])
  const author = await getAuthorByUserId(session.user.id)

  if (!author) {
    return (
      <section>
        <header>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-400">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Plan, write, and manage your ideas in one place.
          </p>
        </header>

        <Card className="mt-8 max-w-2xl border-dashed border-white/10 bg-card/20 shadow-none">
          <CardContent className="p-8">
            <h2 className="text-lg font-extrabold text-white">
              Author profile required
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Your account has dashboard access, but it is not connected to an
              author profile yet. Ask an administrator to create or connect one.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  const posts = await getDashboardPostsByAuthorId(author.id)
  const counts = {
    total: posts.length,
    published: posts.filter((post) => post.status === "published").length,
    drafts: posts.filter((post) => post.status === "draft").length,
  }
  const recentPosts = posts.slice(0, 5)

  return (
    <section className="space-y-9">
      <DashboardPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Pick up where you left off and keep your publishing moving."
        action={
          <Link href="/dashboard/create">
            <PrimaryButton
              text="+ New Blog"
              className="w-fullfont-extrabold text-slate-950 shadow-lg sm:w-auto"
            />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <DashboardStatCard
            key={card.key}
            icon={card.icon}
            iconClassName={card.iconClassName}
            label={card.label}
            value={counts[card.key]}
          />
        ))}
      </div>

      <section aria-labelledby="recent-posts-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2
              id="recent-posts-heading"
              className="text-xl font-black tracking-tight text-white sm:text-2xl"
            >
              Recent Posts
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your five most recently updated posts.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="shrink-0 text-gray-400 hover:bg-white/[0.05] hover:text-cyan-300"
          >
            <Link href="/dashboard/posts">
              View all
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <DashboardBlogsTable
          key={recentPosts.map((post) => post.id).join("-")}
          initialPosts={recentPosts}
          variant="recent"
        />
      </section>
    </section>
  )
}

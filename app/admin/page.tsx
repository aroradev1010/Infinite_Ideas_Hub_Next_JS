import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  PenLine,
  Users,
} from "lucide-react"

import AdminPostsTable from "@/components/admin/AdminPostsTable"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard"
import { Button } from "@/components/ui/button"
import {
  getAllAuthorsForAdmin,
  getAllAuthorsForShowcase,
} from "@/lib/authorService"
import {
  getAllBlogsForAdmin,
  getShowcaseAdminPosts,
} from "@/lib/blogService.server"
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server"
import { getAllUsersForAdmin } from "@/lib/userService"

const summaryCards = [
  {
    key: "posts" as const,
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
    key: "authors" as const,
    label: "Authors",
    icon: PenLine,
    iconClassName: "border-amber-300/15 bg-amber-300/[0.07] text-amber-200",
  },
  {
    key: "users" as const,
    label: "Users",
    icon: Users,
    iconClassName: "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300",
  },
]

export default async function AdminPage() {
  const access = await requireRoleOrPreviewPage(["admin"])
  const [posts, authors, users] =
    access.kind === "preview"
      ? await Promise.all([
          getShowcaseAdminPosts(),
          getAllAuthorsForShowcase(),
          Promise.resolve([]),
        ])
      : await Promise.all([
          getAllBlogsForAdmin(),
          getAllAuthorsForAdmin(),
          getAllUsersForAdmin(),
        ])
  const counts = {
    posts: posts.length,
    published: posts.filter((post) => post.status === "published").length,
    authors: authors.length,
    users: users.length,
  }
  const recentPosts = posts.slice(0, 5)
  const visibleSummaryCards =
    access.kind === "preview"
      ? summaryCards.filter((card) => card.key !== "users")
      : summaryCards

  return (
    <section className="space-y-9">
      <DashboardPageHeader
        eyebrow="Admin overview"
        title="Admin Dashboard"
        description={
          access.kind === "preview"
            ? "Explore content, publishing, and author management with public data."
            : "Manage content, publishing, authors, and users."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleSummaryCards.map((card) => (
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
              The five most recently updated posts across all authors.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="shrink-0 text-gray-400 hover:bg-white/[0.05] hover:text-cyan-300"
          >
            <Link href="/admin/posts">
              View all
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <AdminPostsTable
          key={recentPosts.map((post) => post.id).join("-")}
          initialPosts={recentPosts}
          variant="recent"
        />
      </section>
    </section>
  )
}

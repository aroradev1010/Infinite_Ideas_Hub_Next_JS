import Link from "next/link"
import { Plus } from "lucide-react"

import DashboardBlogsTable from "@/components/dashboard/DashboardBlogsTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getAuthorByUserId } from "@/lib/authorService"
import { getDashboardPostsByAuthorId } from "@/lib/blogService.server"
import { requireRolePage } from "@/lib/requireRole"

export default async function DashboardPostsPage() {
  const session = await requireRolePage(["author", "admin"])
  const author = await getAuthorByUserId(session.user.id)

  if (!author) {
    return (
      <section>
        <header>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-400">
            Publishing
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Posts
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Search, edit, and manage your published work and drafts.
          </p>
        </header>

        <Card className="mt-8 max-w-2xl border-dashed border-white/10 bg-card/20 shadow-none">
          <CardContent className="p-8">
            <h2 className="text-lg font-extrabold text-white">
              Author profile required
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Ask an administrator to connect an author profile before managing
              posts.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  const posts = await getDashboardPostsByAuthorId(author.id)

  return (
    <section>
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-400">
            Publishing
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Posts
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Search, edit, and manage your published work and drafts.
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-cyan-400 font-extrabold text-slate-950 shadow-lg shadow-cyan-950/20 hover:bg-cyan-300 sm:w-auto"
        >
          <Link href="/dashboard/create">
            <Plus aria-hidden="true" />
            New Post
          </Link>
        </Button>
      </header>

      <DashboardBlogsTable initialPosts={posts} />
    </section>
  )
}

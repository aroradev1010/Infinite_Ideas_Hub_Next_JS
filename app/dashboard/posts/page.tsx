import Link from "next/link"

import DashboardBlogsTable from "@/components/dashboard/DashboardBlogsTable"
import { Card, CardContent } from "@/components/ui/card"
import { getAuthorByUserId } from "@/lib/authorService"
import {
  getDashboardPostsByAuthorId,
  getShowcaseDashboardPosts,
} from "@/lib/blogService.server"
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server"
import PrimaryButton from "@/components/PrimaryButton"

export default async function DashboardPostsPage() {
  const access = await requireRoleOrPreviewPage(["author", "admin"])
  const author =
    access.kind === "authenticated"
      ? await getAuthorByUserId(access.session.user.id)
      : null

  if (access.kind === "authenticated" && !author) {
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

  const posts =
    access.kind === "preview"
      ? await getShowcaseDashboardPosts()
      : await getDashboardPostsByAuthorId(author!.id)

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
            {access.kind === "preview"
              ? "Search and explore the editing experience with public posts."
              : "Search, edit, and manage your published work and drafts."}
          </p>
        </div>
        <Link href="/dashboard/create">
          <PrimaryButton
            text="+ New Blog"
            className="w-fullfont-extrabold text-slate-950 shadow-lg sm:w-auto"
          />
        </Link>
      </header>

      <DashboardBlogsTable initialPosts={posts} />
    </section>
  )
}

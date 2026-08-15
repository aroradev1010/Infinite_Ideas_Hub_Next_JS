import CreateEditBlogClient from "@/components/CreateEditBlogClient"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"
import { getAuthorByUserId } from "@/lib/authorService"
import { requireRolePage } from "@/lib/requireRole"

export default async function CreateBlogPage() {
  const session = await requireRolePage(["author", "admin"])
  const author = await getAuthorByUserId(session.user.id)

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <DashboardPageHeader
        eyebrow="Editor"
        title="Create New Blog"
        description="Draft, edit, and publish your next post."
      />

      <CreateEditBlogClient
        initialBlog={null}
        presentation="dashboard-create"
        currentAuthor={{
          name: author?.name ?? session.user.name ?? "Unknown Author",
          slug: author?.slug ?? null,
        }}
      />
    </section>
  )
}

import CreateEditBlogClient from "@/components/CreateEditBlogClient"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"
import { getAuthorByUserId } from "@/lib/authorService"
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server"

export default async function CreateBlogPage() {
  const access = await requireRoleOrPreviewPage(["author", "admin"])
  const author =
    access.kind === "authenticated"
      ? await getAuthorByUserId(access.session.user.id)
      : null

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
          name:
            author?.name ??
            (access.kind === "authenticated"
              ? access.session.user.name
              : "Preview Author") ??
            "Unknown Author",
          slug: author?.slug ?? null,
        }}
      />
    </section>
  )
}

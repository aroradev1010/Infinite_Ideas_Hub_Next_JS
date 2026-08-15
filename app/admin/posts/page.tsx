import AdminPostsTable from "@/components/admin/AdminPostsTable"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"
import {
  getAllBlogsForAdmin,
  getShowcaseAdminPosts,
} from "@/lib/blogService.server"
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server"

export default async function AdminPostsPage() {
  const access = await requireRoleOrPreviewPage(["admin"])
  const posts =
    access.kind === "preview"
      ? await getShowcaseAdminPosts()
      : await getAllBlogsForAdmin()

  return (
    <section>
      <DashboardPageHeader
        className="mb-8"
        eyebrow="Content"
        title="Posts"
        description="Manage publishing status across all authors."
      />
      <AdminPostsTable initialPosts={posts} />
    </section>
  )
}

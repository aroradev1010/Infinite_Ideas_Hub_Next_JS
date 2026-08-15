import AdminPostsTable from "@/components/admin/AdminPostsTable"
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader"
import { getAllBlogsForAdmin } from "@/lib/blogService.server"
import { requireRolePage } from "@/lib/requireRole"

export default async function AdminPostsPage() {
  await requireRolePage(["admin"])
  const posts = await getAllBlogsForAdmin()

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

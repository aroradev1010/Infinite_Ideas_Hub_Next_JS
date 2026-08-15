import AdminPostsTable from "@/components/admin/AdminPostsTable"
import { getAllBlogsForAdmin } from "@/lib/blogService.server"
import { requireRolePage } from "@/lib/requireRole"

export default async function AdminPostsPage() {
  await requireRolePage(["admin"])
  const posts = await getAllBlogsForAdmin()

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Manage Posts</h1>
      <AdminPostsTable initialPosts={posts} />
    </section>
  )
}

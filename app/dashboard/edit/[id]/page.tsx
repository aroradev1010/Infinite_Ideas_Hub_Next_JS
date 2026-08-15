import CreateEditBlogClient from "@/components/CreateEditBlogClient"
import { getEditableBlogForUser } from "@/lib/blogService.server"
import { requireRolePage } from "@/lib/requireRole"
import { notFound } from "next/navigation"

interface EditBlogPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await requireRolePage(["author", "admin"])
  const { id } = await params
  const blog = await getEditableBlogForUser(
    id,
    session.user.id,
    session.user.role === "admin"
  )

  if (!blog) notFound()

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-3xl font-bold">Edit Blog</h1>
        <CreateEditBlogClient
          initialBlog={blog}
          currentAuthor={{ name: blog.author, slug: blog.authorSlug }}
        />
      </div>
    </section>
  )
}

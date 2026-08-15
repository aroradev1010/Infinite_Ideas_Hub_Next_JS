import CreateEditBlogClient from "@/components/CreateEditBlogClient"
import {
  getEditableBlogForUser,
  getShowcaseEditableBlogById,
} from "@/lib/blogService.server"
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server"
import { notFound } from "next/navigation"

interface EditBlogPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const access = await requireRoleOrPreviewPage(["author", "admin"])
  const { id } = await params
  const blog =
    access.kind === "preview"
      ? await getShowcaseEditableBlogById(id)
      : await getEditableBlogForUser(
          id,
          access.session.user.id,
          access.session.user.role === "admin"
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

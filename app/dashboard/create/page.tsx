import CreateEditBlogClient from "@/components/CreateEditBlogClient"
import { getAuthorByUserId } from "@/lib/authorService"
import { requireRolePage } from "@/lib/requireRole"

export default async function CreateBlogPage() {
  const session = await requireRolePage(["author", "admin"])
  const author = await getAuthorByUserId(session.user.id)

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-3xl font-bold">Create New Blog</h1>
        <CreateEditBlogClient
          initialBlog={null}
          currentAuthor={{
            name: author?.name ?? session.user.name ?? "Unknown Author",
            slug: author?.slug ?? null,
          }}
        />
      </div>
    </section>
  )
}

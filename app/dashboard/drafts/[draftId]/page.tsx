import CreateEditBlogClient from "@/components/CreateEditBlogClient"
import { getEditableBlogForUser } from "@/lib/blogService.server"
import { requireRolePage } from "@/lib/requireRole"
import { notFound } from "next/navigation"

interface EditDraftPageProps {
  params: Promise<{ draftId: string }>
}

export default async function EditDraftPage({ params }: EditDraftPageProps) {
  const session = await requireRolePage(["author", "admin"])
  const { draftId } = await params
  const draft = await getEditableBlogForUser(
    draftId,
    session.user.id,
    session.user.role === "admin"
  )

  if (!draft || draft.status !== "draft") notFound()

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-3xl font-bold">Edit Draft</h1>
        <CreateEditBlogClient
          initialBlog={draft}
          currentAuthor={{ name: draft.author, slug: draft.authorSlug }}
        />
      </div>
    </section>
  )
}

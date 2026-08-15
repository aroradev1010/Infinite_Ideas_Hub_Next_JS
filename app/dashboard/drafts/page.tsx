import DraftsList from "@/components/DraftList"
import { getDraftsForUser } from "@/lib/blogService.server"
import { requireRolePage } from "@/lib/requireRole"

export default async function DashboardDraftsPage() {
  const session = await requireRolePage(["author", "admin"])
  const drafts = await getDraftsForUser(session.user.id)

  return (
    <section className="py-10">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="mb-6 text-2xl font-bold">Your Drafts</h1>
        <DraftsList initialDrafts={drafts} />
      </div>
    </section>
  )
}

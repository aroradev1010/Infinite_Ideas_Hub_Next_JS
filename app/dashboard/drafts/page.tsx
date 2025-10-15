// app/dashboard/drafts/page.tsx
import { requireRole } from "@/lib/requireRole";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import DraftsList from "@/components/DraftList";

export default async function DashboardDraftsPage() {
    // ensure the user is an author/admin (returns session)
    await requireRole(["author", "admin"]);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // fetch drafts for the current user
    // requireRole already returned the session, but to avoid a second call we keep requireRole above
    // (if you want session.user.id here, call requireRole and capture session)
    // Simpler: call getServerSession or requireRole again to get user id:
    const session = await requireRole(["author", "admin"]);
    const userId = session.user?.id;

    const drafts = await db
        .collection("drafts")
        .find({ userId: new ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .project({ title: 1, description: 1, blogId: 1, updatedAt: 1 })
        .toArray();

    const rows = drafts.map((d: any) => ({
        id: d._id.toString(),
        title: d.title || "Untitled draft",
        snippet: (d.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
        blogId: d.blogId ? d.blogId.toString() : null,
        updatedAt: d.updatedAt?.toISOString?.() || null,
    }));

    return (
        <section className="py-10">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Your Drafts</h1>
                <DraftsList initialDrafts={rows} />
            </div>
        </section>
    );
}

// app/dashboard/drafts/[draftId]/page.tsx
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/requireRole";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import DraftEditorClient from "@/components/DraftEditorClient";

interface Props {
    params: { draftId: string };
}

export default async function EditDraftPage({ params }: Props) {
    const session = await requireRole(["author", "admin"]);
    const userId = session.user?.id;
    const { draftId } = params;

    if (!ObjectId.isValid(draftId)) return notFound();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const draft = await db.collection("drafts").findOne({
        _id: new ObjectId(draftId),
        userId: new ObjectId(userId),
    });

    if (!draft) return notFound();

    const payload = {
        draftId: draft._id.toString(),
        blogId: draft.blogId ? draft.blogId.toString() : null,
        title: draft.title || "",
        description: draft.description || "",
        image: draft.image || "",
        category: draft.category || "",
        status: draft.status || "draft",
    };

    return (
        <section className="py-10">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Edit Draft</h1>
                {/* DraftEditorClient is a client component that handles save/publish/delete */}
                {/* initialDraft prop contains draftId + blogId if linked */}
                <DraftEditorClient initialDraft={payload} />
            </div>
        </section>
    );
}

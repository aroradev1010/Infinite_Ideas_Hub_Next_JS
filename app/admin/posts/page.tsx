// app/admin/posts/page.tsx
import clientPromise from "@/lib/mongodb";
import AdminPostsTable from "@/components/admin/AdminPostsTable";
import { requireRole } from "@/lib/requireRole";

export default async function AdminPostsPage() {
    await requireRole(["admin"]);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const posts = await db
        .collection("blogs")
        .find({})
        .sort({ createdAt: -1 })
        .project({
            title: 1,
            slug: 1,
            author: 1,
            category: 1,
            status: 1,
            createdAt: 1,
        })
        .toArray();

    const payload = posts.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        author: p.author,
        category: p.category,
        status: p.status || "published",
        createdAt: p.createdAt?.toISOString?.() || "",
    }));

    return (
        <section>
            <h1 className="text-2xl font-bold mb-6">Manage Posts</h1>
            <AdminPostsTable initialPosts={payload} />
        </section>
    );
}


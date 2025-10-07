// app/admin/authors/page.tsx

import AdminAuthorsTable from "@/components/admin/AdminAuthorstable";
import { isAdmin } from "@/lib/isAdmin";
import clientPromise from "@/lib/mongodb";

export default async function AdminAuthorsPage() {
    const admin = await isAdmin();
    if (!admin) return null;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const authors = await db
        .collection("authors")
        .find({})
        .sort({ createdAt: -1 })
        .project({ name: 1, bio: 1, profileImage: 1, slug: 1, createdAt: 1 })
        .toArray();

    const payload = authors.map((a: any) => ({
        id: a._id.toString(),
        name: a.name,
        bio: a.bio,
        profileImage: a.profileImage,
        slug: a.slug,
        createdAt: a.createdAt?.toISOString?.() || "",
    }));

    return (
        <section>
            <h1 className="text-2xl font-bold mb-6">Manage Authors</h1>
            <AdminAuthorsTable initialAuthors={payload} />
        </section>
    );
}

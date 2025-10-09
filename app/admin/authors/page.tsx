// app/admin/authors/page.tsx

import AdminAuthorsTable from "@/components/admin/AdminAuthorstable";
import { getAllAuthorsForAdmin } from "@/lib/authorService";
import { requireRole } from "@/lib/requireRole";

export default async function AdminAuthorsPage() {
    await requireRole(["admin"]);
    const authors = await getAllAuthorsForAdmin()
   

    const payload = authors.map((a: any) => ({
        id: a.id,
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

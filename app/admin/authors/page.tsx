// app/admin/authors/page.tsx

import AdminAuthorsTable from "@/components/admin/AdminAuthorstable";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { getAllAuthorsForAdmin } from "@/lib/authorService";
import { requireRolePage } from "@/lib/requireRole";

export default async function AdminAuthorsPage() {
    await requireRolePage(["admin"]);
    const authors = await getAllAuthorsForAdmin()
   

    const payload = authors.map((a) => ({
        id: a.id,
        name: a.name,
        bio: a.bio,
        profileImage: a.profileImage,
        slug: a.slug,
        createdAt: a.createdAt || "",
    }));

    return (
        <section>
            <DashboardPageHeader
                className="mb-8"
                eyebrow="People"
                title="Authors"
                description="Manage author profiles and publishing identities."
            />
            <AdminAuthorsTable initialAuthors={payload} />
        </section>
    );
}

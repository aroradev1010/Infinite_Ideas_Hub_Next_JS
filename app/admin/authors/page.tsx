// app/admin/authors/page.tsx

import AdminAuthorsTable from "@/components/admin/AdminAuthorstable";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import {
  getAllAuthorsForAdmin,
  getAllAuthorsForShowcase,
} from "@/lib/authorService";
import { requireRoleOrPreviewPage } from "@/lib/previewAccess.server";

export default async function AdminAuthorsPage() {
  const access = await requireRoleOrPreviewPage(["admin"]);
  const authors =
    access.kind === "preview"
      ? await getAllAuthorsForShowcase()
      : await getAllAuthorsForAdmin();

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

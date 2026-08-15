// app/admin/users/page.tsx
import { getAllUsersForAdmin } from "@/lib/userService";
import { requireRolePage } from "@/lib/requireRole";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";


export default async function AdminUsersPage() {
    await requireRolePage(["admin"]);

    const users = await getAllUsersForAdmin();

    const payload = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        image: u.image,
        createdAt: u.createdAt,
    }));

    return (
        <section>
            <DashboardPageHeader
                className="mb-8"
                eyebrow="Access"
                title="Users"
                description="Manage user access and author promotion."
            />
            <AdminUsersTable initialUsers={payload} />
        </section>
    );
}

// app/admin/users/page.tsx
import { getAllUsersForAdmin } from "@/lib/userService";
import { requireRolePage } from "@/lib/requireRole";
import AdminUsersTable from "@/components/admin/AdminUsersTable";


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
            <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
            <AdminUsersTable initialUsers={payload} />
        </section>
    );
}
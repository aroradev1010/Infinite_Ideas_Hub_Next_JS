import { isAdmin } from "@/lib/isAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const admin = await isAdmin();

    if (!admin) {
        return (
            <section>
                <h1 className="text-3xl font-semibold text-red-600">Access Denied</h1>
                <p className="text-gray-500 mt-2">
                    You do not have permission to access this page.
                </p>
            </section>

        );
    }

    return (
        <section>

            <aside className="w-64 bg-black text-white p-4">
                <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
                <ul className="space-y-3">
                    <li><a href="/admin">Dashboard</a></li>
                    <li><a href="/admin/posts">Manage Posts</a></li>
                    <li><a href="/admin/authors">Manage Authors</a></li>
                    <li><a href="/admin/categories">Manage Categories</a></li>
                </ul>
            </aside>
            <main className="flex-1  p-8">{children}</main>
        </section>

    );
}

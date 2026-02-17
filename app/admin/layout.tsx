// app/admin/layout.tsx
import { requireRolePage } from "@/lib/requireRole";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // FIX: use requireRolePage — redirects cleanly instead of throwing NextResponse
    await requireRolePage(["admin"]);

    return (
        <div className="min-h-screen flex bg-black text-white">
            <aside className="w-64 border-r border-gray-800 p-6">
                <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
                <ul className="space-y-3">
                    <li><a href="/admin" className="hover:text-green-400 transition-colors">Dashboard</a></li>
                    <li><a href="/admin/posts" className="hover:text-green-400 transition-colors">Manage Posts</a></li>
                    <li><a href="/admin/authors" className="hover:text-green-400 transition-colors">Manage Authors</a></li>
                    <li><a href="/admin/users" className="hover:text-green-400 transition-colors">Manage Users</a></li>
                </ul>
            </aside>
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}
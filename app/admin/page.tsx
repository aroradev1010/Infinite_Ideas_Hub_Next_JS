import { requireRole } from "@/lib/requireRole";

export default async function AdminPage() {
    await requireRole(["admin"]);

    return (
        <section>
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">
                Welcome to the Infinite Ideas Hub Admin Panel.
            </p>

            <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-3">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold text-lg">Posts</h2>
                    <p className="text-gray-500">Manage all blogs and approvals.</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold text-lg">Authors</h2>
                    <p className="text-gray-500">View and update author profiles.</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold text-lg">Categories</h2>
                    <p className="text-gray-500">Add or remove blog categories.</p>
                </div>
            </div>
        </section>
    );
}

// app/dashboard/create/page.tsx
import { requireRole } from "@/lib/requireRole";
import CreateEditBlogClient from "@/components/CreateEditBlogClient";

export default async function CreateBlogPage() {
    // Only authors and admins
    await requireRole(["author", "admin"]);

    return (
        <section className="py-10">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Create New Blog</h1>
                {/* client component handles the rest */}
                
                <CreateEditBlogClient initialBlog={null} />
            </div>
        </section>
    );
}

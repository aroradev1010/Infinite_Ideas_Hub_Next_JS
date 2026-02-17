// app/dashboard/page.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBlogsByAuthorId } from "@/lib/blogService.server";
import { requireRole } from "@/lib/requireRole";
import { getAuthorByUserId } from "@/lib/authorService";
import DashboardBlogsTable from "@/components/dashboard/DashboardBlogsTable";

export default async function DashboardPage() {
    const session = await requireRole(["author", "admin"]);
    const userId = session.user.id as string;
    const author = await getAuthorByUserId(userId);

    if (!author) {
        return (
            <section className="space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Blogs</h1>
                </header>
                <p className="text-gray-400 mt-10 text-lg">
                    You are not an author yet. Ask an admin to promote you or create an author profile.
                </p>
            </section>
        );
    }

    const blogs = await getBlogsByAuthorId(author.id);

    // Serialise only the fields the table needs (keeps the RSC → Client boundary clean)
    const rows = blogs.map((b) => ({
        id: b.id,
        title: b.title,
        category: b.category ?? "",
        status: b.status,
        likes: b.likes,
        createdAt: b.createdAt,
        slug: b.slug,
    }));

    return (
        <section className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My Blogs</h1>
                <Link
                    href="/dashboard/create"
                    className={cn(
                        "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                    )}
                >
                    + New Blog
                </Link>
            </header>

            <DashboardBlogsTable initialBlogs={rows} />
        </section>
    );
}
// app/dashboard/page.tsx
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { getBlogsByAuthorId } from "@/lib/blogService.server";
import { requireRole } from "@/lib/requireRole";
import { getAuthorByUserId } from "@/lib/authorService";

export default async function DashboardPage() {
    const session = await requireRole(["author", "admin"]); // will throw Response if not allowed

    // find the author document for this user
    const userId = session.user.id as string;
    const author = await getAuthorByUserId(userId);

    if (!author) {
        // no author record for this user -> either redirect to "apply to be author" or show message
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

    // use author.id which is the authors._id
    const blogs = await getBlogsByAuthorId(author.id);


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

            {/* If no blogs exist */}
            {blogs.length === 0 && (
                <p className="text-gray-400 mt-10 text-lg">
                    You haven’t written any blogs yet.{" "}
                    <Link href="/dashboard/create" className="text-green-400 underline">
                        Create one now.
                    </Link>
                </p>
            )}

            {/* Blogs table */}
            {blogs.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-800">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-300">
                            <tr>
                                <th className="p-3">Title</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Likes</th>
                                <th className="p-3">Created</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog: any) => (

                                <tr key={blog.id.toString()} className="border-t border-gray-800">
                                    <td className="p-3 font-semibold text-white">{blog.title}</td>
                                    <td className="p-3 text-gray-400">{blog.category || "—"}</td>
                                    <td className="p-3">
                                        <span
                                            className={cn(
                                                "px-2 py-1 rounded text-xs font-medium",
                                                blog.status === "published"
                                                    ? "bg-green-700 text-green-100"
                                                    : "bg-yellow-700 text-yellow-100"
                                            )}
                                        >
                                            {blog.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-400">{blog.likes || 0}</td>
                                    <td className="p-3 text-gray-400">{formatDate(blog.createdAt)}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <Link
                                            href={`/dashboard/edit/${blog.id}`}
                                            className="text-blue-400 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={`/blog/${blog.slug}`}
                                            className="text-gray-400 hover:underline"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

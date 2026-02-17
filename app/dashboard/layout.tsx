// app/dashboard/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { requireRolePage } from "@/lib/requireRole";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    // FIX: use requireRolePage (uses redirect()) instead of requireRole (throws NextResponse)
    // This also removes the duplicate getServerSession call that was here before.
    const session = await requireRolePage(["admin", "author"]);

    return (
        <div className="min-h-screen flex bg-black text-white">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-gray-800 p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-6">Author Dashboard</h2>
                    <nav className="space-y-4">
                        <Link
                            href="/dashboard"
                            className={cn("block hover:text-green-400 transition-colors duration-200")}
                        >
                            📝 My Blogs
                        </Link>
                        <Link
                            href="/dashboard/drafts"
                            className={cn("block hover:text-green-400 transition-colors duration-200")}
                        >
                            📄 My Drafts
                        </Link>
                        <Link
                            href="/dashboard/create"
                            className={cn("block hover:text-green-400 transition-colors duration-200")}
                        >
                            ➕ Create Blog
                        </Link>
                    </nav>
                </div>

                <div className="text-sm text-gray-500">
                    Signed in as{" "}
                    <span className="text-gray-300 font-semibold">
                        {session.user?.name || "Unknown"}
                    </span>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10">{children}</main>
        </div>
    );
}
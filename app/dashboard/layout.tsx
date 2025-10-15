// app/dashboard/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { requireRole } from "@/lib/requireRole";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    // Fetch session
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session) {
        redirect("/auth/sign-in");
    }

    // Check role
    await requireRole(["admin", "author"]);

    return (
        <div className="min-h-screen flex bg-black text-white">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-gray-800 p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-6">Author Dashboard</h2>
                    <nav className="space-y-4">
                        <Link
                            href="/dashboard"
                            className={cn(
                                "block hover:text-green-400 transition-colors duration-200"
                            )}
                        >
                            📝 My Blogs
                        </Link>
                        <Link
                            href="/dashboard/drafts"
                            className={cn(
                                "block hover:text-green-400 transition-colors duration-200"
                            )}
                        >
                            📝 My Drafts
                        </Link>
                        <Link
                            href="/dashboard/create"
                            className={cn(
                                "block hover:text-green-400 transition-colors duration-200"
                            )}
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

// components/DashboardBlogsTable.tsx
"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { deleteBlog } from "@/lib/blogService.client";
import type { Blog } from "@/types/blogType";

type BlogRow = Pick<Blog, "id" | "title" | "category" | "status" | "likes" | "createdAt" | "slug">;

export default function DashboardBlogsTable({ initialBlogs }: { initialBlogs: BlogRow[] }) {
    const [blogs, setBlogs] = useState<BlogRow[]>(initialBlogs);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleDelete = useCallback(async (blogId: string, blogTitle: string) => {
        if (!window.confirm(`Delete "${blogTitle}"? This cannot be undone.`)) return;

        setDeleting(blogId);
        try {
            const res = await deleteBlog(blogId);
            if (!res.ok) throw new Error(res.error || "Delete failed");

            setBlogs((prev) => prev.filter((b) => b.id !== blogId));
            toast.success(`"${blogTitle}" deleted.`);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete blog.");
        } finally {
            setDeleting(null);
        }
    }, []);

    if (blogs.length === 0) {
        return (
            <p className="text-gray-400 mt-10 text-lg">
                You haven&apos;t written any blogs yet.{" "}
                <Link href="/dashboard/create" className="text-green-400 underline">
                    Create one now.
                </Link>
            </p>
        );
    }

    return (
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
                    {blogs.map((blog) => (
                        <tr key={blog.id} className="border-t border-gray-800">
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
                            <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-3">
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
                                    <button
                                        onClick={() => handleDelete(blog.id, blog.title)}
                                        disabled={deleting === blog.id}
                                        className="text-red-400 hover:text-red-300 hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {deleting === blog.id ? "Deleting…" : "Delete"}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
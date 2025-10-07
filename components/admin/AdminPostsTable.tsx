"use client";
import React, { useState } from "react";

type PostRow = {
  id: string;
  title: string;
  author?: string;
  category?: string;
  status?: string;
  createdAt?: string;
};

export default function AdminPostsTable({ initialPosts }: { initialPosts: PostRow[] }) {
  const [posts, setPosts] = useState<PostRow[]>(initialPosts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(id: string, action: "publish" | "unpublish" | "delete") {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      if (action === "delete") {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: data.status || (action === "publish" ? "published" : "draft") } : p
          )
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to perform action");
    } finally {
      setLoadingId(null);
    }
  }

  if (posts.length === 0) {
    return <div className="p-6 bg-white rounded shadow">No posts found.</div>;
  }

  return (
    <div className="overflow-x-auto bg-black rounded shadow">
      <table className="min-w-full text-left">
        <thead className="bg-black text-gray-400">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Author</th>
            <th className="p-3">Category</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created At</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.title}</td>
              <td className="p-3">{p.author}</td>
              <td className="p-3">{p.category}</td>
              <td className="p-3 capitalize">{p.status}</td>
              <td className="p-3">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</td>
              <td className="p-3 space-x-2">
                {p.status !== "published" ? (
                  <button
                    onClick={() => handleAction(p.id, "publish")}
                    disabled={loadingId === p.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    {loadingId === p.id ? "..." : "Publish"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(p.id, "unpublish")}
                    disabled={loadingId === p.id}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                  >
                    {loadingId === p.id ? "..." : "Unpublish"}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!confirm("Delete this post permanently?")) return;
                    handleAction(p.id, "delete");
                  }}
                  disabled={loadingId === p.id}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  {loadingId === p.id ? "..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

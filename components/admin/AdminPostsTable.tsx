"use client"

import { useState } from "react"

import type {
  AdminPostSummary,
  BlogStatus,
} from "@/types/blogType"

interface AdminPostsTableProps {
  initialPosts: AdminPostSummary[]
}

interface AdminActionResponse {
  ok?: boolean
  error?: string
  data?: {
    id: string
    status?: BlogStatus
  }
}

export default function AdminPostsTable({
  initialPosts,
}: AdminPostsTableProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleAction(
    id: string,
    action: "publish" | "unpublish" | "delete"
  ) {
    setLoadingId(id)
    try {
      const response = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      const result = (await response.json()) as AdminActionResponse
      if (!response.ok) {
        throw new Error(result.error || "Action failed")
      }

      if (action === "delete") {
        setPosts((current) => current.filter((post) => post.id !== id))
        return
      }

      const status =
        result.data?.status ??
        (action === "publish" ? "published" : "draft")
      setPosts((current) =>
        current.map((post) =>
          post.id === id ? { ...post, status } : post
        )
      )
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to perform action"
      )
    } finally {
      setLoadingId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded bg-white p-6 shadow">No posts found.</div>
    )
  }

  return (
    <div className="overflow-x-auto rounded bg-black shadow">
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
          {posts.map((post) => (
            <tr key={post.id} className="border-t">
              <td className="p-3">{post.title}</td>
              <td className="p-3">{post.author}</td>
              <td className="p-3">{post.category}</td>
              <td className="p-3 capitalize">{post.status}</td>
              <td className="p-3">
                {new Date(post.createdAt).toLocaleString()}
              </td>
              <td className="space-x-2 p-3">
                {post.status !== "published" ? (
                  <button
                    type="button"
                    onClick={() => handleAction(post.id, "publish")}
                    disabled={loadingId === post.id}
                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                  >
                    {loadingId === post.id ? "..." : "Publish"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAction(post.id, "unpublish")}
                    disabled={loadingId === post.id}
                    className="rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
                  >
                    {loadingId === post.id ? "..." : "Unpublish"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm("Delete this post permanently?")) return
                    void handleAction(post.id, "delete")
                  }}
                  disabled={loadingId === post.id}
                  className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  {loadingId === post.id ? "..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

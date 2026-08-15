"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  FilePenLine,
  LoaderCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import {
  DashboardPostCell,
  DashboardPostDeleteDialog,
  DashboardPostFilters,
  type DashboardPostStatusFilter,
  DashboardStatusBadge,
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/DashboardTable"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import type { AdminPostSummary, BlogStatus } from "@/types/blogType"

interface AdminPostsTableProps {
  initialPosts: AdminPostSummary[]
  variant?: "all" | "recent"
}

interface AdminActionResponse {
  ok?: boolean
  error?: string
  data?: {
    id: string
    status?: BlogStatus
  }
}

function AdminPostActions({
  loading,
  onDelete,
  onStatusChange,
  post,
}: {
  loading: boolean
  onDelete: (post: AdminPostSummary) => void
  onStatusChange: (post: AdminPostSummary) => void
  post: AdminPostSummary
}) {
  const isPublished = post.status === "published"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          aria-label={`Open actions for ${post.title}`}
          className="size-8 text-gray-400 hover:bg-white/[0.06] hover:text-white data-[state=open]:bg-white/[0.06]"
        >
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <MoreHorizontal className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-white/10 bg-[#11161d] text-gray-200"
      >
        <DropdownMenuItem onSelect={() => onStatusChange(post)}>
          {isPublished ? (
            <FilePenLine aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
          {isPublished ? "Move to draft" : "Publish post"}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
          onSelect={() => onDelete(post)}
        >
          <Trash2 aria-hidden="true" />
          Delete post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AdminPostsTable({
  initialPosts,
  variant = "all",
}: AdminPostsTableProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [query, setQuery] = useState("")
  const [status, setStatus] =
    useState<DashboardPostStatusFilter>("all")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] =
    useState<AdminPostSummary | null>(null)
  const router = useRouter()

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return posts.filter((post) => {
      const matchesStatus = status === "all" || post.status === status
      const matchesQuery =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.category.toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [posts, query, status])

  async function handleAction(
    post: AdminPostSummary,
    action: "publish" | "unpublish" | "delete"
  ) {
    setLoadingId(post.id)

    try {
      const response = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, action }),
      })
      const result = (await response.json()) as AdminActionResponse
      if (!response.ok) {
        throw new Error(result.error || "Action failed")
      }

      if (action === "delete") {
        setPosts((current) =>
          current.filter((item) => item.id !== post.id)
        )
        setPendingDelete(null)
        toast.success(`"${post.title}" deleted.`)
      } else {
        const nextStatus =
          result.data?.status ??
          (action === "publish" ? "published" : "draft")
        setPosts((current) =>
          current.map((item) =>
            item.id === post.id ? { ...item, status: nextStatus } : item
          )
        )
        toast.success(
          action === "publish" ? "Post published." : "Post moved to drafts."
        )
      }

      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to perform action."
      )
    } finally {
      setLoadingId(null)
    }
  }

  const hasFilters = query.trim().length > 0 || status !== "all"
  const columns: DashboardTableColumn<AdminPostSummary>[] = [
    {
      key: "post",
      label: "Post",
      headerClassName: "w-[38%]",
      render: (post) => (
        <DashboardPostCell title={post.title} category={post.category} />
      ),
    },
    {
      key: "author",
      label: "Author",
      headerClassName: "w-[20%]",
      cellClassName: "truncate font-semibold text-gray-400",
      render: (post) => post.author || "Unknown author",
    },
    {
      key: "status",
      label: "Status",
      headerClassName: "w-[14%]",
      render: (post) => <DashboardStatusBadge status={post.status} />,
    },
    {
      key: "updated",
      label: "Updated",
      headerClassName: "w-[20%]",
      cellClassName: "font-semibold text-gray-500",
      render: (post) => (
        <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "w-[8%] text-right",
      cellClassName: "text-right",
      screenReaderLabel: true,
      render: (post) => (
        <AdminPostActions
          post={post}
          loading={loadingId === post.id}
          onStatusChange={(selectedPost) =>
            void handleAction(
              selectedPost,
              selectedPost.status === "published" ? "unpublish" : "publish"
            )
          }
          onDelete={setPendingDelete}
        />
      ),
    },
  ]

  return (
    <>
      {variant === "all" && posts.length > 0 && (
        <DashboardPostFilters
          count={filteredPosts.length}
          query={query}
          status={status}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
        />
      )}

      {filteredPosts.length === 0 ? (
        <Card className="items-center border-dashed border-white/10 bg-card/20 px-6 py-14 text-center shadow-none">
          <span className="mb-4 flex size-11 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300">
            <FilePenLine className="size-5" aria-hidden="true" />
          </span>
          <h3 className="font-extrabold text-white">
            {hasFilters ? "No matching posts" : "No posts found"}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            {hasFilters
              ? "Try a different search term or status filter."
              : "Posts will appear here after an author creates one."}
          </p>
          {hasFilters && (
            <Button
              variant="outline"
              className="mt-5 border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
              onClick={() => {
                setQuery("")
                setStatus("all")
              }}
            >
              Clear filters
            </Button>
          )}
        </Card>
      ) : (
        <DashboardTable
          rows={filteredPosts}
          columns={columns}
          getRowId={(post) => post.id}
          renderMobileRow={(post) => (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DashboardPostCell
                    title={post.title}
                    category={post.category}
                    mobile
                  />
                </div>
                <AdminPostActions
                  post={post}
                  loading={loadingId === post.id}
                  onStatusChange={(selectedPost) =>
                    void handleAction(
                      selectedPost,
                      selectedPost.status === "published"
                        ? "unpublish"
                        : "publish"
                    )
                  }
                  onDelete={setPendingDelete}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-xs font-semibold text-gray-500">
                  {post.author || "Unknown author"}
                </span>
                <DashboardStatusBadge status={post.status} />
                <time
                  dateTime={post.updatedAt}
                  className="text-xs font-semibold text-gray-600"
                >
                  Updated {formatDate(post.updatedAt)}
                </time>
              </div>
            </>
          )}
        />
      )}

      <DashboardPostDeleteDialog
        open={pendingDelete !== null}
        postTitle={pendingDelete?.title}
        loading={Boolean(loadingId)}
        onOpenChange={(open) => {
          if (!open && !loadingId) setPendingDelete(null)
        }}
        onConfirm={() => {
          if (pendingDelete) {
            void handleAction(pendingDelete, "delete")
          }
        }}
      />
    </>
  )
}

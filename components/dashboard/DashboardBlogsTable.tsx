"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ExternalLink,
  FilePenLine,
  Heart,
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
import { usePreviewMode } from "@/components/preview/PreviewModeProvider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteBlog } from "@/lib/blogService.client"
import { formatDate } from "@/lib/utils"
import type { DashboardPostSummary } from "@/types/blogType"

interface DashboardBlogsTableProps {
  initialPosts: DashboardPostSummary[]
  variant?: "all" | "recent"
}

function getEditHref(post: DashboardPostSummary) {
  return post.status === "draft"
    ? `/dashboard/drafts/${post.id}`
    : `/dashboard/edit/${post.id}`
}

function PostActions({
  deleting,
  onDelete,
  post,
}: {
  deleting: boolean
  onDelete: (post: DashboardPostSummary) => void
  post: DashboardPostSummary
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={deleting}
          aria-label={`Open actions for ${post.title}`}
          className="size-8 text-gray-400 hover:bg-white/[0.06] hover:text-white data-[state=open]:bg-white/[0.06]"
        >
          {deleting ? (
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
        <DropdownMenuItem asChild>
          <Link href={getEditHref(post)}>
            <FilePenLine aria-hidden="true" />
            Edit post
          </Link>
        </DropdownMenuItem>
        {post.status === "published" && post.slug && (
          <DropdownMenuItem asChild>
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink aria-hidden="true" />
              View post
            </Link>
          </DropdownMenuItem>
        )}
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

export default function DashboardBlogsTable({
  initialPosts,
  variant = "all",
}: DashboardBlogsTableProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [query, setQuery] = useState("")
  const [status, setStatus] =
    useState<DashboardPostStatusFilter>("all")
  const [pendingDelete, setPendingDelete] =
    useState<DashboardPostSummary | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { guardMutation } = usePreviewMode()

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

  const handleDelete = async () => {
    if (!pendingDelete) return
    if (guardMutation()) {
      setPendingDelete(null)
      return
    }

    const post = pendingDelete
    setDeletingId(post.id)

    try {
      const result = await deleteBlog(post.id)
      if (!result.ok) throw new Error(result.error || "Delete failed")

      setPosts((current) => current.filter((item) => item.id !== post.id))
      setPendingDelete(null)
      toast.success(`"${post.title}" deleted.`)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete post."
      )
    } finally {
      setDeletingId(null)
    }
  }

  const hasFilters = query.trim().length > 0 || status !== "all"
  const columns: DashboardTableColumn<DashboardPostSummary>[] = [
    {
      key: "post",
      label: "Post",
      headerClassName: "w-[42%]",
      render: (post) => (
        <DashboardPostCell
          title={post.title}
          category={post.category}
          href={getEditHref(post)}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      headerClassName: "w-[16%]",
      render: (post) => <DashboardStatusBadge status={post.status} />,
    },
    {
      key: "engagement",
      label: "Engagement",
      headerClassName: "w-[14%]",
      render: (post) => (
        <span className="inline-flex items-center gap-2 font-semibold text-gray-400">
          <Heart className="size-3.5 text-gray-600" aria-hidden="true" />
          {post.likes}
          <span className="sr-only">likes</span>
        </span>
      ),
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
        <PostActions
          post={post}
          deleting={deletingId === post.id}
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
            {hasFilters ? "No matching posts" : "Your next idea starts here"}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            {hasFilters
              ? "Try a different search term or status filter."
              : "Create a post and save it as a draft, or publish it when it is ready."}
          </p>
          {hasFilters ? (
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
          ) : (
            <Button
              asChild
              className="mt-5 bg-cyan-400 font-extrabold text-slate-950 hover:bg-cyan-300"
            >
              <Link href="/dashboard/create">Create your first post</Link>
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
                    href={getEditHref(post)}
                    mobile
                  />
                </div>
                <PostActions
                  post={post}
                  deleting={deletingId === post.id}
                  onDelete={setPendingDelete}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <DashboardStatusBadge status={post.status} />
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Heart className="size-3.5" aria-hidden="true" />
                  {post.likes} likes
                </span>
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
        loading={Boolean(deletingId)}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null)
        }}
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}

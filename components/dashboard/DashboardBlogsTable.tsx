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
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteBlog } from "@/lib/blogService.client"
import { cn, formatDate } from "@/lib/utils"
import type {
  BlogStatus,
  DashboardPostSummary,
} from "@/types/blogType"

interface DashboardBlogsTableProps {
  initialPosts: DashboardPostSummary[]
  variant?: "all" | "recent"
}

type StatusFilter = "all" | BlogStatus

function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize",
        status === "published"
          ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
          : "border-amber-300/15 bg-amber-300/[0.07] text-amber-200"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "published" ? "bg-emerald-400" : "bg-amber-300"
        )}
        aria-hidden="true"
      />
      {status}
    </span>
  )
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
  const editHref =
    post.status === "draft"
      ? `/dashboard/drafts/${post.id}`
      : `/dashboard/edit/${post.id}`

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
          <Link href={editHref}>
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
  const [status, setStatus] = useState<StatusFilter>("all")
  const [pendingDelete, setPendingDelete] =
    useState<DashboardPostSummary | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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

  const handleDelete = async () => {
    if (!pendingDelete) return

    const post = pendingDelete
    setDeletingId(post.id)

    try {
      const result = await deleteBlog(post.id)
      if (!result.ok) throw new Error(result.error || "Delete failed")

      setPosts((current) => current.filter((item) => item.id !== post.id))
      setPendingDelete(null)
      toast.success(`“${post.title}” deleted.`)
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

  return (
    <>
      {variant === "all" && posts.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts or categories"
              aria-label="Search posts"
              className="h-10 border-white/10 bg-white/[0.03] pl-9 text-white placeholder:text-gray-600 focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20"
            />
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-xs font-semibold text-gray-500" aria-live="polite">
              {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
            </p>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StatusFilter)}
            >
              <SelectTrigger
                aria-label="Filter posts by status"
                className="h-10 w-[142px] border-white/10 bg-white/[0.03] text-gray-300 focus:ring-cyan-400/20"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#11161d] text-gray-200">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
        <Card className="overflow-hidden border-white/[0.08] bg-card/20 shadow-none">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] table-fixed text-left text-sm">
              <thead className="border-b border-white/[0.08] bg-white/[0.025] text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                <tr>
                  <th scope="col" className="w-[42%] px-5 py-3.5">
                    Post
                  </th>
                  <th scope="col" className="w-[16%] px-5 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="w-[14%] px-5 py-3.5">
                    Engagement
                  </th>
                  <th scope="col" className="w-[20%] px-5 py-3.5">
                    Updated
                  </th>
                  <th scope="col" className="w-[8%] px-5 py-3.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="group transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={
                          post.status === "draft"
                            ? `/dashboard/drafts/${post.id}`
                            : `/dashboard/edit/${post.id}`
                        }
                        className="block truncate font-extrabold text-gray-100 transition-colors hover:text-cyan-300 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 truncate text-xs font-semibold text-gray-600">
                        {post.category || "Uncategorized"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 font-semibold text-gray-400">
                        <Heart className="size-3.5 text-gray-600" aria-hidden="true" />
                        {post.likes}
                        <span className="sr-only">likes</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-500">
                      <time dateTime={post.updatedAt}>
                        {formatDate(post.updatedAt)}
                      </time>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <PostActions
                        post={post}
                        deleting={deletingId === post.id}
                        onDelete={setPendingDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-white/[0.07] md:hidden">
            {filteredPosts.map((post) => (
              <li key={post.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={
                        post.status === "draft"
                          ? `/dashboard/drafts/${post.id}`
                          : `/dashboard/edit/${post.id}`
                      }
                      className="line-clamp-2 font-extrabold leading-5 text-gray-100 hover:text-cyan-300 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-xs font-semibold text-gray-600">
                      {post.category || "Uncategorized"}
                    </p>
                  </div>
                  <PostActions
                    post={post}
                    deleting={deletingId === post.id}
                    onDelete={setPendingDelete}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <StatusBadge status={post.status} />
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
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null)
        }}
      >
        <DialogContent className="border-white/10 bg-[#11161d] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
            <DialogDescription className="leading-6 text-gray-400">
              “{pendingDelete?.title}” will be permanently removed. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={Boolean(deletingId)}
                className="border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={Boolean(deletingId)}
              onClick={() => void handleDelete()}
            >
              {deletingId && <LoaderCircle className="animate-spin" />}
              {deletingId ? "Deleting..." : "Delete post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

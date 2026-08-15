"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { LoaderCircle, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import {
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/DashboardTable"
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
import { formatDate } from "@/lib/utils"

type AuthorRow = {
  id: string
  name?: string
  bio?: string
  profileImage?: string
  slug?: string
  createdAt?: string
}

type AuthorForm = {
  name: string
  bio: string
  profileImage: string
  slug: string
}

interface AdminActionResponse {
  author?: AuthorRow
  error?: string
}

const emptyForm: AuthorForm = {
  name: "",
  bio: "",
  profileImage: "",
  slug: "",
}

function AuthorIdentity({ author }: { author: AuthorRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src={author.profileImage || "/fallback.avif"}
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-white/10"
      />
      <p className="truncate font-extrabold text-gray-100">
        {author.name || "Unnamed author"}
      </p>
    </div>
  )
}

function AuthorActions({
  loading,
  onDelete,
  onEdit,
  author,
}: {
  loading: boolean
  onDelete: (author: AuthorRow) => void
  onEdit: (author: AuthorRow) => void
  author: AuthorRow
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          aria-label={`Open actions for ${author.name || "author"}`}
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
        <DropdownMenuItem onSelect={() => onEdit(author)}>
          <Pencil aria-hidden="true" />
          Edit author
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
          onSelect={() => onDelete(author)}
        >
          <Trash2 aria-hidden="true" />
          Delete author
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AdminAuthorsTable({
  initialAuthors,
}: {
  initialAuthors: AuthorRow[]
}) {
  const [authors, setAuthors] = useState<AuthorRow[]>(initialAuthors || [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AuthorForm>(emptyForm)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AuthorRow | null>(null)

  const startEdit = useCallback((author: AuthorRow) => {
    setEditingId(author.id)
    setForm({
      name: author.name || "",
      bio: author.bio || "",
      profileImage: author.profileImage || "",
      slug: author.slug || "",
    })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setForm(emptyForm)
  }, [])

  const saveEdit = useCallback(
    async (id: string) => {
      setLoadingId(id)
      try {
        const response = await fetch("/api/admin/authors", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, updates: form }),
        })
        const result = (await response.json()) as AdminActionResponse
        if (!response.ok) throw new Error(result.error || "Save failed")

        setAuthors((current) =>
          current.map((author) =>
            author.id === id ? { ...author, ...result.author } : author
          )
        )
        cancelEdit()
        toast.success("Author updated successfully.")
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update author."
        )
      } finally {
        setLoadingId(null)
      }
    },
    [cancelEdit, form]
  )

  const deleteAuthor = useCallback(async () => {
    if (!pendingDelete) return

    const author = pendingDelete
    setLoadingId(author.id)
    try {
      const response = await fetch(
        `/api/admin/authors?id=${encodeURIComponent(author.id)}`,
        { method: "DELETE" }
      )
      const result = (await response.json()) as AdminActionResponse
      if (!response.ok) throw new Error(result.error || "Delete failed")

      setAuthors((current) => current.filter((item) => item.id !== author.id))
      setPendingDelete(null)
      toast.success("Author deleted successfully.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete author."
      )
    } finally {
      setLoadingId(null)
    }
  }, [pendingDelete])

  function renderEditorInput(
    field: keyof AuthorForm,
    label: string,
    placeholder: string
  ) {
    return (
      <Input
        value={form[field]}
        onChange={(event) =>
          setForm((current) => ({ ...current, [field]: event.target.value }))
        }
        aria-label={label}
        placeholder={placeholder}
        className="h-9 border-white/10 bg-white/[0.03] text-white placeholder:text-gray-600 focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20"
      />
    )
  }

  function renderEditingActions(author: AuthorRow) {
    const loading = loadingId === author.id

    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={() => void saveEdit(author.id)}
          className="bg-cyan-400 font-bold text-slate-950 hover:bg-cyan-300"
        >
          {loading && <LoaderCircle className="animate-spin" />}
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={cancelEdit}
          className="border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
        >
          Cancel
        </Button>
      </div>
    )
  }

  const columns: DashboardTableColumn<AuthorRow>[] = [
    {
      key: "name",
      label: "Name",
      headerClassName: "w-[22%]",
      render: (author) =>
        editingId === author.id
          ? renderEditorInput("name", "Author name", "Author name")
          : <AuthorIdentity author={author} />,
    },
    {
      key: "bio",
      label: "Bio",
      headerClassName: "w-[28%]",
      cellClassName: "text-gray-400",
      render: (author) =>
        editingId === author.id
          ? renderEditorInput("bio", "Author biography", "Biography")
          : author.bio || "—",
    },
    {
      key: "slug",
      label: "Slug",
      headerClassName: "w-[18%]",
      cellClassName: "truncate font-semibold text-gray-400",
      render: (author) =>
        editingId === author.id
          ? renderEditorInput("slug", "Author slug", "author-slug")
          : author.slug || "—",
    },
    {
      key: "created",
      label: "Created",
      headerClassName: "w-[18%]",
      cellClassName: "font-semibold text-gray-500",
      render: (author) =>
        author.createdAt ? (
          <time dateTime={author.createdAt}>{formatDate(author.createdAt)}</time>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "w-[14%] text-right",
      cellClassName: "text-right",
      screenReaderLabel: true,
      render: (author) =>
        editingId === author.id ? (
          renderEditingActions(author)
        ) : (
          <AuthorActions
            author={author}
            loading={loadingId === author.id}
            onEdit={startEdit}
            onDelete={setPendingDelete}
          />
        ),
    },
  ]

  if (authors.length === 0) {
    return (
      <Card className="items-center border-dashed border-white/10 bg-card/20 px-6 py-14 text-center shadow-none">
        <span className="mb-4 flex size-11 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300">
          <Users className="size-5" aria-hidden="true" />
        </span>
        <h3 className="font-extrabold text-white">No authors found</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          Promoted authors will appear here.
        </p>
      </Card>
    )
  }

  return (
    <>
      <DashboardTable
        rows={authors}
        columns={columns}
        getRowId={(author) => author.id}
        renderMobileRow={(author) =>
          editingId === author.id ? (
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-gray-500">
                  Name
                </span>
                {renderEditorInput("name", "Author name", "Author name")}
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-gray-500">
                  Bio
                </span>
                {renderEditorInput("bio", "Author biography", "Biography")}
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-gray-500">
                  Slug
                </span>
                {renderEditorInput("slug", "Author slug", "author-slug")}
              </label>
              {renderEditingActions(author)}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <AuthorIdentity author={author} />
                <AuthorActions
                  author={author}
                  loading={loadingId === author.id}
                  onEdit={startEdit}
                  onDelete={setPendingDelete}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                {author.bio || "No biography provided."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-600">
                <span>/{author.slug || "no-slug"}</span>
                <span>
                  {author.createdAt
                    ? `Created ${formatDate(author.createdAt)}`
                    : "Creation date unavailable"}
                </span>
              </div>
            </>
          )
        }
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !loadingId) setPendingDelete(null)
        }}
      >
        <DialogContent className="border-white/10 bg-[#11161d] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this author?</DialogTitle>
            <DialogDescription className="leading-6 text-gray-400">
              &ldquo;{pendingDelete?.name || "This author"}&rdquo; will be permanently
              removed. Their posts will not be deleted automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={Boolean(loadingId)}
                className="border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={Boolean(loadingId)}
              onClick={() => void deleteAuthor()}
            >
              {loadingId && <LoaderCircle className="animate-spin" />}
              {loadingId ? "Deleting..." : "Delete author"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import {
  LoaderCircle,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  UserRoundPlus,
  Users,
} from "lucide-react"
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
import { cn, formatDate } from "@/lib/utils"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  image: string
  createdAt: string
}

interface AdminActionResponse {
  author?: { name?: string }
  error?: string
}

function UserRoleBadge({ role }: { role: string }) {
  const normalizedRole = role.toLowerCase()

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize",
        normalizedRole === "admin" &&
          "border-red-400/20 bg-red-400/[0.08] text-red-300",
        normalizedRole === "author" &&
          "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
        normalizedRole !== "admin" &&
          normalizedRole !== "author" &&
          "border-slate-400/20 bg-slate-400/[0.08] text-slate-300"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          normalizedRole === "admin" && "bg-red-400",
          normalizedRole === "author" && "bg-emerald-400",
          normalizedRole !== "admin" &&
            normalizedRole !== "author" &&
            "bg-slate-400"
        )}
        aria-hidden="true"
      />
      {role}
    </span>
  )
}

function UserIdentity({ user }: { user: UserRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src={user.image || "/fallback.avif"}
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover ring-1 ring-white/10"
      />
      <p className="truncate font-extrabold text-gray-100">
        {user.name || "Unnamed user"}
      </p>
    </div>
  )
}

function UserActions({
  loading,
  onDelete,
  onPromote,
  user,
}: {
  loading: boolean
  onDelete: (user: UserRow) => void
  onPromote: (user: UserRow) => void
  user: UserRow
}) {
  if (user.role === "admin") {
    return (
      <span className="inline-flex items-center justify-end gap-1.5 text-xs font-semibold text-gray-600">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Protected
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={loading}
          aria-label={`Open actions for ${user.name || user.email}`}
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
        {user.role === "user" && (
          <>
            <DropdownMenuItem onSelect={() => onPromote(user)}>
              <UserRoundPlus aria-hidden="true" />
              Promote to author
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        )}
        <DropdownMenuItem
          className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
          onSelect={() => onDelete(user)}
        >
          <Trash2 aria-hidden="true" />
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AdminUsersTable({
  initialUsers,
}: {
  initialUsers: UserRow[]
}) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null)

  const promoteUser = useCallback(async (user: UserRow) => {
    setLoadingId(user.id)
    try {
      const response = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const result = (await response.json()) as AdminActionResponse
      if (!response.ok) throw new Error(result.error || "Promotion failed")

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, role: "author" } : item
        )
      )
      toast.success(`${result.author?.name || user.name || "User"} promoted to Author`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to promote user."
      )
    } finally {
      setLoadingId(null)
    }
  }, [])

  const deleteUser = useCallback(async () => {
    if (!pendingDelete) return

    const user = pendingDelete
    setLoadingId(user.id)
    try {
      const response = await fetch(
        `/api/admin/users?id=${encodeURIComponent(user.id)}`,
        { method: "DELETE" }
      )
      const result = (await response.json()) as AdminActionResponse
      if (!response.ok) throw new Error(result.error || "Delete failed")

      setUsers((current) => current.filter((item) => item.id !== user.id))
      setPendingDelete(null)
      toast.success(`User "${user.name || user.email}" deleted.`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user."
      )
    } finally {
      setLoadingId(null)
    }
  }, [pendingDelete])

  const columns: DashboardTableColumn<UserRow>[] = [
    {
      key: "user",
      label: "User",
      headerClassName: "w-[28%]",
      render: (user) => <UserIdentity user={user} />,
    },
    {
      key: "email",
      label: "Email",
      headerClassName: "w-[30%]",
      cellClassName: "truncate font-semibold text-gray-400",
      render: (user) => user.email,
    },
    {
      key: "role",
      label: "Role",
      headerClassName: "w-[14%]",
      render: (user) => <UserRoleBadge role={user.role} />,
    },
    {
      key: "created",
      label: "Created",
      headerClassName: "w-[18%]",
      cellClassName: "font-semibold text-gray-500",
      render: (user) =>
        user.createdAt ? (
          <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "w-[10%] text-right",
      cellClassName: "text-right",
      screenReaderLabel: true,
      render: (user) => (
        <UserActions
          user={user}
          loading={loadingId === user.id}
          onPromote={(selectedUser) => void promoteUser(selectedUser)}
          onDelete={setPendingDelete}
        />
      ),
    },
  ]

  if (users.length === 0) {
    return (
      <Card className="items-center border-dashed border-white/10 bg-card/20 px-6 py-14 text-center shadow-none">
        <span className="mb-4 flex size-11 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300">
          <Users className="size-5" aria-hidden="true" />
        </span>
        <h3 className="font-extrabold text-white">No users found</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          Registered users will appear here.
        </p>
      </Card>
    )
  }

  return (
    <>
      <DashboardTable
        rows={users}
        columns={columns}
        getRowId={(user) => user.id}
        renderMobileRow={(user) => (
          <>
            <div className="flex items-start justify-between gap-4">
              <UserIdentity user={user} />
              <UserActions
                user={user}
                loading={loadingId === user.id}
                onPromote={(selectedUser) => void promoteUser(selectedUser)}
                onDelete={setPendingDelete}
              />
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-gray-400">
              {user.email}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <UserRoleBadge role={user.role} />
              <span className="text-xs font-semibold text-gray-600">
                {user.createdAt ? `Joined ${formatDate(user.createdAt)}` : "Join date unavailable"}
              </span>
            </div>
          </>
        )}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !loadingId) setPendingDelete(null)
        }}
      >
        <DialogContent className="border-white/10 bg-[#11161d] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this user?</DialogTitle>
            <DialogDescription className="leading-6 text-gray-400">
              &ldquo;{pendingDelete?.name || pendingDelete?.email}&rdquo; and their
              account data will be permanently removed. This action cannot be undone.
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
              onClick={() => void deleteUser()}
            >
              {loadingId && <LoaderCircle className="animate-spin" />}
              {loadingId ? "Deleting..." : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { LoaderCircle, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import type { BlogStatus } from "@/types/blogType"

export type DashboardPostStatusFilter = "all" | BlogStatus

export interface DashboardTableColumn<Row> {
  cellClassName?: string
  headerClassName?: string
  key: string
  label: string
  render: (row: Row) => ReactNode
  screenReaderLabel?: boolean
}

interface DashboardTableProps<Row> {
  columns: DashboardTableColumn<Row>[]
  getRowId: (row: Row) => string
  renderMobileRow: (row: Row) => ReactNode
  rows: Row[]
}

export function DashboardTable<Row>({
  columns,
  getRowId,
  renderMobileRow,
  rows,
}: DashboardTableProps<Row>) {
  return (
    <Card className="overflow-hidden border-white/[0.08] bg-card/20 shadow-none">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] table-fixed text-left text-sm">
          <thead className="border-b border-white/[0.08] bg-white/[0.025] text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-5 py-3.5", column.headerClassName)}
                >
                  {column.screenReaderLabel ? (
                    <span className="sr-only">{column.label}</span>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {rows.map((row) => (
              <tr
                key={getRowId(row)}
                className="group transition-colors hover:bg-white/[0.025]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-5 py-4", column.cellClassName)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-white/[0.07] md:hidden">
        {rows.map((row) => (
          <li key={getRowId(row)} className="p-4">
            {renderMobileRow(row)}
          </li>
        ))}
      </ul>
    </Card>
  )
}

interface DashboardPostCellProps {
  category: string
  href?: string
  mobile?: boolean
  title: string
}

export function DashboardPostCell({
  category,
  href,
  mobile = false,
  title,
}: DashboardPostCellProps) {
  const titleClassName = cn(
    "font-extrabold text-gray-100 transition-colors",
    mobile ? "line-clamp-2 leading-5" : "block truncate",
    href &&
      "hover:text-cyan-300 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
  )

  return (
    <>
      {href ? (
        <Link href={href} className={titleClassName}>
          {title}
        </Link>
      ) : (
        <p className={titleClassName}>{title}</p>
      )}
      <p className="mt-1 truncate text-xs font-semibold text-gray-600">
        {category || "Uncategorized"}
      </p>
    </>
  )
}

export function DashboardStatusBadge({ status }: { status: BlogStatus }) {
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

interface DashboardPostFiltersProps {
  count: number
  onQueryChange: (query: string) => void
  onStatusChange: (status: DashboardPostStatusFilter) => void
  query: string
  status: DashboardPostStatusFilter
}

export function DashboardPostFilters({
  count,
  onQueryChange,
  onStatusChange,
  query,
  status,
}: DashboardPostFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search posts or categories"
          aria-label="Search posts"
          className="h-10 border-white/10 bg-white/[0.03] pl-9 text-white placeholder:text-gray-600 focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20"
        />
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-xs font-semibold text-gray-500" aria-live="polite">
          {count} {count === 1 ? "post" : "posts"}
        </p>
        <Select
          value={status}
          onValueChange={(value) =>
            onStatusChange(value as DashboardPostStatusFilter)
          }
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
  )
}

interface DashboardPostDeleteDialogProps {
  loading: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  postTitle?: string
}

export function DashboardPostDeleteDialog({
  loading,
  onConfirm,
  onOpenChange,
  open,
  postTitle,
}: DashboardPostDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#11161d] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogDescription className="leading-6 text-gray-400">
            &ldquo;{postTitle}&rdquo; will be permanently removed. This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={loading}
              className="border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && <LoaderCircle className="animate-spin" />}
            {loading ? "Deleting..." : "Delete post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

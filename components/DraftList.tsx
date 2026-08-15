"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import { deleteBlog } from "@/lib/blogService.client"
import type { DraftSummary } from "@/types/blogType"
import { usePreviewMode } from "@/components/preview/PreviewModeProvider"

interface DraftsListProps {
  initialDrafts: DraftSummary[]
}

export default function DraftsList({ initialDrafts }: DraftsListProps) {
  const [drafts, setDrafts] = useState(initialDrafts)
  const router = useRouter()
  const { guardMutation } = usePreviewMode()

  const handleDelete = useCallback((draft: DraftSummary) => {
    if (guardMutation()) return

    const toastId = toast("Delete draft?", {
      description: "This will permanently remove this draft.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const result = await deleteBlog(draft.id)
            if (!result.ok) {
              throw new Error(result.error || "Delete failed")
            }

            setDrafts((current) =>
              current.filter((item) => item.id !== draft.id)
            )
            toast.success("Draft deleted.")
          } catch (error) {
            console.error("Delete draft error:", error)
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to delete draft."
            )
          } finally {
            toast.dismiss(toastId)
          }
        },
      },
    })
  }, [guardMutation])

  if (drafts.length === 0) {
    return (
      <div className="rounded bg-white p-6 text-gray-400 shadow">
        No drafts found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <div key={draft.id} className="rounded border bg-gray-900 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {draft.title || "Untitled draft"}
              </h3>
              <p className="text-sm text-gray-400">{draft.snippet}</p>
              <p className="mt-2 text-xs text-gray-500">
                Saved: {new Date(draft.updatedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/drafts/${encodeURIComponent(draft.id)}`
                  )
                }
                className="rounded bg-green-600 px-3 py-1 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(draft)}
                className="rounded bg-red-600 px-3 py-1 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

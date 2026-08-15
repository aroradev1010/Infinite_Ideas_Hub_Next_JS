"use client"

import { Eye, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePreviewMode } from "@/components/preview/PreviewModeProvider"

export function PreviewModeBanner() {
  const { exitPreviewMode, isPreviewMode } = usePreviewMode()
  if (!isPreviewMode) return null

  return (
    <aside
      aria-label="Preview mode"
      className="border-y border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2.5 text-cyan-50"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 sm:mt-0">
            <Eye className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
              Preview Mode
            </p>
            <p className="text-sm text-gray-300">
              Explore the complete platform. Changes are disabled.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={exitPreviewMode}
          className="self-start text-cyan-200 hover:bg-cyan-300/10 hover:text-white sm:self-auto"
        >
          <X aria-hidden="true" />
          Exit Preview
        </Button>
      </div>
    </aside>
  )
}

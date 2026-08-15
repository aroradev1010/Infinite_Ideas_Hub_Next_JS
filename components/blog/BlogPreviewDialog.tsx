"use client"

import BlogArticle from "@/components/blog/BlogArticle"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { BlogArticleData } from "@/types/blogType"

interface BlogPreviewDialogProps {
  article: BlogArticleData | null
  error: string | null
  isLoading: boolean
  onOpenChange: (open: boolean) => void
  onRetry: () => void
  open: boolean
}

export default function BlogPreviewDialog({
  article,
  error,
  isLoading,
  onOpenChange,
  onRetry,
  open,
}: BlogPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-none"
      >
        <DialogHeader className="flex-row items-center justify-between border-b bg-background px-4 py-3 text-left sm:flex-row">
          <div>
            <DialogTitle>Blog Preview</DialogTitle>
            <DialogDescription>
              Unsaved preview. Nothing has been written to the database.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
            >
              Back to editing
            </button>
          </DialogClose>
        </DialogHeader>

        <main className="overflow-y-auto bg-background">
          {isLoading ? (
            <div
              role="status"
              className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 text-gray-400"
            >
              Generating preview...
            </div>
          ) : null}

          {!isLoading && error ? (
            <div
              role="alert"
              className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
            >
              <p className="text-red-400">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Retry preview
              </button>
            </div>
          ) : null}

          {!isLoading && !error && article ? (
            <BlogArticle article={article} />
          ) : null}
        </main>
      </DialogContent>
    </Dialog>
  )
}

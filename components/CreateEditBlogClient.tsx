"use client"

import type { SerializedEditorState } from "lexical"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

import BlogPreviewDialog from "@/components/blog/BlogPreviewDialog"
import {
  BLOG_CATEGORIES,
  DEFAULT_BLOG_CATEGORY,
  isBlogCategory,
  type BlogCategoryName,
} from "@/lib/blogCategories"
import { generateBlogPreview } from "@/lib/blogPreview.client"
import { createBlog, updateBlog } from "@/lib/blogService.client"
import { createEmptySerializedEditorState } from "@/lib/editor/state"
import type {
  BlogInput,
  BlogArticleData,
  BlogPreviewAuthor,
  BlogStatus,
  EditableBlog,
} from "@/types/blogType"

const BlogEditor = dynamic(() => import("./editor/BlogEditor"), {
  ssr: false,
})

interface CreateEditBlogClientProps {
  currentAuthor: BlogPreviewAuthor
  initialBlog?: EditableBlog | null
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function CreateEditBlogClient({
  currentAuthor,
  initialBlog,
}: CreateEditBlogClientProps) {
  const router = useRouter()
  const [blogId, setBlogId] = useState(initialBlog?.id ?? null)
  const [title, setTitle] = useState(initialBlog?.title ?? "")
  const [category, setCategory] = useState<BlogCategoryName>(
    initialBlog && isBlogCategory(initialBlog.category)
      ? initialBlog.category
      : DEFAULT_BLOG_CATEGORY
  )
  const [image, setImage] = useState(initialBlog?.image ?? "")
  const editorStateRef = useRef<SerializedEditorState>(
    initialBlog?.editorState ?? createEmptySerializedEditorState()
  )
  const plainTextRef = useRef(initialBlog?.plainText ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewArticle, setPreviewArticle] =
    useState<BlogArticleData | null>(null)
  const previewRequestInFlightRef = useRef(false)

  const handleEditorUpdate = useCallback(
    (nextEditorState: SerializedEditorState, nextPlainText: string) => {
      editorStateRef.current = nextEditorState
      plainTextRef.current = nextPlainText
    },
    []
  )

  const makeInput = useCallback(
    (status: BlogStatus): BlogInput => ({
      title: title.trim(),
      editorState: editorStateRef.current,
      image: image.trim(),
      category,
      status,
    }),
    [category, image, title]
  )

  const save = useCallback(
    async (status: BlogStatus) => {
      const input = makeInput(status)
      const result = blogId
        ? await updateBlog(blogId, input)
        : await createBlog(input)

      if (!result.ok) {
        throw new Error(result.error || "Failed to save post")
      }

      if (!result.data) {
        throw new Error("The server did not return the saved post")
      }

      setBlogId(result.data.id)
      return result.data
    },
    [blogId, makeInput]
  )

  const handleSaveDraft = useCallback(async () => {
    const hasContent =
      title.trim().length > 0 ||
      plainTextRef.current.trim().length > 0 ||
      image.trim().length > 0

    if (!hasContent) {
      toast.error("Add some content before saving a draft.")
      return
    }

    setIsSaving(true)
    try {
      const wasPublished = initialBlog?.status === "published"
      await save("draft")
      toast.success(wasPublished ? "Blog unpublished and saved as a draft." : "Draft saved.")

      if (wasPublished) {
        router.push("/dashboard/drafts")
      }
    } catch (error) {
      console.error("Save draft error:", error)
      toast.error(errorMessage(error, "Failed to save draft"))
    } finally {
      setIsSaving(false)
    }
  }, [image, initialBlog?.status, router, save, title])

  const handlePublish = useCallback(async () => {
    if (title.trim().length < 3) {
      toast.error("Please provide a title (min 3 characters).")
      return
    }

    if (plainTextRef.current.trim().length < 20) {
      toast.error("Please write some content (min 20 characters).")
      return
    }

    setIsSaving(true)
    try {
      await save("published")
      toast.success(blogId ? "Blog updated and published." : "Blog published.")
      router.push("/dashboard")
    } catch (error) {
      console.error("Publish error:", error)
      toast.error(errorMessage(error, "Failed to publish"))
    } finally {
      setIsSaving(false)
    }
  }, [blogId, router, save, title])

  const handlePreview = useCallback(async () => {
    if (previewRequestInFlightRef.current) return

    previewRequestInFlightRef.current = true
    setPreviewOpen(true)
    setIsPreviewLoading(true)
    setPreviewError(null)
    setPreviewArticle(null)

    const author = initialBlog
      ? {
          name: initialBlog.author,
          slug: initialBlog.authorSlug,
        }
      : currentAuthor
    const articleSnapshot = {
      title: title.trim() || "Untitled blog",
      image: image.trim(),
      author: author.name,
      authorSlug: author.slug,
      category,
      publishedAt: initialBlog?.publishedAt ?? new Date().toISOString(),
    }

    try {
      const contentHtml = await generateBlogPreview(editorStateRef.current)
      setPreviewArticle({ ...articleSnapshot, contentHtml })
    } catch (error) {
      setPreviewError(errorMessage(error, "Unable to generate preview"))
    } finally {
      previewRequestInFlightRef.current = false
      setIsPreviewLoading(false)
    }
  }, [category, currentAuthor, image, initialBlog, title])

  const isPublishedBlog = initialBlog?.status === "published"

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <input
          aria-label="Post title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Post title"
          className="w-full border-b bg-transparent p-2 text-3xl font-extrabold focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-4">
          <select
            aria-label="Post category"
            value={category}
            onChange={(event) => {
              if (isBlogCategory(event.target.value)) {
                setCategory(event.target.value)
              }
            }}
            className="rounded border bg-black p-2"
          >
            {BLOG_CATEGORIES.map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            aria-label="Thumbnail image URL"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="Thumbnail image URL (optional)"
            className="flex-1 rounded border bg-black p-2"
          />
        </div>

        {image ? (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Thumbnail preview"
              className="max-h-56 w-full rounded object-cover"
            />
          </div>
        ) : null}
      </div>

      <BlogEditor
        initialEditorState={editorStateRef.current}
        onUpdate={handleEditorUpdate}
      />

      <div className="flex items-center justify-end gap-3">
        {isPublishedBlog ? (
          <p className="mr-auto text-xs text-yellow-500">
            Saving as a draft will unpublish this blog while preserving its ID.
          </p>
        ) : null}

        <button
          type="button"
          disabled={isPreviewLoading || isSaving}
          onClick={handlePreview}
          className="rounded border border-gray-600 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPreviewLoading ? "Generating preview..." : "Preview"}
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveDraft}
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : isPublishedBlog
              ? "Unpublish & Save Draft"
              : "Save Draft"}
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={handlePublish}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : blogId ? "Update & Publish" : "Publish"}
        </button>
      </div>

      <BlogPreviewDialog
        article={previewArticle}
        error={previewError}
        isLoading={isPreviewLoading}
        onOpenChange={setPreviewOpen}
        onRetry={handlePreview}
        open={previewOpen}
      />
    </div>
  )
}

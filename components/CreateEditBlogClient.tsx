"use client"

import type { SerializedEditorState } from "lexical"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

import BlogPreviewDialog from "@/components/blog/BlogPreviewDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BLOG_CATEGORIES,
  DEFAULT_BLOG_CATEGORY,
  isBlogCategory,
  type BlogCategoryName,
} from "@/lib/blogCategories"
import { generateBlogPreview } from "@/lib/blogPreview.client"
import { createBlog, updateBlog } from "@/lib/blogService.client"
import { createEmptySerializedEditorState } from "@/lib/editor/state"
import { cn } from "@/lib/utils"
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
  presentation?: "default" | "dashboard-create"
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export default function CreateEditBlogClient({
  currentAuthor,
  initialBlog,
  presentation = "default",
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
  const isDashboardCreate = presentation === "dashboard-create"

  return (
    <div
      className={cn(
        "mx-auto max-w-4xl space-y-6",
        isDashboardCreate && "max-w-none space-y-8"
      )}
    >
      {isDashboardCreate ? (
        <Card className="border-white/[0.08] bg-card/20 shadow-none">
          <CardContent className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(14rem,1fr)]">
              <div className="space-y-2">
                <Label
                  htmlFor="create-blog-title"
                  className="font-extrabold text-gray-300"
                >
                  Post Title
                </Label>
                <Input
                  id="create-blog-title"
                  aria-label="Post title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter an engaging title for your post..."
                  className="h-12 border-white/10 bg-white/[0.03] px-4 text-base font-bold text-white shadow-none placeholder:font-normal placeholder:text-gray-600 focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="create-blog-category"
                  className="font-extrabold text-gray-300"
                >
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (isBlogCategory(value)) {
                      setCategory(value)
                    }
                  }}
                >
                  <SelectTrigger
                    id="create-blog-category"
                    aria-label="Post category"
                    className="w-full border-white/10 bg-white/[0.03] px-4 font-bold text-gray-200 shadow-none focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20 data-[size=default]:h-12"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#11161d] text-gray-200">
                    {BLOG_CATEGORIES.map((item) => (
                      <SelectItem key={item.slug} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="create-blog-thumbnail"
                className="font-extrabold text-gray-300"
              >
                Thumbnail Image URL (optional)
              </Label>
              <Input
                id="create-blog-thumbnail"
                aria-label="Thumbnail image URL"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="Paste a direct image URL to use as the thumbnail..."
                className="h-12 border-white/10 bg-white/[0.03] px-4 text-white shadow-none placeholder:text-gray-600 focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20"
              />
              <p className="text-xs leading-5 text-gray-600">
                The image will be previewed here before you publish.
              </p>
            </div>

            {image ? (
              <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Thumbnail preview"
                  className="max-h-64 w-full object-cover"
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
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
      )}

      {isDashboardCreate ? (
        <section aria-labelledby="create-blog-content" className="space-y-3">
          <h2
            id="create-blog-content"
            className="text-sm font-extrabold text-gray-300"
          >
            Content
          </h2>
          <BlogEditor
            initialEditorState={editorStateRef.current}
            onUpdate={handleEditorUpdate}
            className="border-0 bg-transparent p-0"
          />
        </section>
      ) : (
        <BlogEditor
          initialEditorState={editorStateRef.current}
          onUpdate={handleEditorUpdate}
        />
      )}

      {isDashboardCreate ? (
        <div className="flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-end">
          {isPublishedBlog ? (
            <p className="text-xs text-yellow-500 sm:mr-auto">
              Saving as a draft will unpublish this blog while preserving its ID.
            </p>
          ) : null}

          <div className="grid w-full gap-3 sm:flex sm:w-auto sm:items-center">
            <Button
              type="button"
              variant="outline"
              disabled={isPreviewLoading || isSaving}
              onClick={handlePreview}
              className="h-10 w-full border-white/10 bg-white/[0.02] px-5 font-bold text-gray-300 shadow-none hover:bg-white/[0.06] hover:text-white sm:w-auto"
            >
              {isPreviewLoading ? "Generating preview..." : "Preview"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="h-10 w-full bg-slate-800 px-5 font-bold text-slate-100 shadow-none hover:bg-slate-700 sm:w-auto"
            >
              {isSaving
                ? "Saving..."
                : isPublishedBlog
                  ? "Unpublish & Save Draft"
                  : "Save Draft"}
            </Button>

            <Button
              type="button"
              disabled={isSaving}
              onClick={handlePublish}
              className="h-10 w-full bg-emerald-500 px-5 font-extrabold text-slate-950 shadow-none hover:bg-emerald-400 focus-visible:ring-emerald-400/30 sm:w-auto"
            >
              {isSaving ? "Saving..." : blogId ? "Update & Publish" : "Publish"}
            </Button>
          </div>
        </div>
      ) : (
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
      )}

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

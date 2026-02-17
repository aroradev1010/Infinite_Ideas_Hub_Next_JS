// components/CreateEditBlogClient.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { saveDraft } from "@/lib/draftService";
import { createBlog, updateBlog, deleteBlog } from "@/lib/blogService.client";
import type { Blog, BlogInput } from "@/types/blogType";
import type { DraftInput } from "@/types/draftType";

const BlogEditor = dynamic(() => import("./editor/BlogEditor"), { ssr: false });

export default function CreateEditBlogClient({
  initialBlog,
}: {
  initialBlog?: Partial<Blog> | null;
}) {
  const router = useRouter();

  // --- Form state ---
  const [title, setTitle] = useState(initialBlog?.title ?? "");
  const [category, setCategory] = useState(initialBlog?.category ?? "");
  const [image, setImage] = useState(initialBlog?.image ?? "");
  const [status, setStatus] = useState<"published" | "draft">(
    initialBlog?.status ?? "draft"
  );
  const [editorHtml, setEditorHtml] = useState(
    initialBlog?.description ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // Track server draft id so subsequent saves update the same draft
  const [serverDraftId, setServerDraftId] = useState<string | null>(null);

  const categories = useMemo(
    () => ["Backend", "JavaScript", "React", "TypeScript"],
    []
  );

  // --- Helpers ---
  const plainTextLength = useCallback((html: string) => {
    if (!html) return 0;
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\&[^\s;]+;/g, "")
      .trim().length;
  }, []);

  const validatePublish = useCallback(() => {
    if (!title || title.trim().length < 3) {
      toast.error("Please provide a title (min 3 characters).");
      return false;
    }
    if (!editorHtml || plainTextLength(editorHtml) < 20) {
      toast.error("Please write some content (min 20 characters).");
      return false;
    }
    return true;
  }, [title, editorHtml, plainTextLength]);

  const handleEditorUpdate = useCallback((html: string) => {
    setEditorHtml(html);
  }, []);

  // --- Save Draft handler ---
  // NEW BEHAVIOUR: If editing an already-published blog (initialBlog.id exists and
  // initialBlog.status === "published"), "Save Draft" will:
  //   1. Delete the published blog from the blogs collection
  //   2. Create a new draft in the drafts collection with the content
  //   3. Redirect to /dashboard/drafts
  //
  // If creating a new blog or editing an existing draft, it just saves/updates
  // the draft as before.
  const handleSaveDraft = useCallback(async () => {
    const html = editorHtml || "";
    const hasContent =
      (title && title.trim()) ||
      plainTextLength(html) > 0 ||
      (image && image.trim());

    if (!hasContent) {
      toast.error("Add some content before saving a draft.");
      return;
    }

    setIsSaving(true);
    try {
      const isPublishedBlog =
        initialBlog?.id && initialBlog?.status === "published";

      if (isPublishedBlog) {
        // Step 1: Delete the published blog
        const deleteRes = await deleteBlog(initialBlog!.id!);
        if (!deleteRes.ok) {
          throw new Error(
            deleteRes.error || "Failed to remove published blog"
          );
        }

        // Step 2: Create a fresh draft with the current editor content
        const payload: DraftInput = {
          title: title.trim(),
          description: html,
          image: image?.trim() || "",
          category,
          status: "draft" as const,
          blogId: null, // no longer linked to a blog (it was deleted)
        };

        const resp = await saveDraft(payload);
        if (!resp.ok) {
          throw new Error(resp.error || "Failed to save draft");
        }

        toast.success(
          "Blog unpublished and saved as a draft. You can find it in Drafts."
        );
        router.push("/dashboard/drafts");
        return;
      }

      // Standard path: create or update a draft (no published blog involved)
      const payload: DraftInput = {
        draftId: serverDraftId ?? undefined,
        title: title.trim(),
        description: html,
        image: image?.trim() || "",
        category,
        status: "draft" as const,
        blogId: initialBlog?.id ?? null,
      };

      const resp = await saveDraft(payload);
      if (!resp.ok) {
        throw new Error(resp.error || "Failed to save draft");
      }

      toast.success("Draft saved.");
      if (resp.draft?.id) setServerDraftId(resp.draft.id);
    } catch (err: any) {
      console.error("Save draft error:", err);
      toast.error(err?.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  }, [
    editorHtml,
    title,
    image,
    category,
    serverDraftId,
    initialBlog,
    plainTextLength,
    router,
  ]);

  // --- Publish handler ---
  const handlePublish = useCallback(async () => {
    const html = editorHtml || "";
    if (!validatePublish()) return;

    setIsSaving(true);
    try {
      const input: BlogInput = {
        title: title.trim(),
        description: html,
        image: image?.trim() || "",
        category: category || "Uncategorized",
        status: "published",
      };

      if (initialBlog && initialBlog.id) {
        const res = await updateBlog(initialBlog.id, input);
        if (!res.ok) throw new Error(res.error || "Failed to update blog");
        toast.success("Blog updated and published.");
      } else {
        const createRes = await createBlog(input);
        if (!createRes.ok)
          throw new Error(createRes.error || "Failed to create blog");
        toast.success("Blog published.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Publish error:", err);
      toast.error(err?.message || "Failed to publish");
    } finally {
      setIsSaving(false);
    }
  }, [editorHtml, title, image, category, initialBlog, validatePublish, router]);

  const isPublishedBlog =
    initialBlog?.id && initialBlog?.status === "published";

  // --- UI ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full text-3xl font-extrabold bg-transparent border-b p-2 focus:outline-none"
        />

        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-2 bg-black"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Thumbnail image URL (optional)"
            className="border rounded p-2 flex-1 bg-black"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="border rounded p-1 bg-black"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {image ? (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="thumbnail preview"
              className="w-full max-h-56 object-cover rounded"
            />
          </div>
        ) : null}
      </div>

      <div>
        <BlogEditor
          initialHtml={initialBlog?.description || ""}
          onUpdate={handleEditorUpdate}
        />
      </div>

      <div className="flex gap-3 justify-end items-center">
        {/* Show a hint when saving draft will unpublish */}
        {isPublishedBlog && (
          <p className="text-xs text-yellow-500 mr-auto">
            ⚠️ Saving as draft will unpublish this blog.
          </p>
        )}

        <button
          disabled={isSaving}
          onClick={handleSaveDraft}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {isSaving
            ? "Saving…"
            : isPublishedBlog
            ? "Unpublish & Save Draft"
            : "Save Draft"}
        </button>

        <button
          disabled={isSaving}
          onClick={handlePublish}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {isSaving
            ? "Saving…"
            : initialBlog?.id
            ? "Update & Publish"
            : "Publish"}
        </button>
      </div>
    </div>
  );
}
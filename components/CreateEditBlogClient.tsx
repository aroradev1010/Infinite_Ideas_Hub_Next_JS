// components/CreateEditBlogClient.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { saveDraft } from "@/lib/draftService";
import { createBlog, updateBlog } from "@/lib/blogService.client";
import type { Blog, BlogInput } from "@/types/blogType";
import type { DraftInput } from "@/types/draftType";

const BlogEditor = dynamic(() => import("./editor/BlogEditor"), { ssr: false });


export default function CreateEditBlogClient({ initialBlog }: { initialBlog?: Blog | null }) {
    const router = useRouter();

    // --- Form state ---
    const [title, setTitle] = useState(initialBlog?.title ?? "");
    const [category, setCategory] = useState(initialBlog?.category ?? "");
    const [image, setImage] = useState(initialBlog?.image ?? "");
    const [status, setStatus] = useState<"published" | "draft">(initialBlog?.status ?? "draft");
    const [editorHtml, setEditorHtml] = useState(initialBlog?.description ?? "");
    const [isSaving, setIsSaving] = useState(false);

    // track server draft id if user saves a draft (so subsequent Save Draft updates same server draft)
    const [serverDraftId, setServerDraftId] = useState<string | null>(null);

    // categories — replace with fetch if dynamic
    const categories = useMemo(() => ["Backend", "JavaScript", "React", "TypeScript"], []);

    // --- Helpers ---
    const plainTextLength = useCallback((html: string) => {
        if (!html) return 0;
        return html.replace(/<[^>]*>/g, "").replace(/\&[^\s;]+;/g, "").trim().length;
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

    // --- Editor callback ---
    const handleEditorUpdate = useCallback((html: string) => {
        setEditorHtml(html);
    }, []);

    // --- Save Draft handler (user action) ---
    const handleSaveDraft = useCallback(async () => {
        const html = editorHtml || "";
        const hasContent = (title && title.trim()) || plainTextLength(html) > 0 || (image && image.trim());
        if (!hasContent) {
            toast.error("Add some content before saving a draft.");
            return;
        }

        setIsSaving(true);
        try {
            // Explicitly type the payload so TS checks the union types correctly
            const payload: DraftInput = {
                draftId: serverDraftId ?? undefined,
                title: title.trim(),
                description: html,
                image: image?.trim() || "",
                category,
                // ensure this is seen as the literal union type
                status: ("draft" as const),
                blogId: initialBlog?.id ?? null,
            };

            const resp = await saveDraft(payload);

            if (!resp.ok) {
                throw new Error(resp.error || "Failed to save draft");
            }

            toast.success("Draft saved to your drafts.");
            if (resp.draft?.id) setServerDraftId(resp.draft.id);
        } catch (err: any) {
            console.error("Save draft error:", err);
            toast.error(err?.message || "Failed to save draft");
        } finally {
            setIsSaving(false);
        }
    }, [editorHtml, title, image, category, serverDraftId, initialBlog?.id, plainTextLength]);

    // --- Publish handler ---
    const handlePublish = useCallback(
        async (mode: "publish" | "publish-update") => {
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
                    // update existing blog
                    const res = await updateBlog(initialBlog.id, input);
                    if (!res.ok) throw new Error(res.error || "Failed to update blog");
                    toast.success("Blog updated and published.");
                    router.push("/dashboard");
                    return;
                }

                // create new blog
                const createRes = await createBlog(input);
                if (!createRes.ok) throw new Error(createRes.error || "Failed to create blog");
                toast.success("Blog created and published.");
                router.push("/dashboard");
            } catch (err: any) {
                console.error("Publish error:", err);
                toast.error(err?.message || "Failed to publish");
            } finally {
                setIsSaving(false);
            }
        },
        [editorHtml, title, image, category, initialBlog, validatePublish, router]
    );

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

                <div className="flex items-center gap-4">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded p-2 bg-black">
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
                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border rounded p-1 bg-black">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>

                {image ? (
                    <div className="mt-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt="thumbnail preview" className="w-full max-h-56 object-cover rounded" />
                    </div>
                ) : null}
            </div>

            <div>
                <BlogEditor initialHtml={initialBlog?.description || ""} onUpdate={(html) => handleEditorUpdate(html)} />
            </div>

            <div className="flex gap-3 justify-end items-center">
                <div className="text-sm text-gray-400 mr-auto"></div>

                <button disabled={isSaving} onClick={() => handleSaveDraft()} className="bg-gray-700 text-white px-4 py-2 rounded">
                    {isSaving ? "Saving…" : "Save Draft"}
                </button>

                <button
                    disabled={isSaving}
                    onClick={() => handlePublish(initialBlog && initialBlog.id ? "publish-update" : "publish")}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    {isSaving ? "Saving…" : initialBlog ? "Update & Publish" : "Publish"}
                </button>
            </div>
        </div>
    );
}

"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveDraft as saveDraftAPI } from "@/lib/draftService";
import { useAutosaveDraft } from "@/hooks/useAutoSaveDraft";

// dynamic import so tiptap doesn’t load server-side
const BlogEditor = dynamic(() => import("./BlogEditor"), { ssr: false });

// shape of blog data (for both edit and create)
type BlogShape = {
    id?: string;
    title?: string;
    description?: string;
    image?: string;
    category?: string;
    slug?: string;
    status?: "published" | "draft";
};

export default function CreateEditBlogClient({ initialBlog }: { initialBlog?: BlogShape | null }) {
    const router = useRouter();

    // form state
    const [title, setTitle] = useState(initialBlog?.title || "");
    const [category, setCategory] = useState(initialBlog?.category || "");
    const [image, setImage] = useState(initialBlog?.image || "");
    const [status, setStatus] = useState<"published" | "draft">(initialBlog?.status || "draft");
    const [editorHtml, setEditorHtml] = useState(initialBlog?.description || "");
    const [draftId, setDraftId] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);

    // categories (could be fetched later)
    const categories = useMemo(() => ["General", "Tech", "Productivity", "Design", "Uncategorized"], []);

    // autosave + local/server sync
    const { scheduleAutosave, clearLocalDraft, loadLocalDraft, isSyncing } = useAutosaveDraft({
        initialBlogId: initialBlog?.id ?? null,
    });

    // helper: strip HTML for validation
    const plainTextLength = useCallback((html: string) => {
        if (!html) return 0;
        return html.replace(/<[^>]*>/g, "").replace(/\&[^\s;]+;/g, "").trim().length;
    }, []);

    // handle tiptap editor updates
    const handleEditorUpdate = useCallback(
        (html: string) => {
            setEditorHtml(html);
            scheduleAutosave({
                title,
                category,
                image,
                status,
                description: html,
                blogId: initialBlog?.id ?? null,
            });
        },
        [title, category, image, status, scheduleAutosave, initialBlog?.id]
    );

    // validation rules for publishing
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

    // restore local draft content into editor
    const restoreLocalDraftToForm = useCallback(() => {
        const d = loadLocalDraft();
        if (!d) {
            toast.error("No local draft found.");
            return;
        }
        setTitle(d.title || "");
        setCategory(d.category || "");
        setImage(d.image || "");
        setStatus((d.status as any) || "draft");
        setEditorHtml(d.description || "");
        toast.success("Local draft restored.");
    }, [loadLocalDraft]);

    // ✅ on mount — check for a local draft and show toast if found
    useEffect(() => {
        try {
            const d = loadLocalDraft();
            const hasLocal =
                d &&
                ((d.title && d.title.trim()) ||
                    (d.description && plainTextLength(d.description) > 0) ||
                    (d.image && d.image.trim()));

            if (hasLocal) {
                toast("Local draft available", {
                    description: "You can restore your unsaved progress.",
                    action: {
                        label: "Restore",
                        onClick: restoreLocalDraftToForm,
                    },
                });
            }
        } catch {
            // ignore parsing errors
        }
    }, [loadLocalDraft, plainTextLength, restoreLocalDraftToForm]);

    // ---------- Main save handler ----------
    const handleSave = useCallback(
        async (mode: "draft" | "publish") => {
            const finalStatus = mode === "publish" ? "published" : "draft";
            const html = editorHtml || "";

            if (mode === "publish" && !validatePublish()) return;

            if (mode === "draft") {
                const hasContent =
                    (title && title.trim()) || plainTextLength(html) > 0 || (image && image.trim());
                if (!hasContent) {
                    toast.error("Add some content before saving a draft.");
                    return;
                }
            }

            setIsSaving(true);
            try {
                // --------------- PUBLISH FLOW ---------------
                if (mode === "publish") {
                    if (initialBlog && initialBlog.id) {
                        // edit existing published/draft blog
                        const res = await fetch(`/api/blogs?id=${initialBlog.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title: title.trim(),
                                description: html,
                                image: image?.trim() || "",
                                category: category || "Uncategorized",
                                status: finalStatus,
                                slug: initialBlog.slug || undefined,
                            }),
                        });

                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || "Failed to update blog");
                        toast.success("Blog updated and published.");
                        clearLocalDraft();
                        router.push("/dashboard");
                        return;
                    } else {
                        // create new blog and publish
                        const res = await fetch("/api/blogs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title: title.trim(),
                                description: html,
                                image: image?.trim() || "",
                                category: category || "Uncategorized",
                                status: finalStatus,
                            }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || "Failed to create blog");
                        toast.success("Blog created and published.");
                        try {
                            localStorage.removeItem("ii_hub_local_draft_v1");
                        } catch { }
                        router.push("/dashboard");
                        return;
                    }
                }

                // --------------- DRAFT FLOW ---------------
                if (mode === "draft") {
                    if (initialBlog && initialBlog.id) {
                        // edit existing blog and save as draft
                        const res = await fetch(`/api/blogs?id=${initialBlog.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title: title.trim(),
                                description: html,
                                image: image?.trim() || "",
                                category: category || "Uncategorized",
                                status: "draft",
                                slug: initialBlog.slug || undefined,
                            }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || "Failed to save draft");
                        toast.success("Draft saved for this post.");
                        clearLocalDraft();
                        router.push("/dashboard");
                        return;
                    } else {
                        // create new server-side draft
                        const r = await saveDraftAPI({
                            title: title.trim(),
                            description: html,
                            image: image?.trim() || "",
                            category,
                            status: "draft",
                            blogId: null,
                        });
                        if (!r.ok) throw new Error(r.error || "Failed to save draft");
                        toast.success("Draft saved to your drafts.");
                        try {
                            window.location.reload();
                            clearLocalDraft()
                        } catch { }
                        return;
                    }
                }
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || "Failed to save");
            } finally {
                setIsSaving(false);
            }
        },
        [title, editorHtml, image, category, initialBlog, clearLocalDraft, router, plainTextLength, validatePublish]
    );

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
                    onUpdate={(html) => {
                        setEditorHtml(html);
                        handleEditorUpdate(html);
                    }}
                />
            </div>

            <div className="flex gap-3 justify-end items-center">
                <div className="text-sm text-gray-400 mr-auto">
                    {isSyncing ? "Syncing draft..." : ""}
                </div>

                {/* Save Draft -> save server draft for existing blog or new post */}
                <button
                    disabled={isSaving}
                    onClick={() => handleSave("draft")}
                    className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                    {isSaving ? "Saving…" : "Save Draft"}
                </button>

                {/* Publish -> create or update blog */}
                <button
                    disabled={isSaving}
                    onClick={() => handleSave("publish")}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    {isSaving ? "Saving…" : initialBlog ? "Update & Publish" : "Publish"}
                </button>
            </div>
        </div>
    );
}

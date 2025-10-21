// components/DraftEditorClient.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const BlogEditor = dynamic(() => import("./editor/BlogEditor"), { ssr: false });

type InitialDraft = {
    draftId: string;
    blogId?: string | null;
    title?: string;
    description?: string;
    image?: string;
    category?: string;
    status?: "draft" | "published";
};

export default function DraftEditorClient({ initialDraft }: { initialDraft: InitialDraft }) {
    const router = useRouter();

    const [title, setTitle] = useState(initialDraft.title || "");
    const [category, setCategory] = useState(initialDraft.category || "");
    const [image, setImage] = useState(initialDraft.image || "");
    const [status, setStatus] = useState<"draft" | "published">(initialDraft.status || "draft");
    const [editorHtml, setEditorHtml] = useState(initialDraft.description || "");
    const [isSaving, setIsSaving] = useState(false);

    const draftId = initialDraft.draftId;
    const blogId = initialDraft.blogId ?? null;

    const categories = useMemo(() => ["Backend", "JavaScript", "React", "TypeScript"], []);

    const plainTextLength = useCallback((html: string) => {
        if (!html) return 0;
        return html.replace(/<[^>]*>/g, "").replace(/\&[^\s;]+;/g, "").trim().length;
    }, []);

    const handleEditorUpdate = useCallback((html: string) => {
        setEditorHtml(html);
    }, []);

    // saveDraft: PATCH if draftId exists, otherwise POST create (new draft)
    const saveDraft = useCallback(async () => {
        setIsSaving(true);
        try {
            // minimal meaningful-content guard
            const hasContent = (title && title.trim().length > 0) || plainTextLength(editorHtml) > 0 || (image && image.trim().length > 0);
            if (!hasContent) {
                toast.error("Add content before saving a draft.");
                setIsSaving(false);
                return;
            }

            if (draftId) {
                // update specific draft -> PATCH /api/drafts
                const r = await fetch("/api/drafts", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        draftId,
                        title: title.trim(),
                        description: editorHtml,
                        image: image?.trim() || "",
                        category,
                        status: "draft",
                        blogId: blogId || null,
                    }),
                });
                const data = await r.json();
                if (!r.ok) throw new Error(data?.error || "Failed to update draft");
                toast.success("Draft updated.");
                return;
            }

            // create new draft -> POST /api/drafts
            const r2 = await fetch("/api/drafts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    description: editorHtml,
                    image: image?.trim() || "",
                    category,
                    status: "draft",
                    blogId: blogId || null,
                }),
            });
            const data2 = await r2.json();
            if (!r2.ok) throw new Error(data2?.error || "Failed to create draft");
            toast.success("Draft created.");
            // after create we might want to navigate to drafts list or update local state
        } catch (err: any) {
            console.error("Save draft error:", err);
            toast.error(err?.message || "Failed to save draft.");
        } finally {
            setIsSaving(false);
        }
    }, [draftId, title, editorHtml, image, category, blogId, plainTextLength]);

    // publishDraft: same as before (PATCH blog or POST blog), then delete draft
    const publishDraft = useCallback(async () => {
        if (!title || title.trim().length < 3) {
            toast.error("Please provide a title (min 3 characters).");
            return;
        }
        if (!editorHtml || plainTextLength(editorHtml) < 20) {
            toast.error("Please write some content (min 20 characters).");
            return;
        }

        setIsSaving(true);
        try {
            let blogResp;
            if (blogId) {
                const r = await fetch(`/api/blog?id=${encodeURIComponent(blogId)}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim(),
                        description: editorHtml,
                        image: image?.trim() || "",
                        category: category || "Uncategorized",
                        status: "published",
                        slug: undefined,
                    }),
                });
                blogResp = await r.json();
                if (!r.ok) throw new Error(blogResp?.error || "Failed to update blog");
            } else {
                const r = await fetch("/api/blog", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim(),
                        description: editorHtml,
                        image: image?.trim() || "",
                        category: category || "Uncategorized",
                        status: "published",
                    }),
                });
                blogResp = await r.json();
                if (!r.ok) throw new Error(blogResp?.error || "Failed to create blog");
            }

            // remove draft server-side
            const del = await fetch(`/api/drafts?draftId=${encodeURIComponent(draftId)}`, { method: "DELETE" });
            const delData = await del.json();
            if (!del.ok) {
                toast.warning("Published but failed to delete draft on server.");
            }

            toast.success("Published successfully.");
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Publish error:", err);
            toast.error(err?.message || "Failed to publish.");
        } finally {
            setIsSaving(false);
        }
    }, [draftId, blogId, title, editorHtml, image, category, plainTextLength, router]);

    const deleteDraft = useCallback(async () => {
        const t = toast("Delete draft?", {
            description: "This will remove the server copy of the draft.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        const res = await fetch(`/api/drafts?draftId=${encodeURIComponent(draftId)}`, { method: "DELETE" });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || "Delete failed");
                        toast.success("Draft deleted.");
                        router.push("/dashboard/drafts");
                    } catch (err: any) {
                        console.error("Delete draft error:", err);
                        toast.error(err?.message || "Failed to delete draft.");
                    } finally {
                        toast.dismiss(t);
                    }
                },
            },
        });
    }, [draftId, router]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="w-full text-3xl font-extrabold bg-transparent border-b p-2 focus:outline-none" />

                <div className="flex items-center gap-4">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded p-2 bg-black">
                        <option value="">Select category</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Thumbnail image URL (optional)" className="border rounded p-2 flex-1 bg-black" />

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border rounded p-1 bg-black">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>

                {image ? <div className="mt-3"><img src={image} alt="thumbnail preview" className="w-full max-h-56 object-cover rounded" /></div> : null}
            </div>

            <div>
                <BlogEditor initialHtml={initialDraft.description || ""} onUpdate={handleEditorUpdate} />
            </div>

            <div className="flex gap-3 justify-end items-center">
                <button disabled={isSaving} onClick={saveDraft} className="bg-gray-700 text-white px-4 py-2 rounded">
                    {isSaving ? "Saving…" : "Save Draft"}
                </button>

                <button disabled={isSaving} onClick={publishDraft} className="bg-green-600 text-white px-4 py-2 rounded">
                    {isSaving ? "Publishing…" : "Publish"}
                </button>

                <button disabled={isSaving} onClick={deleteDraft} className="bg-red-600 text-white px-4 py-2 rounded">
                    Delete Draft
                </button>
            </div>
        </div>
    );
}

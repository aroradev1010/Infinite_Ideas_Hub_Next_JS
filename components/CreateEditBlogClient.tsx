"use client";

import React, { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// dynamic import for BlogEditor so server bundles don't include Tiptap
const BlogEditor = dynamic(() => import("./BlogEditor"), { ssr: false });

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
    const [title, setTitle] = useState(initialBlog?.title || "");
    const [category, setCategory] = useState(initialBlog?.category || "");
    const [image, setImage] = useState(initialBlog?.image || "");
    const [status, setStatus] = useState<"published" | "draft">(initialBlog?.status || "draft");
    const [editorHtml, setEditorHtml] = useState(initialBlog?.description || "");
    const [isSaving, setIsSaving] = useState(false);

    // simple categories list — replace with your real categories or fetch from API
    const categories = useMemo(() => ["General", "Tech", "Productivity", "Design", "Uncategorized"], []);

    // Extract HTML from editor via a ref callback (we will use event-based passing)
    // We'll use a temporary DOM element approach: the BlogEditor stores content internally.
    // To get HTML we call a small helper on window (we will emit a CustomEvent from BlogEditor).
    // Simpler: ask BlogEditor to expose global function? Instead, have BlogEditor provide a hidden textarea via querySelector.
    // For simplicity we will ask user to pass initialBlog.description via prop; and on submit we'll query .prose element innerHTML.

    const handleEditorUpdate = useCallback((html: string) => {
        setEditorHtml(html);
    }, []);

    const handleSave = useCallback(
        async (mode: "draft" | "publish") => {
            // mode determines status
            const finalStatus = mode === "publish" ? "published" : "draft";
            const html = editorHtml || "";

            if (!title || title.trim().length < 3) {
                toast.error("Please provide a title (min 3 characters).");
                return;
            }
            if (!html || html.trim().length < 20) {
                toast.error("Please write some content (min 20 characters).");
                return;
            }

            setIsSaving(true);
            try {
                if (initialBlog && initialBlog.id) {
                    // UPDATE flow
                    const res = await fetch(`/api/blog?id=${initialBlog.id}`, {
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
                    toast.success("Blog updated successfully.");
                    // Redirect to dashboard list or view page
                    router.push("/dashboard");
                } else {
                    // CREATE flow
                    const res = await fetch("/api/blog", {
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
                    toast.success("Blog created successfully.");
                    router.push("/dashboard");
                }
            } catch (err: any) {
                console.error("Save blog error:", err);
                toast.error(err.message || "Something went wrong saving the blog.");
            } finally {
                setIsSaving(false);
            }
        },
        [title, image, category, initialBlog, router]
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

                {/* Thumbnail preview */}
                {image ? (
                    <div className="mt-3">
                        <img src={image} alt="thumbnail preview" className="w-full max-h-56 object-cover rounded" />
                    </div>
                ) : null}
            </div>

            <div>
                <BlogEditor initialHtml={initialBlog?.description || ""} onUpdate={handleEditorUpdate} />
            </div>

            <div className="flex gap-3 justify-end">
                <button
                    disabled={isSaving}
                    onClick={() => handleSave("draft")}
                    className="bg-gray-700 text-white px-4 py-2 rounded"
                >
                    {isSaving ? "Saving…" : "Save Draft"}
                </button>

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

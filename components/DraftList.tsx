// components/DraftsList.tsx
"use client";

import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type DraftRow = {
    id: string;
    title: string;
    snippet?: string;
    blogId?: string | null;
    updatedAt?: string;
};

export default function DraftsList({ initialDrafts }: { initialDrafts: DraftRow[] }) {
    const [drafts, setDrafts] = useState(initialDrafts || []);
    const router = useRouter();

    // Edit -> go to draft editor page
    const handleEdit = useCallback(
        (d: DraftRow) => {
            router.push(`/dashboard/drafts/${encodeURIComponent(d.id)}`);
        },
        [router]
    );

    // Delete -> delete the server draft by draftId
    const handleDelete = useCallback(
        async (d: DraftRow) => {
            const id = d.id;
            const t = toast("Delete draft?", {
                description: "This will remove the server copy of the draft.",
                action: {
                    label: "Delete",
                    onClick: async () => {
                        try {
                            const res = await fetch(`/api/drafts?draftId=${encodeURIComponent(id)}`, {
                                method: "DELETE",
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data?.error || "Delete failed");
                            setDrafts((prev) => prev.filter((x) => x.id !== id));
                            toast.success("Draft deleted.");
                        } catch (err) {
                            console.error("Delete draft error:", err);
                            const errorMessage = err instanceof Error ? err.message : "Failed to delete draft.";
                            toast.error(errorMessage);
                        } finally {
                            toast.dismiss(t);
                        }
                    },
                },
            });
        },
        []
    );

    if (!drafts || drafts.length === 0) {
        return <div className="p-6 bg-white rounded shadow text-gray-400">No drafts found.</div>;
    }

    return (
        <div className="space-y-4">
            {drafts.map((d) => (
                <div key={d.id} className="p-4 border rounded bg-gray-900">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold">{d.title || "Untitled draft"}</h3>
                            <p className="text-sm text-gray-400">{d.snippet || ""}</p>
                            <p className="text-xs text-gray-500 mt-2">Saved: {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "-"}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleEdit(d)} className="bg-green-600 px-3 py-1 rounded text-sm">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(d)} className="bg-red-600 px-3 py-1 rounded text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

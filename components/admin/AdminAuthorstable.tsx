"use client";
import React, { useCallback, useState } from "react";
import { toast } from "sonner"; // Sonner toast

type AuthorRow = {
    id: string;
    name?: string;
    bio?: string;
    profileImage?: string;
    slug?: string;
    createdAt?: string;
};

export default function AdminAuthorsTable({ initialAuthors }: { initialAuthors: AuthorRow[] }) {
    const [authors, setAuthors] = useState<AuthorRow[]>(initialAuthors || []);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", bio: "", profileImage: "", slug: "" });
    const [loading, setLoading] = useState(false);

    const startEdit = useCallback((a: AuthorRow) => {
        setEditingId(a.id);
        setForm({ name: a.name || "", bio: a.bio || "", profileImage: a.profileImage || "", slug: a.slug || "" });
    }, []);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setForm({ name: "", bio: "", profileImage: "", slug: "" });
    }, []);

    // ---- UPDATE Author ----
    const saveEdit = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                const res = await fetch("/api/admin/authors", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, updates: form }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Save failed");

                // data.author is normalized (id, createdAt, etc.)
                const updated = data.author;
                setAuthors((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
                cancelEdit();
                toast.success("Author updated successfully.");
            } catch (err: any) {
                toast.error(err.message || "Failed to update author.");
            } finally {
                setLoading(false);
            }
        },
        [form, cancelEdit]
    );

    // ---- DELETE Author ----
    const deleteAuthor = useCallback(
        async (id: string) => {
            // Show toast-based confirmation
            const toastId = toast(
                "Are you sure you want to delete this author?",
                {
                    description: "This will not remove their blogs automatically.",
                    action: {
                        label: "Delete",
                        onClick: async () => {
                            setLoading(true);
                            try {
                                const res = await fetch(`/api/admin/authors?id=${id}`, {
                                    method: "DELETE",
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || "Delete failed");
                                setAuthors((prev) => prev.filter((a) => a.id !== id));
                                toast.success("Author deleted successfully.");
                            } catch (err: any) {
                                toast.error(err.message || "Failed to delete author.");
                            } finally {
                                setLoading(false);
                                toast.dismiss(toastId);
                            }
                        },
                    },
                }
            );
        },
        []
    );

    return (
        <div className="space-y-6">


            <div className="bg-black rounded shadow overflow-x-auto">
                <table className="min-w-full text-left text-white">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Bio</th>
                            <th className="p-3">Slug</th>
                            <th className="p-3">Created</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {authors.map((a) =>
                            editingId === a.id ? (
                                <tr key={a.id} className="border-t border-gray-700">
                                    <td className="p-3">
                                        <input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="border p-2 w-full rounded text-white"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            value={form.bio}
                                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                            className="border p-2 w-full rounded text-white"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            className="border p-2 w-full rounded text-white"
                                        />
                                    </td>
                                    <td className="p-3">{a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</td>
                                    <td className="p-3 space-x-2">
                                        <button type="button" onClick={() => saveEdit(a.id)} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">
                                            Save
                                        </button>
                                        <button type="button" onClick={cancelEdit} className="bg-gray-400 text-white px-3 py-1 rounded">
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={a.id} className="border-t border-gray-700">
                                    <td className="p-3">{a.name}</td>
                                    <td className="p-3">{a.bio ? (a.bio.length > 80 ? a.bio.slice(0, 77) + "..." : a.bio) : "-"}</td>
                                    <td className="p-3">{a.slug}</td>
                                    <td className="p-3">{a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}</td>
                                    <td className="p-3 space-x-2">
                                        <button type="button" onClick={() => startEdit(a)} className="bg-yellow-600 text-white px-3 py-1 rounded">
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => deleteAuthor(a.id)} disabled={loading} className="bg-red-600 text-white px-3 py-1 rounded">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

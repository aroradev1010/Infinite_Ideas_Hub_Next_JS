"use client";
import React, { useCallback, useState } from "react";
import { toast } from "sonner"; // ✅ import Sonner toast

type AuthorRow = {
    id: string;
    name?: string;
    bio?: string;
    profileImage?: string;
    slug?: string;
    createdAt?: string;
};

type CreateFormProps = {
    createForm: { name: string; bio: string; profileImage: string; slug: string };
    setCreateForm: (v: any) => void;
    onCreate: () => Promise<void>;
    loading: boolean;
};

function CreateForm({ createForm, setCreateForm, onCreate, loading }: CreateFormProps) {
    return (
        <div className="bg-black rounded shadow p-4 mb-6">
            <h3 className="font-semibold mb-2 text-white">Create New Author</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    type="text"
                    name="name"
                    className="border p-2 rounded"
                    placeholder="Name *"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
                <input
                    type="text"
                    name="profileImage"
                    className="border p-2 rounded"
                    placeholder="Profile Image URL"
                    value={createForm.profileImage}
                    onChange={(e) => setCreateForm({ ...createForm, profileImage: e.target.value })}
                />
                <input
                    type="text"
                    name="slug"
                    className="border p-2 rounded"
                    placeholder="Slug (optional)"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                />
            </div>
            <textarea
                name="bio"
                className="border p-2 rounded w-full mt-3"
                placeholder="Short bio (optional)"
                value={createForm.bio}
                onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
            />
            <div className="mt-3">
                <button
                    type="button"
                    onClick={onCreate}
                    disabled={loading}
                    className="bg-green-600 text-white px-3 py-2 rounded"
                >
                    {loading ? "Creating..." : "Create Author"}
                </button>
            </div>
        </div>
    );
}

export default function AdminAuthorsTable({ initialAuthors }: { initialAuthors: AuthorRow[] }) {
    const [authors, setAuthors] = useState<AuthorRow[]>(initialAuthors || []);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", bio: "", profileImage: "", slug: "" });
    const [createForm, setCreateForm] = useState({ name: "", bio: "", profileImage: "", slug: "" });
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
                setAuthors((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.author } : p)));
                cancelEdit();
                toast.success("Author updated successfully."); // ✅ success toast
            } catch (err: any) {
                toast.error(err.message || "Failed to update author."); // ❌ error toast
            } finally {
                setLoading(false);
            }
        },
        [form, cancelEdit]
    );

    // ---- DELETE Author ----
    const deleteAuthor = useCallback(
        async (id: string) => {
            // Show toast-based confirmation instead of browser confirm()
            const confirmToast = toast(
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
                                toast.dismiss(confirmToast); // Close confirmation toast
                            }
                        },
                    },
                }
            );
        },
        []
    );


    // ---- CREATE Author ----
    const createAuthor = useCallback(async () => {
        if (!createForm.name || createForm.name.trim().length < 2) {
            toast.error("Name is required (min 2 characters)");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/admin/authors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(createForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Create failed");

            const created = data.author;
            const newAuthor: AuthorRow = {
                id: created._id?.toString?.() || created.id || String(created._id),
                name: created.name,
                bio: created.bio,
                profileImage: created.profileImage,
                slug: created.slug,
                createdAt: created.createdAt,
            };
            setAuthors((prev) => [newAuthor, ...prev]);
            setCreateForm({ name: "", bio: "", profileImage: "", slug: "" });
            toast.success("Author created successfully."); // ✅ success toast
        } catch (err: any) {
            toast.error(err.message || "Failed to create author."); // ❌ error toast
        } finally {
            setLoading(false);
        }
    }, [createForm]);

    return (
        <div className="space-y-6">
            <CreateForm createForm={createForm} setCreateForm={setCreateForm} onCreate={createAuthor} loading={loading} />

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
                                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 w-full rounded text-white" />
                                    </td>
                                    <td className="p-3">
                                        <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="border p-2 w-full rounded text-white" />
                                    </td>
                                    <td className="p-3">
                                        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="border p-2 w-full rounded text-white" />
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

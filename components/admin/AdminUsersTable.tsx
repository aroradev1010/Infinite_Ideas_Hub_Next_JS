"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string;
    createdAt: string;
};

export default function AdminUsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
    const [users, setUsers] = useState<UserRow[]>(initialUsers);
    const [loading, setLoading] = useState<string | null>(null);

    const promoteUser = useCallback(async (userId: string) => {
        setLoading(userId);
        try {
            const res = await fetch("/api/admin/authors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Promotion failed");
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: "author" } : u))
            );
            toast.success(`${data.author?.name || "User"} promoted to Author`);
        } catch (err: any) {
            toast.error(err.message || "Failed to promote user.");
        } finally {
            setLoading(null);
        }
    }, []);

    const deleteUser = useCallback(async (userId: string, userName: string) => {
        // Simple inline confirm — replace with a Dialog if you want fancier UX
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;

        setLoading(userId);
        try {
            const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Delete failed");

            // Remove from local state immediately
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            toast.success(`User "${userName}" deleted.`);
        } catch (err: any) {
            toast.error(err.message || "Failed to delete user.");
        } finally {
            setLoading(null);
        }
    }, []);

    const renderRoleBadge = (role: string) => {
        const colors =
            role === "admin"
                ? "bg-red-700 text-red-100"
                : role === "author"
                    ? "bg-green-700 text-green-100"
                    : "bg-gray-700 text-gray-100";
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${colors}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="bg-black rounded shadow overflow-x-auto">
            <table className="min-w-full text-left text-white">
                <thead className="bg-gray-900">
                    <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id} className="border-t border-gray-800">
                            <td className="p-3 flex items-center gap-3">
                                <Image
                                    src={u.image || "/fallback.avif"}
                                    alt={u.name}
                                    width={36}
                                    height={36}
                                    className="rounded-full object-cover"
                                />
                                <span>{u.name || "Unnamed User"}</span>
                            </td>
                            <td className="p-3">{u.email}</td>
                            <td className="p-3">{renderRoleBadge(u.role)}</td>
                            <td className="p-3">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="p-3">
                                <div className="flex items-center gap-2">
                                    {/* Promote button — only for plain users */}
                                    {u.role === "user" && (
                                        <button
                                            onClick={() => promoteUser(u.id)}
                                            disabled={loading === u.id}
                                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                                        >
                                            {loading === u.id ? "Working…" : "Promote"}
                                        </button>
                                    )}

                                    {/* Delete button — not shown for admins (protect against self-delete) */}
                                    {u.role !== "admin" && (
                                        <button
                                            onClick={() => deleteUser(u.id, u.name || u.email)}
                                            disabled={loading === u.id}
                                            className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
                                        >
                                            {loading === u.id ? "Working…" : "Delete"}
                                        </button>
                                    )}

                                    {u.role === "admin" && (
                                        <span className="text-gray-500 italic text-sm">Protected</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {users.length === 0 && (
                <p className="text-center py-8 text-gray-500">No users found.</p>
            )}
        </div>
    );
}
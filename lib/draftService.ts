/**
 * Client-side wrapper around /api/drafts.
 *
 * FIX 1: saveDraft() now uses PATCH when draftId is provided,
 *         instead of always using POST (which created duplicate drafts).
 *
 * FIX 2: image field is sent as-is — the server schema was rejecting
 *         non-URL strings like relative paths or empty strings from
 *         published blogs.
 */

type DraftBody = {
  draftId?: string;
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  status?: "draft" | "published";
  blogId?: string | null;
};

export async function saveDraft(body: DraftBody) {
  try {
    const hasDraftId = Boolean(body.draftId);

    // Use PATCH to update an existing draft, POST to create a new one
    const method = hasDraftId ? "PATCH" : "POST";

    const res = await fetch("/api/drafts", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || "Failed to save draft" };
    return { ok: true, draft: data?.draft ?? null };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

export async function getDrafts() {
  try {
    const res = await fetch("/api/drafts");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || "Failed to fetch drafts" };
    return { ok: true, drafts: data?.drafts ?? [] };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

export async function getDraft(draftId: string) {
  try {
    const res = await fetch(`/api/drafts?draftId=${encodeURIComponent(draftId)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || "Failed to fetch draft" };
    return { ok: true, draft: data?.draft ?? null };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

export async function deleteDraft(draftId: string) {
  try {
    const res = await fetch(`/api/drafts?draftId=${encodeURIComponent(draftId)}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || "Failed to delete draft" };
    return { ok: true, deletedCount: data?.deletedCount ?? 0 };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}
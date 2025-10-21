// lib/draftService.ts
/**
 * Small client-side wrapper around /api/drafts.
 * Returns { ok, draft?, drafts?, error? }
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
    const res = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return { ok: false, error: data?.error || "Failed to save draft" };
    return { ok: true, draft: data?.draft ?? null };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

export async function getDrafts() {
  try {
    const res = await fetch("/api/drafts");
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return { ok: false, error: data?.error || "Failed to fetch drafts" };
    return { ok: true, drafts: data?.drafts ?? [] };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

export async function getDraft(draftId: string) {
  try {
    const res = await fetch(
      `/api/drafts?draftId=${encodeURIComponent(draftId)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return { ok: false, error: data?.error || "Failed to fetch draft" };
    return { ok: true, draft: data?.draft ?? null };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

export async function deleteDraft(draftId: string) {
  try {
    const res = await fetch(
      `/api/drafts?draftId=${encodeURIComponent(draftId)}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return { ok: false, error: data?.error || "Failed to delete draft" };
    return { ok: true, deletedCount: data?.deletedCount ?? 0 };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

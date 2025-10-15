// lib/draftService.ts
export type DraftPayload = {
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  status?: "draft" | "published";
  blogId?: string | null;
};

export async function saveDraft(payload: DraftPayload) {
  const res = await fetch("/api/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getDraft(blogId?: string | null) {
  const url = blogId
    ? `/api/drafts?blogId=${encodeURIComponent(blogId)}`
    : `/api/drafts`;
  const res = await fetch(url);
  return res.json();
}

export async function deleteDraft(blogId?: string | null) {
  const url = blogId
    ? `/api/drafts?blogId=${encodeURIComponent(blogId)}`
    : `/api/drafts`;
  const res = await fetch(url, { method: "DELETE" });
  return res.json();
}

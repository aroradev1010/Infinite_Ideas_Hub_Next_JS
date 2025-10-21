// lib/blogService.client.ts
/**
 * Client-side wrapper around /api/blog endpoints.
 * Use this ONLY in client components or hooks.
 */

import type { Blog, BlogInput } from "@/types/blogType";
import type { ApiResponse } from "@/types/db";

/**
 * Utility: Safely parse JSON body from a fetch Response.
 * Avoids runtime errors when response is empty or malformed.
 */
async function safeJson<T = any>(res: Response): Promise<T | {}> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/* ------------------------------------------------------
   CREATE blog
   ------------------------------------------------------ */
export async function createBlog(body: BlogInput): Promise<ApiResponse<Blog>> {
  try {
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const parsed = (await safeJson(res)) as ApiResponse<
      Partial<Blog> & { blog?: Blog; data?: Blog; error?: string }
    >;

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: parsed?.error || "Failed to create blog",
      };
    }

    return {
      ok: true,
      status: res.status,
      // prefer parsed.data, fallback to parsed.blog, otherwise undefined (not null)
      data: (parsed?.data as Blog) ?? (parsed?.blog as Blog) ?? undefined,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

/* ------------------------------------------------------
   UPDATE blog
   ------------------------------------------------------ */
export async function updateBlog(
  blogId: string,
  body: BlogInput
): Promise<ApiResponse<Blog>> {
  try {
    const res = await fetch(`/api/blog?id=${encodeURIComponent(blogId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const parsed = (await safeJson(res)) as ApiResponse<
      Partial<Blog> & { blog?: Blog; data?: Blog; error?: string }
    >;

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: parsed?.error || "Failed to update blog",
      };
    }

    return {
      ok: true,
      status: res.status,
      data: (parsed?.data as Blog) ?? (parsed?.blog as Blog) ?? undefined,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Network error" };
  }
}

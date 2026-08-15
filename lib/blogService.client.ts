import type { BlogInput, EditableBlog } from "@/types/blogType"
import type { ApiResponse } from "@/types/db"

interface ErrorBody {
  error?: string
}

async function safeJson(response: Response): Promise<unknown> {
  const body = await response.text()
  if (!body) return {}

  try {
    return JSON.parse(body)
  } catch {
    return {}
  }
}

function messageFrom(value: unknown, fallback: string): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ErrorBody).error === "string"
  ) {
    return (value as ErrorBody).error ?? fallback
  }

  return fallback
}

function networkError(error: unknown): ApiResponse<never> {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Network error",
  }
}

async function writeBlog(
  url: string,
  method: "POST" | "PATCH",
  body: BlogInput
): Promise<ApiResponse<EditableBlog>> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const parsed = await safeJson(response)

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: messageFrom(parsed, "Failed to save post"),
      }
    }

    return parsed as ApiResponse<EditableBlog>
  } catch (error) {
    return networkError(error)
  }
}

export function createBlog(
  body: BlogInput
): Promise<ApiResponse<EditableBlog>> {
  return writeBlog("/api/blog", "POST", body)
}

export function updateBlog(
  blogId: string,
  body: BlogInput
): Promise<ApiResponse<EditableBlog>> {
  return writeBlog(
    `/api/blog?id=${encodeURIComponent(blogId)}`,
    "PATCH",
    body
  )
}

export async function deleteBlog(
  blogId: string
): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(
      `/api/blog?id=${encodeURIComponent(blogId)}`,
      { method: "DELETE" }
    )
    const parsed = await safeJson(response)

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: messageFrom(parsed, "Failed to delete post"),
      }
    }

    return { ok: true, status: response.status, data: null }
  } catch (error) {
    return networkError(error)
  }
}

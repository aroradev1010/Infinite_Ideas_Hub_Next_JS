import { ObjectId } from "mongodb"
import type { SerializedEditorState } from "lexical"
import { z } from "zod"

import {
  createBlog,
  deleteBlog,
  updateBlog,
} from "@/lib/blogService.server"
import { isBlogCategory } from "@/lib/blogCategories"
import { requireRole } from "@/lib/requireRole"
import type { BlogInput } from "@/types/blogType"

export const runtime = "nodejs"

const MAX_REQUEST_BYTES = 8 * 1024 * 1024

const blogInputSchema = z
  .object({
    title: z.string().max(200),
    editorState: z
      .object({
        root: z
          .object({
            type: z.literal("root"),
            children: z.array(z.unknown()),
          })
          .passthrough(),
      })
      .passthrough(),
    image: z.string().max(6 * 1024 * 1024),
    category: z
      .string()
      .max(100)
      .refine(isBlogCategory, "Unsupported category"),
    status: z.enum(["draft", "published"]),
  })
  .strict()

async function readBlogInput(request: Request): Promise<BlogInput | Response> {
  const contentLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return Response.json(
      { ok: false, error: "Request body is too large" },
      { status: 413 }
    )
  }

  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
    return Response.json(
      { ok: false, error: "Request body is too large" },
      { status: 413 }
    )
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return Response.json(
      { ok: false, error: "Request body must be valid JSON" },
      { status: 400 }
    )
  }

  const parsed = blogInputSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Invalid payload",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  return {
    ...parsed.data,
    editorState: parsed.data.editorState as unknown as SerializedEditorState,
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["author", "admin"])
    const input = await readBlogInput(request)
    if (input instanceof Response) return input

    const result = await createBlog(input, session.user.id)
    return Response.json(result, { status: result.status ?? 500 })
  } catch (error) {
    if (error instanceof Response) return error
    console.error("POST /api/blog error:", error)
    return Response.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireRole(["author", "admin"])
    const id = new URL(request.url).searchParams.get("id")
    if (!id || !ObjectId.isValid(id)) {
      return Response.json(
        { ok: false, error: "Invalid id" },
        { status: 400 }
      )
    }

    const input = await readBlogInput(request)
    if (input instanceof Response) return input

    const result = await updateBlog(
      id,
      input,
      session.user.role === "admin" ? undefined : session.user.id
    )
    return Response.json(result, { status: result.status ?? 500 })
  } catch (error) {
    if (error instanceof Response) return error
    console.error("PATCH /api/blog error:", error)
    return Response.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireRole(["author", "admin"])
    const id = new URL(request.url).searchParams.get("id")
    if (!id || !ObjectId.isValid(id)) {
      return Response.json(
        { ok: false, error: "Invalid id" },
        { status: 400 }
      )
    }

    const result = await deleteBlog(
      id,
      session.user.role === "admin" ? undefined : session.user.id
    )
    return Response.json(result, { status: result.status ?? 500 })
  } catch (error) {
    if (error instanceof Response) return error
    console.error("DELETE /api/blog error:", error)
    return Response.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

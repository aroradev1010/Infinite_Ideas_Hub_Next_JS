import type { SerializedEditorState } from "lexical"
import { z } from "zod"

import {
  InvalidSerializedEditorStateError,
  renderSerializedEditorStateToHtml,
} from "@/lib/editor/serialization.server"
import { isPreviewRequest } from "@/lib/previewRequest.server"
import { requireRole } from "@/lib/requireRole"

export const runtime = "nodejs"

const MAX_PREVIEW_REQUEST_BYTES = 8 * 1024 * 1024

const previewSchema = z
  .object({
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
  })
  .strict()

function errorResponse(error: unknown): Response {
  if (error instanceof InvalidSerializedEditorStateError) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 400 }
    )
  }

  console.error("POST /api/blog/preview error:", error)
  return Response.json(
    { ok: false, error: "Unable to generate preview" },
    { status: 500 }
  )
}

export async function POST(request: Request) {
  try {
    const previewAllowed = await isPreviewRequest()
    if (!previewAllowed) {
      await requireRole(["author", "admin"])
    }

    const contentLength = Number(request.headers.get("content-length"))
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_PREVIEW_REQUEST_BYTES
    ) {
      return Response.json(
        { ok: false, error: "Request body is too large" },
        { status: 413 }
      )
    }

    const rawBody = await request.text()
    if (Buffer.byteLength(rawBody, "utf8") > MAX_PREVIEW_REQUEST_BYTES) {
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

    const parsed = previewSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "Invalid preview payload" },
        { status: 400 }
      )
    }

    const contentHtml = renderSerializedEditorStateToHtml(
      parsed.data.editorState as unknown as SerializedEditorState
    )

    return Response.json({ ok: true, contentHtml })
  } catch (error) {
    if (error instanceof Response) return error
    return errorResponse(error)
  }
}

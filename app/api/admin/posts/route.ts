import {
  deleteBlog,
  getAllBlogsForAdmin,
  updateBlogStatus,
} from "@/lib/blogService.server"
import { requireRole } from "@/lib/requireRole"
import { z } from "zod"

export const runtime = "nodejs"

const actionSchema = z
  .object({
    id: z.string().min(1),
    action: z.enum(["publish", "unpublish", "delete"]),
  })
  .strict()

export async function GET() {
  try {
    await requireRole(["admin"])
    const posts = await getAllBlogsForAdmin()
    return Response.json({ ok: true, data: posts })
  } catch (error) {
    if (error instanceof Response) return error
    console.error("Admin GET posts error:", error)
    return Response.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(["admin"])
    const parsed = actionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      )
    }

    const { id, action } = parsed.data
    if (action === "delete") {
      const result = await deleteBlog(id)
      return Response.json(result, { status: result.status ?? 500 })
    }

    const status = action === "publish" ? "published" : "draft"
    const result = await updateBlogStatus(id, status)
    return Response.json(
      result.ok
        ? { ok: true, data: { id, status: result.data?.status ?? status } }
        : result,
      { status: result.status ?? 500 }
    )
  } catch (error) {
    if (error instanceof Response) return error
    console.error("Admin PATCH posts error:", error)
    return Response.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

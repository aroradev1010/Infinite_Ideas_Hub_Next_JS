// app/api/blogs/route.ts
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { createBlog, updateBlog } from "@/lib/blogService.server";
import { ObjectId } from "mongodb";
import type { ApiResponse } from "@/types/db";
import type { Blog } from "@/types/blogType";

import {
  convertEditorStateToHtml,
  sanitizeHtmlString,
  makeJsonResponse,
} from "@/lib/blogUtils.server";

/* ------------------ Validation schemas ------------------ */
const createSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  image: z.string().optional().nullable(),
  category: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  image: z.string().optional().nullable(),
  category: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

/* ------------------ POST: create blog ------------------ */
export async function POST(req: Request) {
  try {
    const session = await requireRole(["author", "admin"]);
    const authorUserId = session.user.id;

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return makeJsonResponse(
        { ok: false, error: "Invalid payload", details: parsed.error.format() },
        400
      );
    }

    const input = parsed.data;

    // Input description may be serialized JSON or HTML string.
    let rawDescription = input.description || "";
    let maybeHtml = "";

    if (typeof rawDescription === "string") {
      const trimmed = rawDescription.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsedState = JSON.parse(trimmed);
          maybeHtml = convertEditorStateToHtml(parsedState);
        } catch (e) {
          maybeHtml = rawDescription;
        }
      } else {
        maybeHtml = rawDescription;
      }
    } else if (typeof rawDescription === "object") {
      maybeHtml = convertEditorStateToHtml(rawDescription);
    } else {
      maybeHtml = String(rawDescription || "");
    }

    // sanitize final HTML
    const cleanDescription = sanitizeHtmlString(maybeHtml);

    const image = typeof input.image === "string" ? input.image.trim() : "";
    const category = input.category ?? "Uncategorized";
    const status = input.status ?? "draft";
    const slug = input.slug ?? undefined;

    const resp: ApiResponse<Blog> = await createBlog(
      {
        title: input.title,
        description: cleanDescription,
        image,
        category,
        slug,
        status,
      },
      authorUserId
    );

    if (!resp.ok) {
      const code = resp.status ?? 500;
      return makeJsonResponse(
        { ok: false, error: resp.error ?? "Failed to create blog" },
        code
      );
    }

    const statusCode = resp.status ?? 201;
    return makeJsonResponse({ ok: true, data: resp.data ?? null }, statusCode);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/blogs error:", err);
    return makeJsonResponse({ ok: false, error: "Internal Server Error" }, 500);
  }
}

/* ------------------ PATCH: update existing blog ------------------ */
export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["author", "admin"]);
    const authorUserId = session.user.id;

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
      return makeJsonResponse({ ok: false, error: "Invalid id" }, 400);
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return makeJsonResponse(
        { ok: false, error: "Invalid payload", details: parsed.error.format() },
        400
      );
    }

    const updatesRaw = parsed.data;
    const updates: any = {};

    if (typeof updatesRaw.description === "string") {
      const rawDescription = updatesRaw.description;
      let maybeHtml = "";
      const trimmed = rawDescription.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          const parsedState = JSON.parse(trimmed);
          maybeHtml = convertEditorStateToHtml(parsedState);
        } catch (e) {
          maybeHtml = rawDescription;
        }
      } else {
        maybeHtml = rawDescription;
      }
      updates.description = sanitizeHtmlString(maybeHtml);
    }

    if (typeof updatesRaw.title === "string") updates.title = updatesRaw.title;
    if (typeof updatesRaw.image === "string")
      updates.image = updatesRaw.image.trim() || "";
    if (typeof updatesRaw.category === "string")
      updates.category = updatesRaw.category || "Uncategorized";
    if (typeof updatesRaw.slug === "string") updates.slug = updatesRaw.slug;
    if (typeof updatesRaw.status === "string")
      updates.status = updatesRaw.status;

    if (Object.keys(updates).length === 0) {
      return makeJsonResponse(
        { ok: false, error: "No updatable fields provided" },
        400
      );
    }

    updates.updatedAt = new Date();

    const resp: ApiResponse<Blog> = await updateBlog(id, updates, authorUserId);

    if (!resp.ok) {
      if (resp.status === 403 || (resp.error && /forbid/i.test(resp.error))) {
        return makeJsonResponse(
          { ok: false, error: resp.error ?? "Forbidden" },
          403
        );
      }
      const code = resp.status ?? 400;
      return makeJsonResponse(
        { ok: false, error: resp.error ?? "Failed to update blog" },
        code
      );
    }

    const statusCode = resp.status ?? 200;
    return makeJsonResponse({ ok: true, data: resp.data ?? null }, statusCode);
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("PATCH /api/blogs error:", err);
    return makeJsonResponse({ ok: false, error: "Internal Server Error" }, 500);
  }
}

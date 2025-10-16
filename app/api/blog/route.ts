// app/api/blogs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { createBlog } from "@/lib/blogService";
import sanitizeHtml from "sanitize-html";
import he from "he";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/* ------------------ Validation schemas ------------------ */
const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  image: z.string().url().or(z.literal("")).optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(0).optional(),
  image: z.string().url().or(z.literal("")).optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

/* ------------------ Sanitizer options ------------------ */
const sanitizerOpts = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "figure",
    "h1",
    "h2",
    "h3",
  ]),
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  transformTags: {
    // annotated parameter types to avoid TS 'implicitly any' errors
    a: (tagName: string, attribs: Record<string, any>) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
    }),
  },
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
    a: ["http", "https", "mailto"],
  },
};

/* ------------------ POST: create blog ------------------ */
export async function POST(req: Request) {
  try {
    // Ensure author or admin
    const session = await requireRole(["author", "admin"]);
    const authorUserId = session.user.id; // users._id as string

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // --- SANITIZE DESCRIPTION (decode entities then sanitize) ---
    const decoded = he.decode(input.description || "");
    const cleanDescription = sanitizeHtml(decoded, sanitizerOpts);

    // normalize optional fields
    const image = input.image ?? "";
    const category = input.category ?? "Uncategorized";
    const status = input.status ?? "draft";
    const slug = input.slug ?? undefined;

    // Create blog via service (service should link authorUserId -> authorId)
    const blog = await createBlog(
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

    

    if (!blog) {
      return NextResponse.json(
        { error: "Failed to create blog. Ensure you are an author." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, blog }, { status: 201 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/blogs error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ------------------ PATCH: update existing blog ------------------ */
/**
 * PATCH /api/blogs?id=<blogId>
 * Body: partial fields to update (title, description, image, category, status, slug)
 */
export async function PATCH(req: Request) {
  try {
    // ensure author or admin
    await requireRole(["author", "admin"]);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updatesRaw = parsed.data;
    const updates: any = {};

    // sanitize description if provided
    if (typeof updatesRaw.description === "string") {
      const decoded = he.decode(updatesRaw.description || "");
      updates.description = sanitizeHtml(decoded, sanitizerOpts);
    }

    if (typeof updatesRaw.title === "string") updates.title = updatesRaw.title;
    if (typeof updatesRaw.image === "string")
      updates.image = updatesRaw.image || "";
    if (typeof updatesRaw.category === "string")
      updates.category = updatesRaw.category || "Uncategorized";
    if (typeof updatesRaw.slug === "string") updates.slug = updatesRaw.slug;
    if (typeof updatesRaw.status === "string")
      updates.status = updatesRaw.status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // perform update
    const result = await db
      .collection("blogs")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    

    // return the updated blog (minimal projection to avoid leaking)
    const updated = {
      id: result._id.toString(),
      title: result.title,
      description: result.description,
      image: result.image,
      category: result.category,
      slug: result.slug,
      status: result.status,
      createdAt: result.createdAt?.toISOString?.() ?? null,
      updatedAt: result.updatedAt?.toISOString?.() ?? null,
    };

    return NextResponse.json({ ok: true, blog: updated }, { status: 200 });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("PATCH /api/blogs error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

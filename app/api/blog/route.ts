// app/api/blogs/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { createBlog } from "@/lib/blogService";
import sanitizeHtml from "sanitize-html";
import he from "he";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  image: z.string().url().or(z.literal("")).optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

export async function POST(req: Request) {
  try {
    // Ensure author or admin
    const session = await requireRole(["author", "admin"]);
    const authorUserId = session.user.id; // this is the users._id string

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
    // decode any HTML entities first (defense against double-encoding)
    const decoded = he.decode(input.description || "");

    // sanitize with a conservative allowlist; tweak allowedTags/attributes as needed
    const cleanDescription = sanitizeHtml(decoded, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
        "h3",
        "figure",
      ]),
      allowedAttributes: {
        a: ["href", "name", "target", "rel"],
        img: ["src", "alt", "width", "height"],
      },
      transformTags: {
        a: (tagName: string, attribs: Record<string, string>) => ({
          tagName,
          attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
        }),
      },
      allowedSchemesByTag: {
        img: ["http", "https", "data"],
        a: ["http", "https", "mailto"],
      },
    });


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

    console.log("Created blog:", blog);

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

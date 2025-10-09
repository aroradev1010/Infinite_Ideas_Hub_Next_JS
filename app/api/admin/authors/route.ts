// app/api/admin/authors/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";
import { getAllAuthorsForAdmin } from "@/lib/authorService";
import { logAudit } from "@/lib/auditService";

/* --------------------------------- utilities --------------------------------- */
// simple server-side slugify (small, dependency-free)
function makeSlug(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

/* -------------------------------------------------------------------------- */
/*                           GET: list authors                                 */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    // final auth check for the API
    await requireRole(["admin"]);

    const authors = await getAllAuthorsForAdmin();
    return NextResponse.json(authors);
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    console.error("Admin GET authors error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const postSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
  slug: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Authorize and get session (so we have admin id)
    const session = await requireRole(["admin"]);
    const adminId = session?.user?.id ?? null;

    // Validate body
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }
    const {
      userId,
      email,
      name,
      bio = "",
      profileImage = "",
      slug,
    } = parsed.data;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Find the user either by userId or email
    let user: any = null;
    if (userId) {
      try {
        user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(userId) });
      } catch (err) {
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
      }
    } else if (email) {
      user = await db.collection("users").findOne({ email });
    } else {
      return NextResponse.json(
        { error: "Either userId or email is required" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "No user found with given identifier" },
        { status: 404 }
      );
    }

    // If already an author for this user, return existing
    const existingAuthor = await db
      .collection("authors")
      .findOne({ userId: user._id });
    if (existingAuthor) {
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            role: "author",
            name: name || user.name,
            image: profileImage || user.image,
            updatedAt: new Date(),
          },
        }
      );
      return NextResponse.json(
        {
          ok: true,
          message: "User is already an author",
          author: {
            id: existingAuthor._id.toString(),
            name: existingAuthor.name,
            slug: existingAuthor.slug,
            profileImage: existingAuthor.profileImage,
            bio: existingAuthor.bio,
            createdAt: existingAuthor.createdAt?.toISOString?.() || "",
          },
        },
        { status: 200 }
      );
    }

    // slug generation
    let baseSlug = slug
      ? makeSlug(slug)
      : makeSlug(name || user.name || `author-${Date.now()}`);
    if (!baseSlug) baseSlug = `author-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 1;
    while (await db.collection("authors").findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
      if (counter > 1000) break;
    }

    // Promote the user -> author (idempotent)
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          role: "author",
          name: name || user.name,
          image: profileImage || user.image,
          updatedAt: new Date(),
        },
      }
    );

    // Insert author doc linked to userId
    const now = new Date();
    const insertDoc: any = {
      name: name || user.name || "",
      email: user.email,
      bio,
      profileImage: profileImage || user.image || "",
      slug: finalSlug,
      userId: user._id,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await db.collection("authors").insertOne(insertDoc);
    const created = await db
      .collection("authors")
      .findOne({ _id: insertResult.insertedId });

    if (!created) {
      return NextResponse.json(
        { error: "Could not find entry" },
        { status: 404 }
      );
    }

    // Write audit log (non-blocking if it fails — logAudit catches errors)
    try {
      await logAudit({
        action: "promote_user_to_author",
        by: String(adminId ?? null),
        targetId: String(user._id),
        targetType: "user",
        meta: {
          authorId: created._id.toString(),
          promotedName: created.name,
          promotedEmail: created.email,
        },
        createdAt: new Date(),
      });
    } catch (e) {
      // logAudit already catches and logs; this is just an extra safety net
      console.error("[Audit] logging failed:", e);
    }

    return NextResponse.json(
      {
        ok: true,
        author: {
          id: created._id.toString(),
          name: created.name,
          bio: created.bio,
          profileImage: created.profileImage,
          slug: created.slug,
          createdAt: created.createdAt?.toISOString?.() ?? "",
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("Admin POST authors error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// app/api/admin/authors/route.ts
/* ----------------------------- (existing imports above) ----------------------------- */
/* keep the top of your file as-is (imports, GET, POST) */

/* -------------------------------------------------------------------------- */
/*                     PATCH: update author details (existing)                */
/* -------------------------------------------------------------------------- */
const patchSchema = z.object({
  id: z.string().min(1),
  updates: z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export async function PATCH(req: Request) {
  try {
    await requireRole(["admin"]);

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { id, updates } = parsed.data;
    const _id = new ObjectId(id);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Update author
    await db
      .collection("authors")
      .updateOne({ _id }, { $set: { ...updates, updatedAt: new Date() } });

    // If name or slug changed, update denormalized fields in blogs
    const updateBlogFields: any = {};
    if (updates.name) updateBlogFields.authorName = updates.name;
    if (updates.slug) updateBlogFields.authorSlug = updates.slug;
    if (Object.keys(updateBlogFields).length > 0) {
      await db
        .collection("blogs")
        .updateMany({ authorId: _id }, { $set: updateBlogFields });
    }

    // Fetch updated author with safe projection and normalize result
    const authorDoc = await db.collection("authors").findOne(
      { _id },
      {
        projection: {
          name: 1,
          bio: 1,
          profileImage: 1,
          slug: 1,
          createdAt: 1,
        },
      }
    );

    if (!authorDoc) {
      return NextResponse.json(
        { error: "Author not found after update" },
        { status: 404 }
      );
    }

    const normalized = {
      id: authorDoc._id.toString(),
      name: authorDoc.name,
      bio: authorDoc.bio,
      profileImage: authorDoc.profileImage,
      slug: authorDoc.slug,
      createdAt: authorDoc.createdAt?.toISOString?.() ?? "",
    };

    return NextResponse.json({ ok: true, author: normalized });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    console.error("Admin PATCH authors error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                     DELETE: Remove author (hard delete)                     */
/* -------------------------------------------------------------------------- */
const deleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: Request) {
  try {
    await requireRole(["admin"]);

    // Extract and validate ID from query params
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const parsed = deleteSchema.safeParse({ id });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const validatedId = parsed.data.id;
    const _id = new ObjectId(validatedId);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Option: you may want to handle blogs by this author (reassign or flag)
    await db.collection("authors").deleteOne({ _id });

    return NextResponse.json({ ok: true, id: validatedId });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    console.error("Admin DELETE authors error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

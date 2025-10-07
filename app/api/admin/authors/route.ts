// app/api/admin/authors/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

/* ----------------------------- helper requireAdmin ---------------------------- */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

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
    await requireAdmin();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const authors = await db
      .collection("authors")
      .find({})
      .sort({ createdAt: -1 })
      .project({
        name: 1,
        bio: 1,
        profileImage: 1,
        slug: 1,
        createdAt: 1,
      })
      .toArray();

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

/* -------------------------------------------------------------------------- */
/*                          POST: create new author                            */
/* -------------------------------------------------------------------------- */
const postSchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
  slug: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { name, bio = "", profileImage = "", slug } = parsed.data;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // generate slug if not provided
    let baseSlug = slug ? makeSlug(slug) : makeSlug(name);
    if (!baseSlug) baseSlug = `author-${Date.now()}`;

    // ensure slug uniqueness: add suffix if necessary
    let finalSlug = baseSlug;
    let counter = 1;
    while (await db.collection("authors").findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
      // safety cap
      if (counter > 1000) break;
    }

    const now = new Date();
    const insert = {
      name,
      bio,
      profileImage,
      slug: finalSlug,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("authors").insertOne(insert);
    const created = await db
      .collection("authors")
      .findOne(
        { _id: result.insertedId },
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

    return NextResponse.json({ ok: true, author: created }, { status: 201 });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    console.error("Admin POST authors error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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
    await requireAdmin();

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

    const author = await db.collection("authors").findOne(
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

    return NextResponse.json({ ok: true, author });
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
    await requireAdmin();

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

    // Option: before deleting, consider handling blogs by this author
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

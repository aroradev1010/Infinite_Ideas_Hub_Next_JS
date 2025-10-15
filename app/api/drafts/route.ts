// app/api/drafts/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireRole } from "@/lib/requireRole";

/**
 * Draft schema - saved fields:
 * userId, title, description (sanitized on publish), image, category, status,
 * blogId (optional), createdAt, updatedAt
 */

// POST validation (create new draft or upsert by blogId)
const postSchema = z.object({
  title: z.string().min(0).optional(),
  description: z.string().min(0).optional(),
  image: z.string().url().or(z.literal("")).optional(),
  category: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
  blogId: z.string().optional().nullable(),
  // keep draftId out of POST body for clarity (we prefer PATCH for updates)
});

// PATCH validation (update specific draft)
const patchSchema = z.object({
  draftId: z.string().min(1),
  title: z.string().min(0).optional(),
  description: z.string().min(0).optional(),
  image: z.string().url().or(z.literal("")).optional(),
  category: z.string().optional(),
  status: z.enum(["published", "draft"]).optional(),
  blogId: z.string().optional().nullable(),
});

// GET query schema
const getQuerySchema = z.object({
  blogId: z.string().optional(),
  draftId: z.string().optional(),
});

// DELETE query
const deleteQuerySchema = z.object({
  blogId: z.string().optional(),
  draftId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // create new draft or upsert by blogId
    const session = await requireRole(["author", "admin"]);
    const userIdStr = session.user?.id;
    if (!userIdStr)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      title = "",
      description = "",
      image = "",
      category = "",
      status = "draft",
      blogId = null,
    } = parsed.data;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const now = new Date();

    // If blogId present -> upsert by (userId + blogId) (useful for drafts linked to existing blog)
    if (blogId) {
      if (!ObjectId.isValid(blogId))
        return NextResponse.json({ error: "Invalid blogId" }, { status: 400 });
      const filter: any = {
        userId: new ObjectId(userIdStr),
        blogId: new ObjectId(blogId),
      };
      const updateDoc: any = {
        $set: {
          title,
          description,
          image: image || "",
          category: category || "",
          status: status || "draft",
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      };
      const result = await db
        .collection("drafts")
        .findOneAndUpdate(filter, updateDoc, {
          upsert: true,
          returnDocument: "after",
        });
      return NextResponse.json(
        { ok: true, draft: transformDraft(result!.value) },
        { status: 200 }
      );
    }

    // Otherwise create a new standalone draft (allow multiple drafts per user)
    const insertDoc: any = {
      userId: new ObjectId(userIdStr),
      blogId: null,
      title,
      description,
      image: image || "",
      category: category || "",
      status: status || "draft",
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await db.collection("drafts").insertOne(insertDoc);
    const created = await db
      .collection("drafts")
      .findOne({ _id: insertResult.insertedId });

    return NextResponse.json(
      { ok: true, draft: transformDraft(created) },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("POST /api/drafts error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH updates a specific draft by draftId (preferred for explicit updates)
export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["author", "admin"]);
    const userIdStr = session.user?.id;
    if (!userIdStr)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { draftId, title, description, image, category, status, blogId } =
      parsed.data;

    if (!ObjectId.isValid(draftId))
      return NextResponse.json({ error: "Invalid draftId" }, { status: 400 });
    const _id = new ObjectId(draftId);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const now = new Date();

    const update: any = {
      $set: {
        updatedAt: now,
      },
    };
    if (title !== undefined) update.$set.title = title;
    if (description !== undefined) update.$set.description = description;
    if (image !== undefined) update.$set.image = image || "";
    if (category !== undefined) update.$set.category = category;
    if (status !== undefined) update.$set.status = status;
    if (blogId !== undefined)
      update.$set.blogId = blogId ? new ObjectId(blogId) : null;

    const res = await db
      .collection("drafts")
      .findOneAndUpdate({ _id, userId: new ObjectId(userIdStr) }, update, {
        returnDocument: "after",
      });
    if (!res)
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });

    return NextResponse.json(
      { ok: true, draft: transformDraft(res.value) },
      { status: 200 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("PATCH /api/drafts error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireRole(["author", "admin"]);
    const userIdStr = session.user?.id;
    if (!userIdStr)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsed = getQuerySchema.safeParse(query);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // draftId -> return specific draft
    if (parsed.success && parsed.data.draftId) {
      const { draftId } = parsed.data;
      if (!ObjectId.isValid(draftId))
        return NextResponse.json({ error: "Invalid draftId" }, { status: 400 });
      const d = await db
        .collection("drafts")
        .findOne({
          _id: new ObjectId(draftId),
          userId: new ObjectId(userIdStr),
        });
      return NextResponse.json(
        { ok: true, draft: d ? transformDraft(d) : null },
        { status: 200 }
      );
    }

    // blogId -> return draft linked to blog
    if (parsed.success && parsed.data.blogId) {
      const { blogId } = parsed.data;
      if (!ObjectId.isValid(blogId))
        return NextResponse.json({ error: "Invalid blogId" }, { status: 400 });
      const d = await db
        .collection("drafts")
        .findOne({
          userId: new ObjectId(userIdStr),
          blogId: new ObjectId(blogId),
        });
      return NextResponse.json(
        { ok: true, draft: d ? transformDraft(d) : null },
        { status: 200 }
      );
    }

    // otherwise list all drafts for user
    const drafts = await db
      .collection("drafts")
      .find({ userId: new ObjectId(userIdStr) })
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json(
      { ok: true, drafts: drafts.map(transformDraft) },
      { status: 200 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("GET /api/drafts error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole(["author", "admin"]);
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsed = deleteQuerySchema.safeParse(query);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const session = await requireRole(["author", "admin"]);
    const userIdStr = session.user?.id;
    if (!userIdStr)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { blogId, draftId } = parsed.data;

    // delete specific draft by draftId (preferred)
    if (draftId) {
      if (!ObjectId.isValid(draftId))
        return NextResponse.json({ error: "Invalid draftId" }, { status: 400 });
      const res = await db
        .collection("drafts")
        .deleteOne({
          _id: new ObjectId(draftId),
          userId: new ObjectId(userIdStr),
        });
      return NextResponse.json(
        { ok: true, deletedCount: res.deletedCount },
        { status: 200 }
      );
    }

    // delete by blogId (only deletes single draft linked to blog)
    if (blogId) {
      if (!ObjectId.isValid(blogId))
        return NextResponse.json({ error: "Invalid blogId" }, { status: 400 });
      const res = await db
        .collection("drafts")
        .deleteOne({
          userId: new ObjectId(userIdStr),
          blogId: new ObjectId(blogId),
        });
      return NextResponse.json(
        { ok: true, deletedCount: res.deletedCount },
        { status: 200 }
      );
    }

    // delete all drafts for user (explicit clear-all)
    const res = await db
      .collection("drafts")
      .deleteMany({ userId: new ObjectId(userIdStr) });
    return NextResponse.json(
      { ok: true, deletedCount: res.deletedCount },
      { status: 200 }
    );
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/drafts error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* helpers */
function transformDraft(doc: any) {
  if (!doc) return null;
  return {
    id: doc._id?.toString?.() || null,
    title: doc.title || "",
    description: doc.description || "",
    image: doc.image || "",
    category: doc.category || "",
    status: doc.status || "draft",
    blogId: doc.blogId ? doc.blogId.toString() : null,
    userId: doc.userId ? doc.userId.toString() : null,
    createdAt: doc.createdAt?.toISOString?.() || null,
    updatedAt: doc.updatedAt?.toISOString?.() || null,
  };
}

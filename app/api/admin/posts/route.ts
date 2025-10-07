// app/api/admin/posts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

// Schema validation for PATCH requests
const patchSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["publish", "unpublish", "delete"]),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

// GET: List all blogs (admin only)
export async function GET() {
  try {
    await requireAdmin();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const blogs = await db
      .collection("blogs")
      .find({})
      .sort({ createdAt: -1 })
      .project({
        title: 1,
        slug: 1,
        author: 1,
        category: 1,
        status: 1,
        createdAt: 1,
      })
      .toArray();

    return NextResponse.json(blogs);
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    console.error("Admin GET posts error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH: Update post status or delete
export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { id, action } = await req.json();
    const parsed = patchSchema.safeParse({ id, action });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const _id = new ObjectId(id);

    if (action === "delete") {
      await db.collection("blogs").deleteOne({ _id });
      return NextResponse.json({ ok: true, action: "deleted", id });
    }

    const newStatus = action === "publish" ? "published" : "draft";
    await db
      .collection("blogs")
      .updateOne({ _id }, { $set: { status: newStatus } });
    return NextResponse.json({ ok: true, id, action, status: newStatus });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    console.error("Admin PATCH posts error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

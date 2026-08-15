import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireSession } from "@/lib/requireRole";

const commentSchema = z.object({
  blogId: z.string().refine(ObjectId.isValid, "Invalid blog id"),
  message: z.string().trim().min(1).max(2_000),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const parsed = commentSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }

    const { blogId, message } = parsed.data;
    const name = session.user.name?.trim() || "Signed-in user";

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db.collection("comments").insertOne({
      blogId: new ObjectId(blogId),
      name,
      message,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Failed to post comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blogId = searchParams.get("blogId");

  if (!blogId) {
    return NextResponse.json({ error: "Missing blogId" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const comments = await db
      .collection("comments")
      .find({ blogId: new ObjectId(blogId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

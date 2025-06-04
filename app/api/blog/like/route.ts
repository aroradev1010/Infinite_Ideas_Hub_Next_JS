import { NextResponse } from "next/server";
import { likeBlogBySlug } from "@/lib/blogService"; // adjust path if needed

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const likes = await likeBlogBySlug(slug);

    if (likes === null) {
      return NextResponse.json(
        { error: "Failed to like blog" },
        { status: 500 }
      );
    }

    return NextResponse.json({ likes });
  } catch (err) {
    console.error("POST /api/blog/like error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

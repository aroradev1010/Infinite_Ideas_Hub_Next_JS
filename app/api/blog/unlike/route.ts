// /app/api/blog/unlike/route.ts
import { NextResponse } from "next/server";
import { unlikeBlogBySlug } from "@/lib/blogService";

export async function POST(req: Request) {
  const { slug } = await req.json();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const likes = await unlikeBlogBySlug(slug);
  if (likes === null) {
    return NextResponse.json(
      { error: "Failed to unlike blog" },
      { status: 500 }
    );
  }

  return NextResponse.json({ likes });
}

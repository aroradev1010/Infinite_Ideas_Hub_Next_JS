// lib/blogService.ts
import clientPromise from "./mongodb";
import { transformBlog } from "@/models/blogModel";
import { Blog } from "@/types/blogType";

export async function getFeaturedArticle(): Promise<Blog | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const blog = await db
      .collection("blogs")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    return blog[0] ? transformBlog(blog[0]) : null;
  } catch (error) {
    console.error("Failed to fetch featured article:", error);
    return null;
  }
}

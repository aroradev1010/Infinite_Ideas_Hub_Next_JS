// lib/blogService.ts
import clientPromise from "./mongodb";
import { transformBlog } from "@/models/blogModel";
import { Blog } from "@/types/blogType";
import { ObjectId } from "mongodb";

export async function getFeaturedBlog(): Promise<Blog | null> {
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

export async function getBlogById(id: string): Promise<Blog | null> {
  if (!ObjectId.isValid(id)) {
    console.error("Invalid blog id:", id);
    return null;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const blog = await db
      .collection("blogs")
      .findOne({ _id: new ObjectId(id) });

    return blog ? transformBlog(blog) : null;
  } catch (error) {
    console.error("Failed to fetch blog by ID:", error);
    return null;
  }
}

export async function getAllBlogs(): Promise<Blog[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const blogs = await db
      .collection("blogs")
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest
      .toArray();

    return blogs.map(transformBlog);
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export async function getBlogsByAuthor(authorName: string): Promise<Blog[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const blogs = await db
      .collection("blogs")
      .find({ author: authorName })
      .sort({ createdAt: -1 })
      .toArray();

    return blogs.map(transformBlog);
  } catch (error) {
    console.error("Failed to fetch blogs by author:", error);
    return [];
  }
}

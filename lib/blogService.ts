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
      .find({ status: "published" }) // ✅ show only published
      .sort({ likes: -1 })
      .limit(1)
      .toArray();

    return blog[0] ? transformBlog(blog[0]) : null;
  } catch (error) {
    console.error("Failed to fetch featured article:", error);
    return null;
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const blog = await db.collection("blogs").findOne({ slug });
    return blog ? transformBlog(blog) : null;
  } catch (error) {
    console.error("Failed to fetch blog by slug:", error);
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
      .find({ status: "published" }) // ✅ Only published blogs
      .sort({ createdAt: -1 })
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
      .find({
        author: authorName,
        status: "published", // ✅ Only published blogs by author
      })
      .sort({ createdAt: -1 })
      .toArray();

    return blogs.map(transformBlog);
  } catch (error) {
    console.error("Failed to fetch blogs by author:", error);
    return [];
  }
}

export async function getBlogsByCategory(
  categoryName: string
): Promise<Blog[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const blogs = await db
      .collection("blogs")
      .find({
        category: categoryName,
        status: "published", // ✅ Only published blogs by category
      })
      .sort({ createdAt: -1 })
      .toArray();

    return blogs.map(transformBlog);
  } catch (err) {
    console.error("Failed to fetch blogs by category:", err);
    return [];
  }
}

export async function getNextOrOldestBlog(
  currentBlogDate: Date
): Promise<Blog | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // ✅ Filter by published only
    const nextBlog = await db
      .collection("blogs")
      .find({ createdAt: { $gt: currentBlogDate }, status: "published" })
      .sort({ createdAt: 1 })
      .limit(1)
      .toArray();

    if (nextBlog.length > 0) {
      return transformBlog(nextBlog[0]);
    }

    const oldestBlog = await db
      .collection("blogs")
      .find({
        createdAt: { $ne: currentBlogDate },
        status: "published", // ✅ published only
      })
      .sort({ createdAt: 1 })
      .limit(1)
      .toArray();

    return oldestBlog.length > 0 ? transformBlog(oldestBlog[0]) : null;
  } catch (error) {
    console.error("Error fetching next or oldest blog:", error);
    return null;
  }
}

export async function likeBlogBySlug(slug: string): Promise<number | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db
      .collection("blogs")
      .findOneAndUpdate(
        { slug },
        { $inc: { likes: 1 } },
        { returnDocument: "after" }
      );
    if (!result) {
      console.error(`No blog found for slug: ${slug}`);
      return null;
    }

    return result.likes;
  } catch (error) {
    console.error("Failed to increment blog like count:", error);
    return null;
  }
}

export async function unlikeBlogBySlug(slug: string): Promise<number | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db
      .collection("blogs")
      .findOneAndUpdate(
        { slug },
        { $inc: { likes: -1 } },
        { returnDocument: "after" }
      );

    if (!result) {
      console.error(`Blog with slug "${slug}" not found.`);
      return null;
    }
    return result.likes ?? null;
  } catch (error) {
    console.error("Failed to decrement blog like count:", error);
    return null;
  }
}

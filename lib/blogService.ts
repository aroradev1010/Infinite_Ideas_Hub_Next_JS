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

// ✅ Fetch by authorId directly
export async function getBlogsByAuthorId(authorId: string): Promise<Blog[]> {
  try {
    if (!ObjectId.isValid(authorId)) return [];

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const blogs = await db
      .collection("blogs")
      .find({ authorId: new ObjectId(authorId), status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    return blogs.map(transformBlog);
  } catch (error) {
    console.error("Failed to fetch blogs by authorId:", error);
    return [];
  }
}

// ✅ New: Fetch by author slug (used in authors/[slug]/page.tsx)
export async function getBlogsByAuthorSlug(slug: string): Promise<Blog[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Step 1: find the author by slug
    const author = await db.collection("authors").findOne({ slug });
    if (!author) {
      console.warn(`No author found for slug: ${slug}`);
      return [];
    }

    // Step 2: fetch blogs by authorId (ObjectId)
    const blogs = await db
      .collection("blogs")
      .find({ authorId: author._id, status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    return blogs.map(transformBlog);
  } catch (error) {
    console.error("Failed to fetch blogs by authorSlug:", error);
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

export async function getAllBlogsForAdmin(): Promise<Blog[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const posts = await db
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

  return posts.map(transformBlog);
}

export type CreateBlogInput = {
  title: string;
  description: string; // HTML or markdown string (you use dangerouslySetInnerHTML)
  image?: string;
  category?: string;
  slug?: string;
  status?: "published" | "draft";
  // authorId is resolved from session -> author doc; we don't accept raw authorId from client
};

export async function createBlog(
  input: CreateBlogInput,
  authorUserId: string
): Promise<Blog | null> {
  try {
    // Resolve author document by users._id == authorUserId
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    if (!ObjectId.isValid(authorUserId)) {
      console.error("Invalid authorUserId:", authorUserId);
      return null;
    }
    const userObjId = new ObjectId(authorUserId);

    // Find author doc that has userId === userObjId
    const authorDoc = await db
      .collection("authors")
      .findOne({ userId: userObjId });
    if (!authorDoc) {
      console.error("No author document found for userId:", authorUserId);
      return null;
    }

    // Generate slug if not provided; ensure uniqueness
    const makeSlug = (s: string) =>
      s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    let baseSlug = input.slug
      ? makeSlug(input.slug)
      : makeSlug(input.title || `post-${Date.now()}`);
    if (!baseSlug) baseSlug = `post-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 1;
    while (await db.collection("blogs").findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
      if (counter > 1000) break;
    }

    // Build blog document
    const now = new Date();
    const blogDoc: any = {
      title: input.title,
      description: input.description,
      image: input.image || "/fallback.avif",
      category: input.category || "Uncategorized",
      slug: finalSlug,
      likes: 0,
      status: input.status || "draft",
      createdAt: now,
      updatedAt: now,

      // Denormalized author fields for quick reads:
      authorId: authorDoc._id, // ObjectId referencing authors collection
      authorName: authorDoc.name ?? "",
      authorSlug: authorDoc.slug ?? null,
    };

    // Insert
    const res = await db.collection("blogs").insertOne(blogDoc);
    const inserted = await db
      .collection("blogs")
      .findOne({ _id: res.insertedId });
    return inserted ? transformBlog(inserted) : null;
  } catch (err) {
    console.error("createBlog error:", err);
    return null;
  }
}
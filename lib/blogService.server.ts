// lib/blogService.server.ts
import clientPromise from "./mongodb";
import { transformBlog } from "@/models/blogModel";
import { Blog, BlogInsert } from "@/types/blogType";
import { ObjectId } from "mongodb";
import { ApiResponse } from "@/types/db";
import { AuthorDoc } from "@/types";

/**
 * Server-side blog service.
 * - This file is server-only (name .server.ts and import only from server routes).
 * - createBlog & updateBlog return ApiResponse<Blog> to let routes map to HTTP responses.
 *
 * Read helpers (getFeaturedBlog, getBlogBySlug, etc.) are left returning Blog|null
 * so existing code using them doesn't break. You can change them to ApiResponse later
 * if you want end-to-end uniformity.
 */

/* -----------------------
   Read / utility functions
   (unchanged behaviours)
   ----------------------- */

export async function getFeaturedBlog(): Promise<Blog | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const blog = await db
      .collection("blogs")
      .find({ status: "published" })
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
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray();
    return blogs.map(transformBlog);
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

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

export async function getBlogsByAuthorSlug(slug: string): Promise<Blog[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const author = await db.collection<AuthorDoc>("authors").findOne({ slug });
    if (!author) {
      console.warn(`No author found for slug: ${slug}`);
      return [];
    }
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
      .find({ category: categoryName, status: "published" })
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
    const nextBlog = await db
      .collection("blogs")
      .find({ createdAt: { $gt: currentBlogDate }, status: "published" })
      .sort({ createdAt: 1 })
      .limit(1)
      .toArray();
    if (nextBlog.length > 0) return transformBlog(nextBlog[0]);
    const oldestBlog = await db
      .collection("blogs")
      .find({ createdAt: { $ne: currentBlogDate }, status: "published" })
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
    const r = await db
      .collection("blogs")
      .findOneAndUpdate(
        { slug },
        { $inc: { likes: 1 } },
        { returnDocument: "after" }
      );
    if (!r) {
      console.error(`No blog found for slug: ${slug}`);
      return null;
    }
    // result shape varies; transformBlog callers use transformBlog elsewhere; here return likes safe
    return (r.value?.likes as number) ?? null;
  } catch (error) {
    console.error("Failed to increment blog like count:", error);
    return null;
  }
}

export async function unlikeBlogBySlug(slug: string): Promise<number | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const r = await db
      .collection("blogs")
      .findOneAndUpdate(
        { slug },
        { $inc: { likes: -1 } },
        { returnDocument: "after" }
      );
    if (!r) {
      console.error(`Blog with slug "${slug}" not found.`);
      return null;
    }
    return (r.value?.likes as number) ?? null;
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

/* -----------------------
   CREATE blog (server-side) - returns ApiResponse<Blog>
   ----------------------- */

export async function createBlog(
  input: {
    title: string;
    description: string;
    image?: string;
    category?: string;
    slug?: string | undefined;
    status?: "published" | "draft";
  },
  authorUserId: string
): Promise<ApiResponse<Blog>> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const now = new Date();

    // find or create authorDoc by userId
    let authorDoc = await db.collection<AuthorDoc>("authors").findOne({
      userId: new ObjectId(authorUserId),
    });

    if (!authorDoc) {
      const authorSlug = `author-${Date.now()}`;
      const newAuthor: Partial<AuthorDoc> = {
        userId: new ObjectId(authorUserId),
        name: "Unknown Author",
        bio: "",
        profileImage: "/fallback.avif",
        slug: authorSlug,
        createdAt: now,
        updatedAt: now,
      };
      const aRes = await db.collection("authors").insertOne(newAuthor as any);
      authorDoc = await db
        .collection<AuthorDoc>("authors")
        .findOne({ _id: aRes.insertedId });
    }

    if (!authorDoc) {
      console.error("Failed to create or fetch author doc");
      return { ok: false, error: "Author creation failed", status: 500 };
    }

    // slugify helper
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 200);

    let finalSlug = input.slug ? slugify(input.slug) : slugify(input.title);

    // ensure uniqueness
    let suffix = 0;
    let candidate = finalSlug;
    while (await db.collection("blogs").findOne({ slug: candidate })) {
      suffix += 1;
      candidate = `${finalSlug}-${suffix}`;
    }
    finalSlug = candidate;

    const blogDoc: BlogInsert = {
      title: input.title,
      description: input.description,
      image: input.image || "/fallback.avif",
      category: input.category || "Uncategorized",
      slug: finalSlug,
      likes: 0,
      status: input.status || "draft",
      createdAt: now,
      updatedAt: now,
      authorId: authorDoc._id,
      authorName: authorDoc.name ?? "",
      authorSlug: authorDoc.slug ?? null,
    };

    const insertResult = await db.collection("blogs").insertOne(blogDoc as any);
    const created = await db
      .collection("blogs")
      .findOne({ _id: insertResult.insertedId });
    if (!created) return { ok: false, error: "Create failed", status: 500 };

    const blog = transformBlog(created);
    return { ok: true, data: blog, status: 201 };
  } catch (err: any) {
    console.error("createBlog error:", err);
    return { ok: false, error: "Internal Server Error", status: 500 };
  }
}

/* -----------------------
   UPDATE blog (server-side) - returns ApiResponse<Blog>
   with optional ownership enforcement
   ----------------------- */

/**
 * updateBlog
 * - blogId: string (ObjectId)
 * - updatesRaw: partial fields to set
 * - authorUserId?: string  — if provided, ownership check is enforced
 *
 * Returns ApiResponse<Blog> with status codes:
 * - 200: updated
 * - 403: forbidden (ownership failed)
 * - 404: not found
 * - 400/500: other errors
 */
// inside lib/blogService.server.ts (replace existing updateBlog)
export async function updateBlog(
  blogId: string,
  updatesRaw: {
    title?: string;
    description?: string;
    image?: string;
    category?: string;
    status?: "published" | "draft";
    slug?: string;
  },
  authorUserId?: string
): Promise<ApiResponse<Blog>> {
  if (!ObjectId.isValid(blogId)) {
    console.error("Invalid blog id for update:", blogId);
    return { ok: false, error: "Invalid blog id", status: 400 };
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // fetch existing blog
    const existing = await db
      .collection("blogs")
      .findOne({ _id: new ObjectId(blogId) });

    // If the blog is missing, treat this as "blog was deleted".
    // We'll create a brand new blog instead of returning 404.
    if (!existing) {
      console.warn(
        "Blog to update not found (may have been deleted). Creating a new blog instead:",
        blogId
      );

      // Ensure minimal required fields exist to create a blog.
      // If client didn't supply title/description, fail with 400.
      if (!updatesRaw.title || !updatesRaw.description) {
        return {
          ok: false,
          error:
            "Cannot create blog: title and description are required when original blog is missing.",
          status: 400,
        };
      }

      // Delegate to createBlog for consistent creation logic (author linking, slug uniqueness, etc.)
      // createBlog returns Blog | null in this file — handle accordingly.
      const created = await createBlog(
        {
          title: updatesRaw.title,
          description: updatesRaw.description,
          image: updatesRaw.image,
          category: updatesRaw.category,
          slug: updatesRaw.slug,
          status: updatesRaw.status ?? "draft",
        },
        // if authorUserId present, pass it; else creation will create "Unknown Author" fallback
        authorUserId ?? ""
      );

      if (!created) {
        return {
          ok: false,
          error: "Failed to create fallback blog when original was missing.",
          status: 500,
        };
      }

      // Important: caller (e.g., draft publish flow) should remove blogId link from the draft.
      return { ok: true, data: transformBlog(created), status: 201 };
    }

    // Optional ownership enforcement:
    if (authorUserId) {
      const authorDoc = await db.collection<AuthorDoc>("authors").findOne({
        userId: new ObjectId(authorUserId),
      });
      if (!authorDoc) {
        console.warn("Author doc not found for user:", authorUserId);
        return { ok: false, error: "Author not found", status: 404 };
      }

      // existing.authorId may be ObjectId or string — normalize both sides
      const existingAuthorId =
        existing.authorId && existing.authorId.toString
          ? existing.authorId.toString()
          : String(existing.authorId);
      if (existingAuthorId !== authorDoc._id.toString()) {
        console.warn("Ownership check failed for update:", blogId);
        return { ok: false, error: "Forbidden: not the owner", status: 403 };
      }
    }

    const updates: any = { updatedAt: new Date() };

    // slug generation/uniqueness if provided
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 200);

    if (typeof updatesRaw.slug === "string" && updatesRaw.slug.trim()) {
      let finalSlug = slugify(updatesRaw.slug);
      let suffix = 0;
      let candidate = finalSlug;
      while (
        await db.collection("blogs").findOne({
          slug: candidate,
          _id: { $ne: new ObjectId(blogId) },
        })
      ) {
        suffix += 1;
        candidate = `${finalSlug}-${suffix}`;
      }
      updates.slug = candidate;
    }

    if (typeof updatesRaw.title === "string") updates.title = updatesRaw.title;
    if (typeof updatesRaw.description === "string")
      updates.description = updatesRaw.description;
    if (typeof updatesRaw.image === "string")
      updates.image = updatesRaw.image || "/fallback.avif";
    if (typeof updatesRaw.category === "string")
      updates.category = updatesRaw.category || "Uncategorized";
    if (typeof updatesRaw.status === "string")
      updates.status = updatesRaw.status;

    // if nothing to update besides updatedAt => return existing (no-op)
    const keys = Object.keys(updates).filter((k) => k !== "updatedAt");
    if (keys.length === 0) {
      return { ok: true, data: transformBlog(existing), status: 200 };
    }

    const result = await db
      .collection("blogs")
      .findOneAndUpdate(
        { _id: new ObjectId(blogId) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      console.warn("Failed to update blog:", blogId);
      return { ok: false, error: "Failed to update blog", status: 500 };
    }

    return { ok: true, data: transformBlog(result), status: 200 };
  } catch (err: any) {
    console.error("updateBlog error:", err);
    return { ok: false, error: "Internal Server Error", status: 500 };
  }
}

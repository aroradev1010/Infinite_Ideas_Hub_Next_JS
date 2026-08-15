import "server-only"

import type { Collection, Db, Filter } from "mongodb"
import { ObjectId } from "mongodb"

import clientPromise from "@/lib/mongodb"
import { BLOG_CATEGORIES, isBlogCategory } from "@/lib/blogCategories"
import {
  transformEditableBlog,
  transformPublicBlog,
} from "@/models/blogModel"
import type { AuthorDoc } from "@/types"
import type {
  AdminPostSummary,
  BlogInput,
  BlogStatus,
  DraftSummary,
  EditableBlog,
  PublicBlog,
} from "@/types/blogType"
import type { ApiResponse } from "@/types/db"
import type {
  BlogDocument,
  BlogInsert,
} from "@/types/server/blogServerTypes"

const BLOG_COLLECTION = "blogs"
const FALLBACK_IMAGE = "/fallback.avif"
const MAX_DATA_IMAGE_BYTES = 4 * 1024 * 1024

const PUBLIC_POST_FILTER: Filter<BlogDocument> = {
  status: "published",
  slug: { $type: "string" },
  contentHtml: { $type: "string" },
}

interface PreparedPostInput {
  title: string
  editorState: BlogInput["editorState"]
  contentHtml: string | null
  image: string
  category: string
  status: BlogStatus
}

function loadSerialization() {
  return import("@/lib/editor/serialization.server")
}

function collection(db: Db): Collection<BlogDocument> {
  return db.collection<BlogDocument>(BLOG_COLLECTION)
}

async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(process.env.MONGODB_DB)
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180)

  return slug || "post"
}

async function ensureBlogIndexes(db: Db): Promise<void> {
  await collection(db).createIndex(
    { slug: 1 },
    {
      name: "unique_published_slug",
      partialFilterExpression: { slug: { $type: "string" } },
      unique: true,
    }
  )
}

async function createUniqueSlug(
  posts: Collection<BlogDocument>,
  title: string,
  excludedId?: ObjectId
): Promise<string> {
  const base = slugify(title)
  let candidate = base
  let suffix = 1

  while (
    await posts.findOne({
      slug: candidate,
      ...(excludedId ? { _id: { $ne: excludedId } } : {}),
    })
  ) {
    candidate = `${base}-${suffix++}`
  }

  return candidate
}

function isRasterDataUrl(value: string): boolean {
  const match =
    /^data:image\/(?:gif|jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(
      value
    )

  if (!match) return false
  return Buffer.byteLength(match[1], "base64") <= MAX_DATA_IMAGE_BYTES
}

function isSupportedImageSource(value: string): boolean {
  if (isRasterDataUrl(value)) return true

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value.length <= 2048 && !/[\u0000-\u001f\s]/.test(value)
  }

  if (value.length > 2048) return false

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function normalizeCoverImage(value: string): string {
  const image = value.trim()
  if (!image) return FALLBACK_IMAGE

  if (!isSupportedImageSource(image)) {
    throw new Error(
      "Image must be an HTTP(S) URL, a relative path, or a supported raster data URL"
    )
  }

  return image
}

function assertEditorImageSources(editorState: BlogInput["editorState"]): void {
  const stack: unknown[] = [editorState.root]

  while (stack.length > 0) {
    const current = stack.pop()
    if (typeof current !== "object" || current === null) continue

    const node = current as Record<string, unknown>
    if (node.type === "image") {
      if (
        typeof node.src !== "string" ||
        !isSupportedImageSource(node.src)
      ) {
        throw new Error("Editor content contains an unsupported image source")
      }
    }

    if (Array.isArray(node.children)) {
      stack.push(...node.children)
    }
  }
}

async function preparePostInput(input: BlogInput): Promise<PreparedPostInput> {
  const {
    extractPlainText,
    parseSerializedEditorState,
    renderSerializedEditorStateToHtml,
  } = await loadSerialization()
  const restored = parseSerializedEditorState(input.editorState)
  assertEditorImageSources(restored.serializedState)

  const title = input.title.trim()
  const category = input.category.trim()
  if (!isBlogCategory(category)) {
    throw new Error(
      `Category must be one of: ${BLOG_CATEGORIES.map((item) => item.name).join(", ")}`
    )
  }
  const image = normalizeCoverImage(input.image)

  if (input.status === "published") {
    if (title.length < 3) {
      throw new Error("Title must be at least 3 characters")
    }

    const plainText = extractPlainText(restored.serializedState).trim()
    if (plainText.length < 20) {
      throw new Error("Published content must contain at least 20 characters")
    }

    return {
      title,
      editorState: restored.serializedState,
      contentHtml: renderSerializedEditorStateToHtml(
        restored.serializedState
      ),
      image,
      category,
      status: input.status,
    }
  }

  return {
    title,
    editorState: restored.serializedState,
    contentHtml: null,
    image,
    category,
    status: input.status,
  }
}

function serviceError(error: unknown): ApiResponse<never> {
  if (
    error instanceof Error &&
    error.name === "InvalidSerializedEditorStateError"
  ) {
    return { ok: false, error: error.message, status: 400 }
  }

  if (
    error instanceof Error &&
    /(?:category|image|title|content)/i.test(error.message)
  ) {
    return { ok: false, error: error.message, status: 400 }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return { ok: false, error: "A post with this slug already exists", status: 409 }
  }

  console.error("Blog service error:", error)
  return { ok: false, error: "Internal Server Error", status: 500 }
}

async function getOrCreateAuthor(
  db: Db,
  authorUserId: string,
  now: Date
): Promise<AuthorDoc> {
  if (!ObjectId.isValid(authorUserId)) {
    throw new Error("Invalid author user ID")
  }

  const userId = new ObjectId(authorUserId)
  let author = await db.collection<AuthorDoc>("authors").findOne({ userId })
  if (author) return author

  const authorSlug = `author-${Date.now()}`
  const inserted = await db.collection<Omit<AuthorDoc, "_id">>("authors").insertOne({
    userId,
    name: "Unknown Author",
    bio: "",
    profileImage: FALLBACK_IMAGE,
    slug: authorSlug,
    createdAt: now,
    updatedAt: now,
  })

  author = await db
    .collection<AuthorDoc>("authors")
    .findOne({ _id: inserted.insertedId })

  if (!author) throw new Error("Author creation failed")
  return author
}

async function editableBlog(doc: BlogDocument): Promise<EditableBlog> {
  const { extractPlainText } = await loadSerialization()
  return transformEditableBlog(doc, extractPlainText(doc.editorState))
}

export async function createBlog(
  input: BlogInput,
  authorUserId: string
): Promise<ApiResponse<EditableBlog>> {
  try {
    const prepared = await preparePostInput(input)
    const db = await getDatabase()
    await ensureBlogIndexes(db)

    const now = new Date()
    const author = await getOrCreateAuthor(db, authorUserId, now)
    const posts = collection(db)
    const slug =
      prepared.status === "published"
        ? await createUniqueSlug(posts, prepared.title)
        : null

    const document: BlogInsert = {
      ...prepared,
      slug,
      authorId: author._id,
      authorName: author.name ?? "Unknown Author",
      authorSlug: author.slug ?? null,
      likes: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: prepared.status === "published" ? now : null,
    }

    const inserted = await posts.insertOne(document as BlogDocument)
    const created = await posts.findOne({ _id: inserted.insertedId })
    if (!created) {
      return { ok: false, error: "Post creation failed", status: 500 }
    }

    return { ok: true, data: await editableBlog(created), status: 201 }
  } catch (error) {
    return serviceError(error)
  }
}

export async function updateBlog(
  blogId: string,
  input: BlogInput,
  authorUserId?: string
): Promise<ApiResponse<EditableBlog>> {
  if (!ObjectId.isValid(blogId)) {
    return { ok: false, error: "Invalid blog id", status: 400 }
  }

  try {
    const prepared = await preparePostInput(input)
    const db = await getDatabase()
    await ensureBlogIndexes(db)

    const posts = collection(db)
    const _id = new ObjectId(blogId)
    const existing = await posts.findOne({ _id })
    if (!existing) {
      return { ok: false, error: "Post not found", status: 404 }
    }

    if (authorUserId) {
      if (!ObjectId.isValid(authorUserId)) {
        return { ok: false, error: "Invalid author user ID", status: 400 }
      }

      const author = await db.collection<AuthorDoc>("authors").findOne({
        userId: new ObjectId(authorUserId),
      })

      if (!author) {
        return { ok: false, error: "Author not found", status: 404 }
      }

      if (existing.authorId.toString() !== author._id.toString()) {
        return { ok: false, error: "Forbidden: not the owner", status: 403 }
      }
    }

    const now = new Date()
    const slug =
      prepared.status === "published"
        ? existing.slug ??
          (await createUniqueSlug(posts, prepared.title, existing._id))
        : existing.slug ?? null
    const publishedAt =
      prepared.status === "published"
        ? existing.publishedAt ?? now
        : existing.publishedAt ?? null

    const updated = await posts.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...prepared,
          slug,
          publishedAt,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    )

    if (!updated) {
      return { ok: false, error: "Post update failed", status: 500 }
    }

    return { ok: true, data: await editableBlog(updated), status: 200 }
  } catch (error) {
    return serviceError(error)
  }
}

export async function updateBlogStatus(
  blogId: string,
  status: BlogStatus,
  authorUserId?: string
): Promise<ApiResponse<EditableBlog>> {
  const existing = await getEditableBlogById(blogId)
  if (!existing) {
    return { ok: false, error: "Post not found", status: 404 }
  }

  return updateBlog(
    blogId,
    {
      title: existing.title,
      editorState: existing.editorState,
      image: existing.image,
      category: existing.category,
      status,
    },
    authorUserId
  )
}

export async function getFeaturedBlog(): Promise<PublicBlog | null> {
  try {
    const db = await getDatabase()
    const doc = await collection(db)
      .find(PUBLIC_POST_FILTER)
      .project({ editorState: 0 })
      .sort({ likes: -1 })
      .limit(1)
      .next()

    return doc ? transformPublicBlog(doc as BlogDocument) : null
  } catch (error) {
    console.error("Failed to fetch featured article:", error)
    return null
  }
}

export async function getBlogBySlug(
  slug: string
): Promise<PublicBlog | null> {
  try {
    const db = await getDatabase()
    const doc = await collection(db).findOne(
      {
        ...PUBLIC_POST_FILTER,
        slug,
      },
      { projection: { editorState: 0 } }
    )
    return doc ? transformPublicBlog(doc as BlogDocument) : null
  } catch (error) {
    console.error("Failed to fetch blog by slug:", error)
    return null
  }
}

export async function getEditableBlogById(
  id: string
): Promise<EditableBlog | null> {
  if (!ObjectId.isValid(id)) return null

  try {
    const db = await getDatabase()
    const doc = await collection(db).findOne({ _id: new ObjectId(id) })
    return doc ? await editableBlog(doc) : null
  } catch (error) {
    console.error("Failed to fetch blog by ID:", error)
    return null
  }
}

export async function getEditableBlogForUser(
  id: string,
  userId: string,
  isAdmin: boolean
): Promise<EditableBlog | null> {
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) return null

  try {
    const db = await getDatabase()
    const doc = await collection(db).findOne({ _id: new ObjectId(id) })
    if (!doc) return null
    if (isAdmin) return editableBlog(doc)

    const author = await db.collection<AuthorDoc>("authors").findOne({
      _id: doc.authorId,
      userId: new ObjectId(userId),
    })

    return author ? editableBlog(doc) : null
  } catch (error) {
    console.error("Failed to fetch editable blog:", error)
    return null
  }
}

export async function getAllBlogs(): Promise<PublicBlog[]> {
  try {
    const db = await getDatabase()
    const docs = await collection(db)
      .find(PUBLIC_POST_FILTER)
      .project({ editorState: 0 })
      .sort({ publishedAt: -1 })
      .toArray()

    return docs
      .map((doc) => transformPublicBlog(doc as BlogDocument))
      .filter((blog): blog is PublicBlog => blog !== null)
  } catch (error) {
    console.error("Failed to fetch blogs:", error)
    return []
  }
}

export async function getBlogsByAuthorId(
  authorId: string
): Promise<PublicBlog[]> {
  if (!ObjectId.isValid(authorId)) return []

  try {
    const db = await getDatabase()
    const docs = await collection(db)
      .find({
        ...PUBLIC_POST_FILTER,
        authorId: new ObjectId(authorId),
      })
      .project({ editorState: 0 })
      .sort({ publishedAt: -1 })
      .toArray()

    return docs
      .map((doc) => transformPublicBlog(doc as BlogDocument))
      .filter((blog): blog is PublicBlog => blog !== null)
  } catch (error) {
    console.error("Failed to fetch blogs by authorId:", error)
    return []
  }
}

export async function getBlogsByAuthorSlug(
  slug: string
): Promise<PublicBlog[]> {
  try {
    const db = await getDatabase()
    const author = await db.collection<AuthorDoc>("authors").findOne({ slug })
    if (!author) return []
    return getBlogsByAuthorId(author._id.toString())
  } catch (error) {
    console.error("Failed to fetch blogs by authorSlug:", error)
    return []
  }
}

export async function getBlogsByCategory(
  categoryName: string
): Promise<PublicBlog[]> {
  try {
    const db = await getDatabase()
    const docs = await collection(db)
      .find({ ...PUBLIC_POST_FILTER, category: categoryName })
      .project({ editorState: 0 })
      .sort({ publishedAt: -1 })
      .toArray()

    return docs
      .map((doc) => transformPublicBlog(doc as BlogDocument))
      .filter((blog): blog is PublicBlog => blog !== null)
  } catch (error) {
    console.error("Failed to fetch blogs by category:", error)
    return []
  }
}

export async function getNextOrOldestBlog(
  currentPublishedAt: Date
): Promise<PublicBlog | null> {
  try {
    const db = await getDatabase()
    const posts = collection(db)
    const next = await posts.findOne(
      {
        ...PUBLIC_POST_FILTER,
        publishedAt: { $gt: currentPublishedAt },
      },
      { sort: { publishedAt: 1 }, projection: { editorState: 0 } }
    )

    if (next) return transformPublicBlog(next)

    const oldest = await posts.findOne(
      {
        ...PUBLIC_POST_FILTER,
        publishedAt: { $ne: currentPublishedAt },
      },
      { sort: { publishedAt: 1 }, projection: { editorState: 0 } }
    )

    return oldest ? transformPublicBlog(oldest) : null
  } catch (error) {
    console.error("Error fetching next or oldest blog:", error)
    return null
  }
}

export async function getDraftsForUser(
  userId: string
): Promise<DraftSummary[]> {
  if (!ObjectId.isValid(userId)) return []

  try {
    const db = await getDatabase()
    const author = await db.collection<AuthorDoc>("authors").findOne({
      userId: new ObjectId(userId),
    })
    if (!author) return []

    const docs = await collection(db)
      .find({
        status: "draft",
        authorId: author._id,
      })
      .project({
        title: 1,
        editorState: 1,
        updatedAt: 1,
      })
      .sort({ updatedAt: -1 })
      .toArray()
    const { extractPlainText } = await loadSerialization()

    return docs.map((doc) => {
      let snippet = ""
      try {
        snippet = extractPlainText(doc.editorState).trim().slice(0, 200)
      } catch {
        snippet = ""
      }

      return {
        id: doc._id.toString(),
        title: doc.title || "Untitled draft",
        snippet,
        updatedAt: new Date(doc.updatedAt).toISOString(),
      }
    })
  } catch (error) {
    console.error("Failed to fetch drafts:", error)
    return []
  }
}

export async function getAllBlogsForAdmin(): Promise<AdminPostSummary[]> {
  const db = await getDatabase()
  const docs = await collection(db)
    .find({})
    .project({ editorState: 0, contentHtml: 0 })
    .sort({ updatedAt: -1 })
    .toArray()
  return docs.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    author: doc.authorName,
    category: doc.category,
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  }))
}

export async function likeBlogBySlug(slug: string): Promise<number | null> {
  try {
    const db = await getDatabase()
    const updated = await collection(db).findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { likes: 1 } },
      { returnDocument: "after" }
    )
    return updated?.likes ?? null
  } catch (error) {
    console.error("Failed to increment blog like count:", error)
    return null
  }
}

export async function unlikeBlogBySlug(slug: string): Promise<number | null> {
  try {
    const db = await getDatabase()
    const updated = await collection(db).findOneAndUpdate(
      { slug, status: "published", likes: { $gt: 0 } },
      { $inc: { likes: -1 } },
      { returnDocument: "after" }
    )
    return updated?.likes ?? null
  } catch (error) {
    console.error("Failed to decrement blog like count:", error)
    return null
  }
}

export async function deleteBlog(
  blogId: string,
  authorUserId?: string
): Promise<ApiResponse<null>> {
  if (!ObjectId.isValid(blogId)) {
    return { ok: false, error: "Invalid blog id", status: 400 }
  }

  try {
    const db = await getDatabase()
    const posts = collection(db)
    const _id = new ObjectId(blogId)
    const existing = await posts.findOne({ _id })
    if (!existing) {
      return { ok: false, error: "Post not found", status: 404 }
    }

    if (authorUserId) {
      if (!ObjectId.isValid(authorUserId)) {
        return { ok: false, error: "Invalid author user ID", status: 400 }
      }

      const author = await db.collection<AuthorDoc>("authors").findOne({
        userId: new ObjectId(authorUserId),
      })
      if (!author || existing.authorId.toString() !== author._id.toString()) {
        return { ok: false, error: "Forbidden: not the owner", status: 403 }
      }
    }

    await posts.deleteOne({ _id })
    return { ok: true, data: null, status: 200 }
  } catch (error) {
    return serviceError(error)
  }
}

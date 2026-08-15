import type {
  Blog,
  EditableBlog,
  PublicBlog,
} from "@/types/blogType"
import type { BlogDocument } from "@/types/server/blogServerTypes"

function toIsoString(value: Date | string | undefined | null): string {
  return value ? new Date(value).toISOString() : new Date(0).toISOString()
}

export function transformBlog(doc: BlogDocument): Blog {
  return {
    id: doc._id.toString(),
    title: doc.title,
    contentHtml: doc.contentHtml,
    image: doc.image,
    author: doc.authorName,
    authorId: doc.authorId?.toString() ?? null,
    authorSlug: doc.authorSlug ?? null,
    category: doc.category,
    createdAt: toIsoString(doc.createdAt),
    updatedAt: toIsoString(doc.updatedAt),
    publishedAt: doc.publishedAt
      ? toIsoString(doc.publishedAt)
      : null,
    slug: doc.slug ?? null,
    likes: doc.likes ?? 0,
    status: doc.status,
  }
}

export function transformEditableBlog(
  doc: BlogDocument,
  plainText: string
): EditableBlog {
  return {
    ...transformBlog(doc),
    editorState: doc.editorState,
    plainText,
  }
}

export function transformPublicBlog(doc: BlogDocument): PublicBlog | null {
  if (
    doc.status !== "published" ||
    typeof doc.slug !== "string" ||
    !doc.slug ||
    typeof doc.contentHtml !== "string" ||
    !doc.publishedAt
  ) {
    return null
  }

  return {
    ...transformBlog(doc),
    contentHtml: doc.contentHtml,
    publishedAt: toIsoString(doc.publishedAt),
    slug: doc.slug,
    status: "published",
  }
}

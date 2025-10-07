// models/blogModel.ts (transformBlog)
import { Blog } from "@/types/blogType";

export const transformBlog = (doc: any): Blog => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  image: doc.image,
  author: doc.authorName ?? doc.author, // display name
  authorId: doc.authorId ? doc.authorId.toString() : null,
  authorSlug: doc.authorSlug || doc.authorSlugFromName || null,
  category: doc.category,
  createdAt: new Date(doc.createdAt).toISOString(),
  slug: doc.slug,
  likes: doc.likes || 0,
  status: doc.status || "published",
});

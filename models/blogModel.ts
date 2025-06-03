import { Blog } from "@/types/blogType";

export const transformBlog = (doc: any): Blog => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  image: doc.image,
  author: doc.author,
  category: doc.category,
  createdAt: new Date(doc.createdAt).toISOString(),
  slug: doc.slug, // newly added
});

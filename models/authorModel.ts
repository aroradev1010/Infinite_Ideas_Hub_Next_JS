import { Author } from "@/types/authorType";

export const transformAuthor = (doc: any): Author => ({
  id: doc._id.toString(),
  name: doc.name,
  bio: doc.bio,
  profileImage: doc.profileImage,
  createdAt: new Date(doc.createdAt).toISOString(),
  slug: doc.slug, // new
});

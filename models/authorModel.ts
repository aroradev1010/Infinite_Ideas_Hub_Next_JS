import { Author } from "@/types/authorType";

export const transformAuthor = (doc: any): Author => ({
  id: doc._id.toString(),
  userId: doc.userId?.toString(),
  name: doc.name,
  bio: doc.bio,
  profileImage: doc.profileImage,
  slug: doc.slug,
  createdAt: new Date(doc.createdAt).toISOString(),
  updatedAt: new Date(doc.updatedAt ?? doc.createdAt).toISOString(),
});

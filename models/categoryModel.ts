// models/categoryModel.ts
import { Category } from "@/types/categoryType";

export const transformCategory = (doc: any): Category => ({
  id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  categoryImage: doc.categoryImage ?? "/fallback.avif",
  description: doc.description ?? "",
  createdAt: new Date(doc.createdAt).toISOString(),
});

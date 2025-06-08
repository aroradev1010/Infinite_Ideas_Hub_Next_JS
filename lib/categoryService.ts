// lib/categoryService.ts
import clientPromise from "./mongodb";
import { transformCategory } from "@/models/categoryModel";
import { Category } from "@/types/categoryType";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db
      .collection("categories")
      .find(
        {},
        {
          projection: {
            name: 1,
            slug: 1,
            createdAt: 1,
            description: 1,
            categoryImage: 1,
          },
        }
      )
      .sort({ name: 1 })
      .toArray();
    return docs.map(transformCategory);
  } catch (error) {
    console.error("getAllCategories error:", error);
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db
      .collection("categories")
      .findOne(
        { slug },
        { projection: { name: 1, slug: 1, createdAt: 1, description: 1 } }
      );
    return doc ? transformCategory(doc) : null;
  } catch (error) {
    console.error("getCategoryBySlug error:", error);
    return null;
  }
}

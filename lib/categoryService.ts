// lib/categoryService.ts
import clientPromise from "./mongodb";
import { transformCategory } from "@/models/categoryModel";
import { Category } from "@/types/categoryType";
import { ObjectId } from "mongodb";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const cats = await db
      .collection("categories")
      .find({})
      .sort({ name: 1 })
      .toArray();
    return cats.map(transformCategory);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("categories").findOne({ slug });
    return doc ? transformCategory(doc) : null;
  } catch (err) {
    console.error("Failed to fetch category:", err);
    return null;
  }
}

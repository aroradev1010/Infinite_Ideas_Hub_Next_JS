import clientPromise from "./mongodb";
import { transformAuthor } from "@/models/authorModel";
import { Author } from "@/types/authorType";
import { ObjectId } from "mongodb";

export async function getAllAuthors(): Promise<Author[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const authors = await db
    .collection("authors")
    .find({})
    .sort({ name: 1 })
    .toArray();
  return authors.map(transformAuthor);
}

export async function getAuthorById(id: string): Promise<Author | null> {
  if (!ObjectId.isValid(id)) return null;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const doc = await db.collection("authors").findOne({ _id: new ObjectId(id) });
  return doc ? transformAuthor(doc) : null;
}

// ─── New: Fetch by slug ───────────────────
export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("authors").findOne({ slug });
    return doc ? transformAuthor(doc) : null;
  } catch (error) {
    console.error("Failed to fetch author by slug:", error);
    return null;
  }
}

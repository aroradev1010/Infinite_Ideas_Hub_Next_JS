// lib/authorService.ts
import clientPromise from "./mongodb";
import { transformAuthor } from "@/models/authorModel";
import { Author } from "@/types/authorType";
import { ObjectId } from "mongodb";

export async function getAllAuthors(): Promise<Author[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const docs = await db
      .collection("authors")
      .find(
        {},
        { projection: { name: 1, slug: 1, profileImage: 1, createdAt: 1 } }
      )
      .sort({ name: 1 })
      .toArray();
    return docs.map(transformAuthor);
  } catch (error) {
    console.error("getAllAuthors error:", error);
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db.collection("authors").findOne({ slug });
    return doc ? transformAuthor(doc) : null;
  } catch (error) {
    console.error("getAuthorBySlug error:", error);
    return null;
  }
}

export async function getAuthorById(id: string): Promise<Author | null> {
  if (!ObjectId.isValid(id)) return null;
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const doc = await db
      .collection("authors")
      .findOne({ _id: new ObjectId(id) });
    return doc ? transformAuthor(doc) : null;
  } catch (error) {
    console.error("getAuthorById error:", error);
    return null;
  }
}

export async function getAllAuthorsForAdmin(): Promise<Author[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const authors = await db
    .collection("authors")
    .find({})
    .sort({ createdAt: -1 })
    .project({ name: 1, bio: 1, profileImage: 1, slug: 1, createdAt: 1 })
    .toArray();

  return authors.map(transformAuthor);
}
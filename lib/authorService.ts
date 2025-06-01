import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";
import { transformAuthor } from "@/models/authorModel";
import { Author } from "@/types/authorType";

export async function upsertAuthor(
  name: string,
  bio: string,
  profileImage: string
): Promise<Author> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // Use case-insensitive match on `name` (you may adjust to use an email or slug if preferred)
  const filter = { name: { $regex: new RegExp(`^${name}$`, "i") } };
  const update = {
    $setOnInsert: {
      name,
      bio,
      profileImage,
      createdAt: new Date(),
    },
    // If you want to update bio/profileImage on existing author, you could also set:
    // $set: { bio, profileImage }
  };
  const options = { upsert: true, returnDocument: "after" as const };
  // returnDocument: "after" ensures the returned doc is the new or updated author

  const result = await db
    .collection("authors")
    .findOneAndUpdate(filter, update, options);

  if (!result || !result.value) {
    throw new Error("Failed to upsert author.");
  }

  const authorDoc = result.value;
  return transformAuthor(authorDoc);
}

export async function getAllAuthors(): Promise<Author[]> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const authors = await db
      .collection("authors")
      .find({})
      .sort({ name: 1 })
      .toArray();
    return authors.map(transformAuthor);
  } catch (err) {
    console.error("Failed to fetch authors:", err);
    return [];
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
  } catch (err) {
    console.error("Failed to fetch author:", err);
    return null;
  }
}

// lib/userService.ts
import clientPromise from "./mongodb";

export async function getAllUsersForAdmin() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const users = await db
    .collection("users")
    .find({})
    .sort({ createdAt: -1 })
    .project({ name: 1, email: 1, role: 1, image: 1, createdAt: 1 })
    .toArray();

  return users.map((u: any) => ({
    id: u._id.toString(),
    name: u.name || "",
    email: u.email || "",
    role: u.role || "user",
    image: u.image || "/fallback.avif",
    createdAt: u.createdAt?.toISOString?.() || "",
  }));
}

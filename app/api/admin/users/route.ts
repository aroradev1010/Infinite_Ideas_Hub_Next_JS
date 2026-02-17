// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole } from "@/lib/requireRole";

const deleteSchema = z.object({ id: z.string().min(1) });

/**
 * DELETE /api/admin/users?id=<userId>
 *
 * Hard-deletes a user and their associated author doc (if any).
 * Admin only.
 */
export async function DELETE(req: Request) {
  try {
    await requireRole(["admin"]);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const parsed = deleteSchema.safeParse({ id });
    if (!parsed.success || !ObjectId.isValid(id!)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const userId = new ObjectId(parsed.data.id);
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Delete the user
    const userResult = await db.collection("users").deleteOne({ _id: userId });
    if (userResult.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Also delete their author doc if one exists (cascade)
    await db.collection("authors").deleteOne({ userId });

    // Delete their NextAuth sessions and accounts (clean up OAuth data)
    await db.collection("sessions").deleteMany({ userId });
    await db.collection("accounts").deleteMany({ userId });

    return NextResponse.json({ ok: true, deleted: parsed.data.id });
  } catch (err: any) {
    if (err instanceof Response) return err;
    console.error("DELETE /api/admin/users error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
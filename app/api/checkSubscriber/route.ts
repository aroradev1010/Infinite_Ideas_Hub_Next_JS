import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireSession } from "@/lib/requireRole";

export async function GET() {
  try {
    const session = await requireSession();
    const email = session.user.email;

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const subscriber = await db.collection("subscribers").findOne({ email });

    if (!subscriber) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true }); // or false
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

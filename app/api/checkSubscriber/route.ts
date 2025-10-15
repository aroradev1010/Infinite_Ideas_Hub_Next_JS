import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

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
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

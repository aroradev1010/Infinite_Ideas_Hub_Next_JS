// app/api/confirm/route.ts

import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const pending = db.collection("pendingSubscribers");
    const subscribers = db.collection("subscribers");

    // Find the pending record
    const record = await pending.findOne({ token });
    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    // Move it to subscribers
    await subscribers.insertOne({
      email: record.email,
      subscribedAt: new Date(),
    });

    // Remove from pending
    await pending.deleteOne({ _id: new ObjectId(record._id) });

    // Optionally return a simple HTML page or JSON
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?subscribed=1`
    );

  } catch (err) {
    console.error("Error in confirm:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}

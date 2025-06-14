// app/api/confirmSubscription/route.ts

import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { Resend } from "resend";

const client = new MongoClient(process.env.MONGODB_URI!);
const resend = new Resend(process.env.RESEND_API_KEY!);
const audienceId = process.env.RESEND_AUDIENCE_ID!;

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

    const record = await pending.findOne({ token });
    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    // Add to confirmed subscribers
    await subscribers.insertOne({
      email: record.email,
      subscribedAt: new Date(),
    });

    // Remove from pending
    await pending.deleteOne({ _id: new ObjectId(record._id) });

    // Update contact in Resend to unsubscribed: false
    try {
      await resend.contacts.create({
        email: record.email,
        audienceId,
        unsubscribed: false,
      });
    } catch (err) {
      console.warn("Resend contact update failed:", err);
      // Not critical, continue anyway
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?subscribed=1`
    );
  } catch (err) {
    console.error("Error in confirmSubscription:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}

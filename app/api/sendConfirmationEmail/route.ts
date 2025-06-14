// app/api/sendConfirmationEmail/route.ts

import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Resend } from "resend";
import { ConfirmationEmail } from "@/components/emails/ConfirmationEmail";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY!);
const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const subscribers = db.collection("subscribers");
    const pending = db.collection("pendingSubscribers");

    const existingSubscriber = await subscribers.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json({ already: true });
    }

    // Create or reuse pending token
    let token: string;
    const existingPending = await pending.findOne({ email });
    if (existingPending) {
      token = existingPending.token;
    } else {
      token = uuidv4();
      await pending.insertOne({
        email,
        token,
        createdAt: new Date(),
      });
    }

    

    // Send confirmation email
    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/confirmSubscription?token=${token}`;
    await resend.emails.send({
      from: "Your App <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your subscription",
      react: await ConfirmationEmail({ email, confirmUrl }),
    });

    return NextResponse.json({ already: false });
  } catch (err) {
    console.error("Error in sendConfirmationEmail:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}

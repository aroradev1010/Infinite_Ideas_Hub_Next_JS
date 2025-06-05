// app/api/send-subscribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Resend } from "resend";
import { ConfirmationEmail } from "@/components/emails/ConfirmationEmail";

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

    // 1️⃣ Connect to MongoDB
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const subscribers = db.collection("subscribers");

    // 2️⃣ Check if already subscribed
    const existing = await subscribers.findOne({ email });
    if (existing) {
      return NextResponse.json({
        already: true,
        message: "Already subscribed",
      });
    }

    // 3️⃣ Insert into subscribers collection
    await subscribers.insertOne({ email, subscribedAt: new Date() });

    // 4️⃣ Send confirmation email (using "onboarding@resend.dev" test address)
    await resend.emails.send({
      from: "Your Name <onboarding@resend.dev>",
      to: [email],
      subject: "Please Confirm Your Subscription",
      react: ConfirmationEmail(),
    });

    return NextResponse.json({
      already: false,
      message: "Confirmation email sent",
    });
  } catch (err) {
    console.error("Error in send-subscribe:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}

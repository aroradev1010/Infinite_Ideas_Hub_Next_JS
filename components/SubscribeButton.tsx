// components/SubscribeButton.tsx
"use client";

import React, { useState } from "react";
import ProfileSubsribeImages from "./ProfileSubsribeImages";
import { Input } from "./ui/input";
import PrimaryButton from "./PrimaryButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SubscribeButton({
  classNameLayout,
  classNameHeading,
  classNameParagraph,
  classNameInput,
}: {
  classNameLayout?: string;
  classNameInput?: string;
  classNameParagraph?: string;
  classNameHeading?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sendConfirmationEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.already) {
          toast("You have already subscribed.");
        } else {
          toast("Confirmation Email Sent", {
            description: `Check ${email} for confirmation.`,
          });
        }
        setEmail("");
      } else {
        toast.error(data.error || "Failed to start subscription.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(`my-10 space-y-5`, classNameLayout)}>
      <ProfileSubsribeImages />
      <h1
        className={cn(`font-extrabold mb-5 tracking-wider`, classNameHeading)}
      >
        Get exclusive tips and updates delivered weekly to your inbox.
      </h1>
      <div className={cn(`flex max-w-sm items-center gap-2`, classNameInput)}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PrimaryButton
          text={loading ? "Sending..." : "Subscribe"}
          type="button"
          onClick={handleSubscribe}
        />
      </div>
      <p className={cn(`text-sm font-bold`, classNameParagraph)}>
        No spam emails. Just valuable content.
      </p>
    </div>
  );
}

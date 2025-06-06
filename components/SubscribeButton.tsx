"use client";
import React, { useCallback, useState } from "react";
import ProfileSubsribeImages from "./ProfileSubsribeImages";
import { Input } from "./ui/input";
import PrimaryButton from "./PrimaryButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";
import { sendSubscription } from "@/lib/SubscriptionService";

const emailSchema = z.string().email();

interface SubscribeButtonProps {
  classNameLayout?: string;
  classNameHeading?: string;
  classNameInput?: string;
  classNameParagraph?: string;
}

export default function SubscribeButton({
  classNameInput,
  classNameLayout,
  classNameHeading,
  classNameParagraph,
}: SubscribeButtonProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = useCallback(async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const data = await sendSubscription(parsed.data);
      if (data.already) {
        toast("You have already subscribed.");
      } else {
        toast("Confirmation Email Sent", {
          description: `Check ${parsed.data} for confirmation.`,
        });
        setEmail("");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <div className={cn("my-10 space-y-5", classNameLayout)}>
      <ProfileSubsribeImages />
      <h1
        className={cn("font-extrabold mb-5 tracking-wider", classNameHeading)}
      >
        Get exclusive tips and updates delivered weekly to your inbox.
      </h1>
      <div className={cn("flex max-w-sm items-center gap-2", classNameInput)}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PrimaryButton
          text={loading ? "Sending..." : "Subscribe"}
          onClick={handleSubscribe}
        />
      </div>
      <p className={cn("text-sm font-bold", classNameParagraph)}>
        No spam emails. Just valuable content.
      </p>
    </div>
  );
}

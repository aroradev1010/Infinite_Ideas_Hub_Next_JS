// components/SubscribeSection.tsx
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "./ui/input";
import PrimaryButton from "./PrimaryButton";
import { cn } from "@/lib/utils";
import { sendSubscription } from "@/lib/SubscriptionService";
import ProfileSubsribeImages from "./ProfileSubsribeImages";

const EmailSchema = z.string().email();

interface SubscribeSectionProps {
  className?: string;
  headingClassName?: string;
  inputWrapperClassName?: string;
  footerClassName?: string;
}

export default function SubscribeSection({
  className,
  headingClassName,
  inputWrapperClassName,
  footerClassName,
}: SubscribeSectionProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = useCallback(async () => {
    const result = EmailSchema.safeParse(email);
    if (!result.success) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { already } = await sendSubscription(result.data);
      toast(
        already ? "You’ve already subscribed." : "Check your inbox to confirm!",
        {
          description: already ? undefined : `Sent to ${result.data}`,
        }
      );
      if (!already) setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  return (
    <section className={cn("space-y-6", className)}>
      <ProfileSubsribeImages />
      <h2 className={cn("text-2xl font-extrabold", headingClassName)}>
        Get exclusive tips and updates delivered weekly to your inbox.
      </h2>
      <div className={cn("flex max-w-md gap-3", inputWrapperClassName)}>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <PrimaryButton
          onClick={handleSubscribe}
          // disabled={isLoading}
          text={isLoading ? "Sending…" : "Subscribe"}
        />
      </div>
      <p className={cn("text-sm text-gray-400", footerClassName)}>
        No spam — unsubscribe any time.
      </p>
    </section>
  );
}

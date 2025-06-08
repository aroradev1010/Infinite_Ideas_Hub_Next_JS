"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SubscriptionToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("subscribed") === "1") {
      toast.success("🎉 You have successfully subscribed to our newsletter!");
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}

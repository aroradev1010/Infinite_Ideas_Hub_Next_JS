"use client";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/"); // or redirect to dashboard or homepage
    }
  }, [status, router]);

  if (status === "loading") return null; // Optional loading UI
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="p-6 border rounded-xl shadow-lg space-y-4 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full"
        >
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}

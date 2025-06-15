"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Github, Chrome } from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "OAuthAccountNotLinked") {
      toast.error(
        "This email is already linked with another provider. Please try signing in with GitHub or Google instead."
      );
    }
  }, [searchParams]);

  if (status === "loading") return null;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="p-6 border rounded-xl shadow-lg space-y-4 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>

        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full text-white py-5 cursor-pointer"
        >
          <Github className="mr-2" />
          Sign in with GitHub
        </Button>

        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full text-white py-5 cursor-pointer"
        >
          <Chrome className="mr-2" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

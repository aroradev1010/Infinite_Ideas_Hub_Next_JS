"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function RootError({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="mb-4 text-gray-600">
        An unexpected error occurred. Please try again later.
      </p>
      <Link href="/" className="text-primary underline">
        Return to home
      </Link>
    </div>
  );
}

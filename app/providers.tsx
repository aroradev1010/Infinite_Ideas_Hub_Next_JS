// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { PreviewModeProvider } from "@/components/preview/PreviewModeProvider";

export function Providers({
  children,
  initialPreviewMode,
}: {
  children: React.ReactNode;
  initialPreviewMode: boolean;
}) {
  return (
    <SessionProvider>
      <PreviewModeProvider initialEnabled={initialPreviewMode}>
        <Toaster position="top-center" />
        {children}
      </PreviewModeProvider>
    </SessionProvider>
  );
}

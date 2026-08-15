// app/layout.tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { PreviewModeBanner } from "@/components/preview/PreviewModeBanner";
import { isPreviewCookieEnabled, PREVIEW_MODE_COOKIE } from "@/lib/previewMode";
import { Providers } from "./providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Infinite Ideas Hub",
  description: "Blogging Platform for Infinite Ideas",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialPreviewMode = isPreviewCookieEnabled(
    cookieStore.get(PREVIEW_MODE_COOKIE)?.value
  );

  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased dark`}>
        <Providers initialPreviewMode={initialPreviewMode}>
          <Navbar />
          <PreviewModeBanner />
          <div className="z-0 mb-20 page">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

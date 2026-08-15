// lib/requireRole.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

/**
 * TWO variants — use the right one for the right context:
 *
 * requireRole()      → for Route Handlers (route.ts files)
 *                      throws a NextResponse (short-circuits the handler)
 *
 * requireRolePage()  → for Server Components, Layouts, and Pages
 *                      uses redirect() which Next.js handles cleanly
 */

// ─── For Route Handlers ───────────────────────────────────────────────────────
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "user";

  if (!session || !allowedRoles.includes(role)) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}

// ─── For Server Components / Layouts / Pages ─────────────────────────────────
// Uses redirect() instead of throwing a NextResponse, which is the correct
// Next.js App Router pattern and won't cause RSC render crashes.
export async function requireRolePage(
  allowedRoles: string[],
  redirectTo = "/auth/sign-in"
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "user";

  if (!session) {
    redirect(redirectTo);
  }

  if (!allowedRoles.includes(role)) {
    redirect("/"); // redirect to home if authenticated but wrong role
  }

  return session;
}

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return session;
}

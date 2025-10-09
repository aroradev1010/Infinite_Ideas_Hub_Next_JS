// lib/requireRole.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Ensure the current server session exists and the user's role
 * is among allowedRoles. Throws a 403 NextResponse if not allowed.
 *
 * Returns the session (so callers can read session.user.id, etc.)
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "user";

  if (!session || !allowedRoles.includes(role)) {
    // Throwing a NextResponse here short-circuits the request in App Router.
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}

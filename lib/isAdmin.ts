import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

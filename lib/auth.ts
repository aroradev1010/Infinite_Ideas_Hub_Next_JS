import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    async session({ session, user }) {
      // Attach id and role to session
      session.user.id = user.id;
      session.user.role = (user as any).role || "user";
      return session;
    },
  },
  events: {
    // Called only when a new user is first created
    async createUser({ user }) {
      try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        await db.collection("users").updateOne(
          { email: user.email },
          {
            $set: {
              role: "user",
              name: user.name,
              image: user.image,
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
      } catch (err) {
        console.error("Error setting default role for user:", err);
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/sign-in");

  if (!session.user || session.user.role !== "admin") {
    return <p>Access Denied</p>;
  }
  

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Send Newsletter</h1>
      {/* Add your form here */}
    </div>
  );
}

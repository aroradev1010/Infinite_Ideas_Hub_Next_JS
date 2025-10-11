// app/dashboard/edit/[id]/page.tsx
import { requireRole } from "@/lib/requireRole";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import CreateEditBlogClient from "@/components/CreateEditBlogClient";
import { notFound, redirect } from "next/navigation";

export default async function EditBlogPage({ params }: { params: { id: string } }) {
    const session = await requireRole(["author", "admin"]); // returns session
    const userId = session.user?.id;

    const { id } = await params;
    if (!ObjectId.isValid(id)) return notFound();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const blog = await db.collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!blog) return notFound();

    // Ownership: authors can only edit their own blogs; admins can edit any
    const authorDoc = await db.collection("authors").findOne({ _id: blog.authorId });
    // authorDoc.userId is the users._id as ObjectId
    const isOwner = authorDoc && authorDoc.userId?.toString() === userId;
    const isAdmin = session.user?.role === "admin";

    if (!isOwner && !isAdmin) {
        // forbidden: redirect to dashboard list
        return redirect("/dashboard");
    }

    const payload = {
        id: blog._id.toString(),
        title: blog.title,
        description: blog.description,
        image: blog.image,
        category: blog.category,
        slug: blog.slug,
        status: blog.status || "draft",
    };

    return (
        <section className="py-10">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
                
                <CreateEditBlogClient initialBlog={payload} />
            </div>
        </section>
    );
}

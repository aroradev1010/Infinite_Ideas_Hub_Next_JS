// app/categories/page.tsx
import { getAllCategories } from "@/lib/categoryService";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="
              flex flex-col items-center justify-center
              p-8 bg-gray-900 rounded-2xl
              hover:bg-gray-800 transition-colors duration-200
            "
          >
            <h2 className="text-2xl font-semibold text-white capitalize mb-2">
              {cat.name}
            </h2>
            {cat.description && (
              <p className="text-gray-400 text-center">{cat.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

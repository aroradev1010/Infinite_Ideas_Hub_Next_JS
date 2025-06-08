// app/categories/page.tsx
import StarBackground from "@/components/StarBackground";
import CategoryCard from "@/components/CategoryCard";
import { getAllCategories } from "@/lib/categoryService";
import { Category } from "@/types/categoryType";

export default async function CategoriesPage() {
  const categories: Category[] = await getAllCategories();

  return (
    <div className="min-h-screen">
      <div className="h-96">
        <StarBackground
          imageSrc="/categoriesPage.webp"
          text=""
          imageClassName="rounded-full h-[150px] w-[150px] mb-2"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-center gap-10">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}

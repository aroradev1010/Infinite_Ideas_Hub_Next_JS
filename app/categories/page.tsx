import CategoryCard from "@/components/CategoryCard"
import StarBackground from "@/components/StarBackground"
import { BLOG_CATEGORIES } from "@/lib/blogCategories"

export default function CategoriesPage() {
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
          {BLOG_CATEGORIES.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </div>
  )
}

// app/page.tsx
import Header from "@/components/Header";
import FeaturedArticle from "@/components/FeaturedArticle";
import { getFeaturedArticle } from "@/lib/blogService";
import LatestArticles from "@/components/LatestArticles";

export default async function Home() {
  const featuredArticle = await getFeaturedArticle();

  return (
    <div>
      <div className="h-96">
        <Header />
      </div>
      <div className="lg:mx-auto lg:w-3/5">
        {featuredArticle ? (
          <FeaturedArticle article={featuredArticle} />
        ) : (
          <p className="text-center py-10 text-gray-500">No article found.</p>
        )}
      </div>
      <div className="lg:mx-auto lg:w-3/5">
        <LatestArticles />
      </div>
    </div>
  );
}

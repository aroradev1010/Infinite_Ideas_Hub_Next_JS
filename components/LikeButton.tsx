"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";

export default function LikeButton({
  slug,
  initialLikes,
}: {
  slug: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const likedBlogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");
    setLiked(likedBlogs.includes(slug));
  }, [slug]);

  const handleToggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/blog/${liked ? "unlike" : "like"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to like/unlike");

      setLikes(data.likes);
      const likedBlogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");

      if (liked) {
        const updated = likedBlogs.filter((s: string) => s !== slug);
        localStorage.setItem("likedBlogs", JSON.stringify(updated));
        setLiked(false);
      } else {
        likedBlogs.push(slug);
        localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
        setLiked(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 600); // debounce
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      aria-label={liked ? "Unlike" : "Like"}
      className={`flex items-center gap-2 transition-colors duration-200 ${
        liked ? "text-red-500" : "text-gray-500"
      } ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart fill={liked ? "currentColor" : "none"} />
      )}
      <span>{likes}</span>
    </button>
  );
}

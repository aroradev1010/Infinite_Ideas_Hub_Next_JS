"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

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

  async function handleToggleLike() {
    if (loading) return;
    setLoading(true);

    const res = await fetch(`/api/blog/${liked ? "unlike" : "like"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return;
    }

    setLikes(data.likes);
    const likedBlogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");

    if (liked) {
      // Unlike
      const updated = likedBlogs.filter((s: string) => s !== slug);
      localStorage.setItem("likedBlogs", JSON.stringify(updated));
      setLiked(false);
    } else {
      // Like
      likedBlogs.push(slug);
      localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));
      setLiked(true);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
        liked ? "text-red-500" : "text-gray-500 cursor-pointer"
      }`}
    >
      <Heart fill={liked ? "currentColor" : "none"} />
      <span
        className={`${liked ? "text-gray-300" : "text-gray-500 cursor-pointer"}`}
      >
        {likes}
      </span>
    </button>
  );
}

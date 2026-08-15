export const BLOG_CATEGORIES = [
  {
    name: "Backend",
    slug: "backend",
    image: "/categories/backend.webp",
  },
  {
    name: "DevOps",
    slug: "devops",
    image: "/categories/devops.jpeg",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    image: "/categories/cybersecurity.jpg",
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    image: "/categories/machine-learning.jpg",
  },
] as const

export const DEFAULT_BLOG_CATEGORY = BLOG_CATEGORIES[0].name

export type BlogCategoryDefinition = (typeof BLOG_CATEGORIES)[number]
export type BlogCategoryName = BlogCategoryDefinition["name"]

export function isBlogCategory(value: string): value is BlogCategoryName {
  return BLOG_CATEGORIES.some((category) => category.name === value)
}

export function getBlogCategoryBySlug(
  slug: string
): BlogCategoryDefinition | undefined {
  return BLOG_CATEGORIES.find((category) => category.slug === slug)
}

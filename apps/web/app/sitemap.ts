import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes = [
  "/wellness",
  "/wellness/fitness",
  "/wellness/hydration",
  "/wellness/journal",
  "/wellness/mindfulness",
  "/wellness/progress",
  "/shop",
  "/shop/products",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: route === "/wellness" || route === "/shop" ? 1 : 0.7,
  }));
}

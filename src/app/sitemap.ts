import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://gochauffeur.lk";
  return ["", "/destinations", "/things-to-do", "/privacy", "/terms"].map((path) => ({ url: `${site}${path}` }));
}

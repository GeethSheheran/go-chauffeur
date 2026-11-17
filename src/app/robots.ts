import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  // Keep the frontend review out of search until final content and launch are approved.
  return { rules: { userAgent: "*", disallow: "/" } };
}

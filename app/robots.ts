import type { MetadataRoute } from "next";

const SITE_URL = "https://washfieldofficer.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/dashboard", "/assets", "/complaints", "/reports", "/settings", "/field", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

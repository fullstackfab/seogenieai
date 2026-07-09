import type { MetadataRoute } from "next";
import { servicesData } from "@/lib/services-data";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.seogenieai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about-us", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/contact-us", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/ai-audit", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/insight", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/keyword-planner", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/website-analysis", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms-of-conditions", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms-of-services", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${BASE}${r.path}`,
      lastModified: new Date(),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...servicesData.map((s) => ({
      url: `${BASE}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

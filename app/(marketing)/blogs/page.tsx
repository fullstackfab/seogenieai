// Rendering: SSG — Coming Soon placeholder.
// The legacy blogs feature (Contentful GraphQL fetch) was dead/commented-out code; dropped in this
// rebuild. The route is kept live so the /blogs URL still resolves instead of 404ing.
import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Blogs - SeoGenieAI",
  description: "SeoGenieAI blog — coming soon.",
  alternates: { canonical: "/blogs" },
};

export default function BlogsPage() {
  return <ComingSoon />;
}

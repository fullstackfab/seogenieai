// Rendering: SSG shell — fully client-driven form + streamed result, no request-time data.
import type { Metadata } from "next";
import { ContentWriterView } from "@/sections/content-writer/content-writer-view";

export const metadata: Metadata = {
  title: "AI Content Writer",
  description:
    "Generate SEO-ready blog posts, product descriptions, ad copy, and social media content with SEOGenieAI's AI content writer.",
  alternates: { canonical: "/content-writer" },
};

export default function ContentWriterPage() {
  return <ContentWriterView />;
}

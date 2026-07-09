// Rendering: SSG — static landing page; the URL input is a client leaf.
import type { Metadata } from "next";
import { AiAuditLandingView } from "@/sections/ai-audit/landing-view";

export const metadata: Metadata = {
  title: "Free AI Readiness Audit",
  description:
    "Check how AI systems like ChatGPT, Gemini, and Perplexity see your site. Get an instant readiness report — free, no signup needed.",
  alternates: { canonical: "/ai-audit" },
  openGraph: {
    title: "Free AI Readiness Audit",
    description: "Check how AI systems like ChatGPT, Gemini, and Perplexity see your site.",
    url: "/ai-audit",
    type: "website",
  },
};

export default function AiAuditPage() {
  return <AiAuditLandingView />;
}

// Rendering: SSG shell — Welcome is static; HomeSearch is a client leaf (auth-aware routing).
import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { Welcome } from "@/sections/home/welcome";
import { HomeSearch } from "@/sections/home/home-search";

export const metadata: Metadata = {
  title: "SEOGenieAI — AI-Powered SEO & Digital Marketing Tools",
  description:
    "Analyse your website traffic, domain authority, backlinks, keywords and AI visibility with SEOGenieAI's free AI-powered SEO tools.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SEOGenieAI — AI-Powered SEO & Digital Marketing Tools",
    description:
      "Analyse your website traffic, domain authority, backlinks, keywords and AI visibility with SEOGenieAI's free AI-powered SEO tools.",
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <Container>
      <Welcome />
      <HomeSearch />
    </Container>
  );
}

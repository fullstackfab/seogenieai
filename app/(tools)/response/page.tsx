// Rendering: SSG shell — client leaf streams the AI response for the prompt from the home search.
import type { Metadata } from "next";
import { ResponseView } from "@/sections/response/response-view";

export const metadata: Metadata = {
  title: "AI Content Response",
  robots: { index: false, follow: false },
};

export default function ResponsePage() {
  return <ResponseView />;
}

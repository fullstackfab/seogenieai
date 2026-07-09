"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";

const EXAMPLE_SITES = ["apple.com", "shopify.com", "notion.so", "vercel.com"];

export function AiAuditLandingView() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL.");
      return;
    }
    setError("");
    router.push(`/ai-audit/report?url=${encodeURIComponent(trimmed)}`);
  }

  return (
    <Wrapper className="min-h-[calc(100vh-290px)] flex flex-col">
      <Container>
        <Wrapper className="pt-8">
          <BackToHome heading="Back to home" link="/" />
        </Wrapper>
      </Container>

      <Wrapper className="flex-1 flex items-center justify-center py-16 px-4">
        <Wrapper className="max-w-[720px] w-full mx-auto text-center">
          <Wrapper className="inline-flex items-center gap-2 bg-dark-100/10 text-dark-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 mx-auto">
            <span className="w-2 h-2 rounded-full bg-dark-100 animate-pulse inline-block" />
            Free Instant Analysis
          </Wrapper>

          <h1 className="text-5xl max-md-tab:text-3xl font-bold text-dark-100 tracking-tight leading-tight mb-4">
            Is Your Website
            <br />
            <span className="text-dark-100 opacity-60">Ready for the AI Era?</span>
          </h1>

          <p className="text-gray-500 text-lg max-w-[500px] mx-auto mb-10 leading-relaxed">
            Check how AI systems like ChatGPT, Gemini, and Perplexity see your site. Get an instant
            readiness report — free, no signup needed.
          </p>

          <Wrapper className="relative mb-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter website URL (e.g. yoursite.com)"
              className="w-full border-2 border-dark-100/20 focus:border-dark-100 rounded-[12px] px-6 py-4 pr-[160px] text-base text-dark-100 placeholder:text-gray-400 bg-white outline-none transition-colors duration-200 max-sm-tab:pr-6 max-sm-tab:pb-16"
            />
            <button
              onClick={handleSubmit}
              aria-label="Analyze Website"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-dark-100 text-white px-6 py-2.5 rounded-[8px] text-sm font-semibold hover:bg-dark-100/90 transition-all duration-200 max-sm-tab:bottom-2 max-sm-tab:top-auto max-sm-tab:right-2 max-sm-tab:translate-y-0 max-sm-tab:w-[calc(100%-16px)]"
            >
              Analyze Website
            </button>
          </Wrapper>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <Wrapper className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-gray-400 text-sm">Try:</span>
            {EXAMPLE_SITES.map((site) => (
              <button
                key={site}
                aria-label={`Try example site: ${site}`}
                onClick={() => setUrl(site)}
                className="text-sm text-dark-100 underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                {site}
              </button>
            ))}
          </Wrapper>
        </Wrapper>
      </Wrapper>
    </Wrapper>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart, ArrowRight, Loader2, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Container, Wrapper } from "@/components/ui/primitives";
import { Text } from "@/components/ui/typography";
import { BackToHome } from "@/components/ui/buttons";
import { LocationSelect } from "@/components/location-select";
import { TagInput } from "@/components/forms/tag-input";
import { useToast } from "@/providers/toast-provider";

const MAX_KEYWORDS = 10;

const INPUT_CLASS =
  "max-md-mobile:p-6 p-4 placeholder:opacity-80 focus:border-dark-100 focus:ring-4 focus:ring-dark-100/10 border-2 border-black/15 w-full bg-white transition-colors duration-200 rounded-[10px] text-base font-normal text-[#171717] leading-[15.96px] tracking-[0.02em]";

/** No free preview step here — this form itself is the checkout trigger for the $9.99 pack. */
export function RankTrackerView() {
  const { showError } = useToast();
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [country, setCountry] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedDomain = domain.trim();
    if (!trimmedDomain) {
      showError("Please enter a domain to track.");
      return;
    }
    if (keywords.length === 0) {
      showError("Add at least one keyword to track.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/rank-tracker-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmedDomain, keywords, country }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        showError(data.error ?? "Failed to start checkout. Please try again.");
        return;
      }
      if (data.alreadyActive) {
        router.push(`/rank-tracker/packs/${data.packId}`);
        return;
      }
      window.location.href = data.url;
    } catch {
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <div className="max-w-[800px] mx-auto mt-16 mb-16">
        <Wrapper className="flex items-center justify-between flex-wrap gap-3">
          <BackToHome />
          <Link
            href="/rank-tracker/packs"
            className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
          >
            <FolderOpen className="w-4 h-4" aria-hidden="true" />
            My Rank Trackers
          </Link>
        </Wrapper>

        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-dark-100 text-white">
            <LineChart className="w-5 h-5" aria-hidden="true" />
          </span>
          <h1 className="text-[#171717] mt-5 text-[32px] font-bold leading-[1.15] tracking-[-0.01em] max-md-mobile:text-2xl">
            Rank Tracker
          </h1>
          <p className="mt-3 text-[15px] text-[#475569] max-w-130">
            Track your Google ranking for up to 10 keywords, checked daily for 30 days, with a trend
            chart for each one.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-black/5 bg-white p-6 shadow-6xl max-md-mobile:p-4"
        >
          <label htmlFor="rank-tracker-domain" className="mb-2 block text-[14px] font-medium text-[#171717]">
            Website domain
          </label>
          <input
            id="rank-tracker-domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className={INPUT_CLASS}
          />

          <label
            htmlFor="rank-tracker-keywords"
            className="mb-2 mt-4 block text-[14px] font-medium text-[#171717]"
          >
            Keywords to track
          </label>
          <TagInput
            id="rank-tracker-keywords"
            tags={keywords}
            onChange={(next) => setKeywords(next.slice(0, MAX_KEYWORDS))}
            placeholder="best running shoes"
            maxTotalLength={500}
          />
          <Text className="mt-2 leading-normal! text-[#64748b]">
            {keywords.length}/{MAX_KEYWORDS} keywords added.
          </Text>

          <div className="mt-4">
            <LocationSelect onChange={(loc) => loc.country !== undefined && setCountry(loc.country)} />
          </div>

          <div className="mt-6 flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-dark-100">$9.99</span>
            <span className="text-sm text-gray-400">one-time · 30 days · daily checks</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 max-md-mobile:p-6 p-4 w-full mt-6 text-center text-base font-semibold rounded-[10px] bg-dark-100 text-white cursor-pointer transition-colors duration-200 hover:bg-dark-100/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="w-4.5 h-4.5" aria-hidden="true" />
            )}
            {loading ? "Redirecting to payment…" : "Start Tracking — $9.99"}
          </button>
        </form>
      </div>
    </Container>
  );
}

"use client";

import Link from "next/link";
import {
  Search,
  Gauge,
  PenLine,
  KeyRound,
  Zap,
  LineChart,
  ArrowRight,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { H4, Text } from "@/components/ui/typography";
import { useAnalysis } from "@/providers/analysis-provider";
import { searchSuggestions, type SearchSuggestion } from "@/lib/search-suggestions";

const CARD_STYLE: Record<
  SearchSuggestion["key"],
  { icon: LucideIcon; iconBg: string; arrowBg: string }
> = {
  domain: { icon: Search, iconBg: "bg-blue-500", arrowBg: "bg-blue-500" },
  websiteAnalysis: { icon: Gauge, iconBg: "bg-emerald-500", arrowBg: "bg-emerald-500" },
  content: { icon: PenLine, iconBg: "bg-violet-500", arrowBg: "bg-violet-500" },
  keyword: { icon: KeyRound, iconBg: "bg-amber-500", arrowBg: "bg-amber-500" },
  insight: { icon: Zap, iconBg: "bg-pink-500", arrowBg: "bg-pink-500" },
  rankTracker: { icon: LineChart, iconBg: "bg-dark-100", arrowBg: "bg-dark-100" },
};

/** Home-page suggestion cards; "/"-linked cards select an in-place search mode instead of navigating. */
export function SearchSuggestionList() {
  const { selectedPrimaryOption, setSelectedPrimaryOption } = useAnalysis();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {searchSuggestions.map((item) => (
        <SuggestionCard
          key={item.key}
          item={item}
          selected={item.key === selectedPrimaryOption}
          onSelect={() => setSelectedPrimaryOption(item.key)}
        />
      ))}
      {/* <ProUpsellCard /> */}
    </div>
  );
}

function SuggestionCard({
  item,
  selected,
  onSelect,
}: {
  item: SearchSuggestion;
  selected: boolean;
  onSelect: () => void;
}) {
  const { icon: Icon, iconBg, arrowBg } = CARD_STYLE[item.key];

  return (
    <div
      className={`group relative rounded-2xl border p-5 pr-14 transition-all duration-200 ${
        selected
          ? "border-dark-100 bg-white shadow-6xl"
          : "border-black/5 bg-white hover:shadow-6xl hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`inline-flex shrink-0 items-center justify-center w-11 h-11 rounded-xl text-white ${iconBg}`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <div>
          <H4 className="text-[#171717]">{item.title}</H4>
          <Text className="mt-1 text-[#64748b]">{item.content}</Text>
        </div>
      </div>

      {item.link !== "/" ? (
        <Link href={item.link} className="absolute inset-0 rounded-2xl" aria-label={item.title} />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          className="absolute inset-0 rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dark-100/30"
          aria-label={item.title}
          aria-pressed={selected}
        />
      )}

      <span
        className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-transform duration-200 group-hover:translate-x-0.5 ${arrowBg}`}
      >
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </span>
    </div>
  );
}

/** Placeholder upsell card — no pricing page exists yet, so it doesn't link anywhere. */
function ProUpsellCard() {
  return (
    <div className="relative rounded-2xl border border-dark-100/15 bg-dark-100/5 p-5">
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-dark-100/10 text-dark-100">
        <Gift className="w-5 h-5" aria-hidden="true" />
      </span>
      <H4 className="mt-4 text-dark-100">Unlock More with SEOGenieAI Pro</H4>
      <Text className="mt-1 text-[#64748b]">
        Get advanced reports, unlimited access, and personalized recommendations.
      </Text>
      <button
        type="button"
        disabled
        title="Coming soon"
        aria-label="Explore Plans (coming soon)"
        className="mt-4 rounded-[9px] border border-dark-100/30 px-4 py-2 text-[13px] font-semibold text-dark-100 opacity-60 cursor-not-allowed"
      >
        Explore Plans
      </button>
    </div>
  );
}

"use client";

import { CreditCard, Zap, Sparkles, ShieldCheck, Users, Target, Headphones } from "lucide-react";
import { SearchBox } from "@/components/search/search-box";
import { SearchSuggestionList } from "@/components/search/search-suggestion-list";

const TRUST_BADGES = [
  { icon: CreditCard, label: "No Credit Card Required" },
  { icon: Zap, label: "Instant Results" },
  { icon: Sparkles, label: "AI-Powered Insights" },
  { icon: ShieldCheck, label: "Secure & Private" },
];

const STATS = [
  { icon: Users, label: "Trusted by", value: "500+ Businesses" },
  { icon: Sparkles, label: "AI-Powered", value: "Smart Analysis" },
  { icon: Target, label: "98%", value: "Accuracy Rate" },
  { icon: Headphones, label: "24/7", value: "Support" },
];

/** Client leaf: the only interactive part of the home page. */
export function HomeSearch() {
  return (
    <>
      <SearchBox />

      <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 justify-center">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-1.5 text-[13px] text-[#475569]">
            <Icon className="w-4 h-4 text-dark-100/70" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <SearchSuggestionList />
      </div>

      <div className="mt-6 mb-12 max-md-mobile:grid max-md-mobile:grid-cols-2  rounded-[14px] bg-white/70 border border-black/5 px-6 py-5 flex flex-wrap items-center justify-around gap-6 ">
        {STATS.map(({ icon: Icon, label, value }) => (
          <div key={value} className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-dark-100" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-[13px] text-[#475569]">{label}</p>
              <p className="text-[15px] font-semibold text-[#171717]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

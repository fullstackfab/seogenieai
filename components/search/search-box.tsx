"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { SendHorizontal, RotateCcw, Globe, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAnalysis } from "@/providers/analysis-provider";
import { useToast } from "@/providers/toast-provider";
import { isValidDomainString } from "@/lib/validation/domain";

/**
 * Central search form driving the whole "what do you want to analyse" flow.
 * Routes to /options (GA, requires sign-in), /insight, /website-analysis, or
 * /response depending on `selectedPrimaryOption`.
 */
export function SearchBox({ value, refresh }: { value?: string; refresh?: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showError } = useToast();
  const { setDomain, setPromptMessage, selectedPrimaryOption } = useAnalysis();
  const [searchValue, setSearchValue] = useState(value ?? "");
  const [disabled, setDisabled] = useState(false);

  const placeholder =
    selectedPrimaryOption === "domain" ||
    selectedPrimaryOption === "insight" ||
    selectedPrimaryOption === "websiteAnalysis"
      ? "Enter your domain name (www.example.com)"
      : "Enter your writing topic";

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      selectedPrimaryOption === "domain" ||
      selectedPrimaryOption === "insight" ||
      selectedPrimaryOption === "websiteAnalysis"
    ) {
      if (!isValidDomainString(searchValue)) {
        showError("Please add a valid domain.");
        return;
      }
      setDisabled(true);
      setDomain(searchValue);
      if (selectedPrimaryOption === "domain") {
        if (session) router.push("/options");
        else signIn("google", { callbackUrl: "/options" });
      } else if (selectedPrimaryOption === "insight") {
        router.push("/insight");
      } else {
        router.push("/website-analysis");
      }
      return;
    }

    setDisabled(true);
    setPromptMessage(searchValue);
    router.push("/response");
  };

  if (refresh) {
    return (
      <form className="relative w-full mt-[14px]" onSubmit={submitForm}>
        <Input
          disabled={disabled}
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          required
          className="max-md-mobile:p-6 p-8 pr-[60px] focus:border-dark-100 focus:ring-4 focus:ring-dark-100/10 border-2 border-black/15 placeholder:text-[#64748b] w-full bg-white transition-colors duration-200 rounded-[10px] shadow-6xl max-mb:text-[12px] text-base font-normal text-[#171717] leading-[15.96px] tracking-[0.02em]"
          name="search"
        />
        <Link
          href="/"
          className="absolute top-[19px] right-[15px] max-mb-mobile:top-[15px] max-mb-mobile:right-[15px] cursor-pointer text-dark-100 opacity-80 transition-opacity duration-200 hover:opacity-100"
          aria-label="Start a new search"
        >
          <RotateCcw className="w-[42px] h-[43px] max-mb:w-[25px] max-mb:h-[25px]" />
        </Link>
      </form>
    );
  }

  return (
    <form
      className="relative w-full mt-[14px] flex items-center gap-3 rounded-[14px] border-2 border-black/10 bg-white p-2 shadow-6xl max-md-mobile:flex-col max-md-mobile:items-stretch"
      onSubmit={submitForm}
    >
      <Globe
        className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] max-md-mobile:hidden"
        aria-hidden="true"
      />
      <Input
        disabled={disabled}
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        required
        wrapperClassName="flex-1"
        className="border-0 py-4 pl-12 pr-3 max-md-mobile:pl-4 focus:ring-0 placeholder:text-[#64748b] w-full bg-transparent text-base font-normal text-[#171717] leading-[15.96px] tracking-[0.02em]"
        name="search"
      />
      <button
        aria-label="Analyze Now"
        className="flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-dark-100 px-6 py-4 text-base font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-dark-100/90 disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        disabled={disabled}
      >
        Analyze Now
        <ArrowRight className="w-4.5 h-4.5" aria-hidden="true" />
      </button>
    </form>
  );
}

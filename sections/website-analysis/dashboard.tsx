"use client";

import Link from "next/link";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useAnalysis } from "@/providers/analysis-provider";
import { TrafficSection } from "./sections/traffic-section";
import { TrafficByCountrySection } from "./sections/traffic-by-country-section";
import { TrafficHistorySection } from "./sections/traffic-history-section";
import { DomainAuthoritySection } from "./sections/domain-authority-section";
import { BacklinksSection } from "./sections/backlinks-section";
import { DomainAgeSection } from "./sections/domain-age-section";
import { CompetitorSection } from "./sections/competitor-section";
import { AiVisibilitySection } from "./sections/ai-visibility-section";

/**
 * Developer toggles — held sections (serpChecker/serpAnalyzer) match the
 * legacy ENABLED_SECTIONS flags; flip to true once ready to ship them.
 */
const ENABLED_SECTIONS = {
  traffic: true,
  trafficByCountry: true,
  trafficHistory: true,
  domainAuthority: true,
  backlinks: true,
  domainAge: true,
  competitorAnalysis: true,
  aiVisibility: true,
  serpChecker: false,
  serpAnalyzer: false,
};

export function WebsiteAnalysisDashboard() {
  const { domain } = useAnalysis();
  const cleanDomain = domain ? domain.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "";

  if (!cleanDomain) {
    return (
      <Container className="min-h-[calc(100vh-290px)] flex flex-col">
        <Wrapper className="py-8">
          <BackToHome />
        </Wrapper>
        <Wrapper className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-dark-100 mb-3">No domain provided</h1>
            <p className="text-black/60 mb-6">Please go back to the home page and enter a domain to analyse.</p>
            <Link
              href="/"
              className="inline-block pt-[7px] pb-2 px-[21px] text-base font-normal rounded-[9px] border border-dark-100 bg-dark-100 text-white hover:bg-transparent hover:text-dark-100 transition-colors duration-300"
            >
              ← Back to Home
            </Link>
          </div>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container className="min-h-[calc(100vh-290px)]">
      <Wrapper className="py-6 flex items-start justify-between flex-wrap gap-4 mb-2">
        <BackToHome />
        <div>
          <h1 className="text-2xl font-semibold text-dark-100">Website Analysis</h1>
          <p className="text-sm opacity-50 mt-0.5">
            Analysing{" "}
            <a
              href={`https://${cleanDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-100 font-semibold underline underline-offset-2 opacity-100"
            >
              {cleanDomain}
            </a>
          </p>
        </div>
      </Wrapper>

      <div className="pb-16">
        {ENABLED_SECTIONS.traffic && <TrafficSection domain={cleanDomain} />}
        {ENABLED_SECTIONS.trafficByCountry && <TrafficByCountrySection domain={cleanDomain} />}
        {ENABLED_SECTIONS.trafficHistory && <TrafficHistorySection domain={cleanDomain} />}
        {ENABLED_SECTIONS.domainAuthority && <DomainAuthoritySection domain={cleanDomain} />}
        {ENABLED_SECTIONS.backlinks && <BacklinksSection domain={cleanDomain} />}
        {ENABLED_SECTIONS.domainAge && <DomainAgeSection domain={cleanDomain} />}
        {ENABLED_SECTIONS.competitorAnalysis && <CompetitorSection domain={cleanDomain} />}
        {ENABLED_SECTIONS.aiVisibility && <AiVisibilitySection domain={cleanDomain} />}
      </div>
    </Container>
  );
}

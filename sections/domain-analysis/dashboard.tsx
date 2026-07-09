"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Users, UserPlus, Clock, DollarSign, Sparkles, Loader2, FileBarChart } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { HireExpert } from "@/components/hire-expert";
import { AiReportModal } from "@/components/ai-report-modal";
import { useAnalysis, type AnalysisOption } from "@/providers/analysis-provider";
import { useToast } from "@/providers/toast-provider";
import { DomainAiReportPaywall } from "./ai-report-paywall";
import { RankedList } from "./ranked-list";
import { PageReportTable } from "./page-report-table";
import { MostPopular } from "./most-popular";
import { SearchConsoleTable } from "./search-console-table";
import type { PageRow, SearchConsoleData } from "./types";

// react-google-charts pulls in its own gstatic loader — deferred until this
// dashboard actually renders (never needed on the initial page load) instead
// of shipping in every route's client bundle.
const chartLoading = (
  <div className="bg-white rounded-2xl mt-4 flex-[2] h-[400px] animate-pulse" />
);
const NewUserChart = dynamic(() => import("./new-user-chart").then((m) => m.NewUserChart), {
  ssr: false,
  loading: () => chartLoading,
});
const CountryChart = dynamic(() => import("./country-chart").then((m) => m.CountryChart), {
  ssr: false,
  loading: () => chartLoading,
});
const TopFivePages = dynamic(() => import("./top-five-pages").then((m) => m.TopFivePages), {
  ssr: false,
  loading: () => chartLoading,
});

type AnalyticsReport = {
  noAnalyticsAccountFound?: boolean;
  noMatchFoundForDomain?: boolean;
  snapshotHeaderValues?: {
    activeUsers?: number;
    newUsers?: number;
    averageEngagementTime?: string;
    totalRevenue?: string;
  };
  newUserGroupingValues?: Record<string, number>;
  sessionGroupingValues?: Record<string, number>;
  countryWiseUsers?: Record<string, number>;
  pageReportPerPageCountValues?: PageRow[];
  titleWiseVisitCountValues?: PageRow[];
  searchConsoleData?: SearchConsoleData;
};

type CachedScan = { googleResponse: unknown; dataOption: AnalysisOption };
const cacheKey = (domain: string) => `domain-analysis-scan:${domain}`;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

/** GA4 + Search Console dashboard populated from /options → /api/google/analytics-report. */
export function DomainAnalysisDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { domain, googleResponse, setGoogleResponse, dataOption, setDataOption } = useAnalysis();
  const { showError } = useToast();

  const [unlockChecked, setUnlockChecked] = useState(false);
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [reportHtml, setReportHtml] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [verifiedSessionId, setVerifiedSessionId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [generating, setGenerating] = useState(false);

  const report = googleResponse as AnalyticsReport | undefined;

  const checkUnlocked = useCallback(async () => {
    if (!domain) return;
    try {
      const res = await fetch(`/api/domain-analysis/report?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (data.unlocked && data.html) {
        setReportHtml(data.html);
        setReportUnlocked(true);
      }
    } catch {
      // Non-fatal — the user can still pay to unlock/generate.
    } finally {
      setUnlockChecked(true);
    }
  }, [domain]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the cached-report lookup once the domain is known
    void checkUnlocked();
  }, [checkUnlocked]);

  // Persist the scan to sessionStorage (keyed by domain) so it survives the
  // full-page round trip to Stripe Checkout and back — without this, the
  // AnalysisProvider context resets and the redirect-home guard below would
  // fire before ?session_id= is ever processed.
  useEffect(() => {
    if (!domain) {
      if (!report) router.replace("/");
      return;
    }
    if (report) {
      sessionStorage.setItem(cacheKey(domain), JSON.stringify({ googleResponse: report, dataOption } satisfies CachedScan));
      return;
    }
    const cached = sessionStorage.getItem(cacheKey(domain));
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CachedScan;
        setGoogleResponse(parsed.googleResponse);
        setDataOption(parsed.dataOption);
        return;
      } catch {
        // fall through to redirect home
      }
    }
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, report]);

  useEffect(() => {
    if (!report) return;
    if (report.noAnalyticsAccountFound || report.noMatchFoundForDomain) {
      showError("No matching Google Analytics data was found for this domain.");
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  // Confirm the Stripe session as soon as we return from checkout — decoupled
  // from report-readiness so the URL is cleaned up immediately either way.
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off verification of the returning Stripe session
    setVerifying(true);
    fetch(`/api/stripe/analytics-verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setVerifiedSessionId(sessionId);
        } else {
          showError(data.error ?? "Couldn't confirm your payment. Please try again.");
        }
      })
      .catch(() => {
        if (!cancelled) showError("Couldn't confirm your payment. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });
    router.replace("/domain-analysis");
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only once the paid session is verified AND the GA snapshot is ready
  // (context or sessionStorage-hydrated) do we spend tokens generating it.
  useEffect(() => {
    if (!verifiedSessionId || !domain || !report) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off report generation once payment is verified and the GA snapshot is ready
    setGenerating(true);
    fetch("/api/domain-analysis/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, stripeSessionId: verifiedSessionId, googleResponse: report }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setReportHtml(data.html);
          setReportUnlocked(true);
          setShowReportModal(true);
        } else {
          showError(data.error ?? "Couldn't generate the AI report. Please try again.");
        }
      })
      .catch(() => {
        if (!cancelled) showError("Couldn't generate the AI report. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setGenerating(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedSessionId, domain, report]);

  const snapshot = report?.snapshotHeaderValues ?? {};
  const domainLabel = useMemo(() => {
    if (!dataOption?.domain) return null;
    const href = dataOption.domain.includes("https")
      ? dataOption.domain
      : `https://${dataOption.domain}`;
    return { href, label: dataOption.domain.toUpperCase() };
  }, [dataOption]);

  if (!report || report.noAnalyticsAccountFound || report.noMatchFoundForDomain) return null;

  const kpis = [
    { label: "Users", value: snapshot.activeUsers ?? 0, icon: Users },
    { label: "New Users", value: snapshot.newUsers ?? 0, icon: UserPlus },
    { label: "Average Engagement Time", value: snapshot.averageEngagementTime ?? "0m 00s", icon: Clock },
    { label: "Total Revenue", value: snapshot.totalRevenue ?? "$0.00", icon: DollarSign },
  ];

  return (
    <Container>
      <Wrapper className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <BackToHome heading="Back to options" link="/options" />
        <Link
          href="/domain-analysis/reports"
          className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
        >
          <FileBarChart className="w-4 h-4" aria-hidden="true" />
          My Reports
        </Link>
      </Wrapper>

      <div className="flex w-full justify-end mb-2">
        <button
          type="button"
          disabled={!unlockChecked || verifying || generating}
          onClick={() => (reportUnlocked ? setShowReportModal(true) : setShowPaywall(true))}
          className="flex items-center gap-2 pt-[7px] pb-2 px-[21px] text-center text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 whitespace-nowrap bg-dark-100 text-white hover:bg-transparent hover:text-white disabled:opacity-50"
        >
          {verifying || generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {verifying
            ? "Confirming payment…"
            : generating
              ? "Generating your report…"
              : reportUnlocked
                ? "View AI Report"
                : "Unlock AI Growth Report — $7.99"}
        </button>
      </div>

      {dataOption?.name && (
        <h1 className="text-4xl max-md-tab:text-2xl font-semibold tracking-normal text-dark-100 mb-6">
          {dataOption.value
            ? `Start Date: ${dataOption.value.startDate} End Date: ${dataOption.value.endDate}`
            : dataOption.name}
          {domainLabel && (
            <Link target="_blank" href={domainLabel.href}>
              <span className="font-bold"> ({domainLabel.label})</span>
            </Link>
          )}
        </h1>
      )}

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="flex gap-4 mb-4 max-md-tab:grid"
      >
        {kpis.map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="bg-white rounded-2xl shadow-6xl flex-1 p-6 flex flex-col items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-lightblue-100 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-dark-100" aria-hidden="true" />
            </div>
            <span className="block text-center text-sm text-gray-400 font-semibold">{label}</span>
            <span className="block text-center text-3xl font-bold text-dark-100">{value}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="flex gap-4 justify-between max-md-tab:flex-col"
      >
        <NewUserChart values={report.newUserGroupingValues ?? {}} />
        <RankedList
          values={report.sessionGroupingValues ?? {}}
          heading="What are your top campaigns?"
          keyHead="Session primary channel group"
          valueHead="Sessions"
        />
      </motion.div>

      <h2 className="text-2xl font-semibold text-dark-100 my-2 mt-6">Data by Country</h2>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="flex gap-4 justify-between max-md-tab:flex-col"
      >
        <CountryChart values={report.countryWiseUsers ?? {}} />
        <RankedList
          values={report.countryWiseUsers ?? {}}
          heading="Users by Country"
          keyHead="Country"
          valueHead="Users"
        />
      </motion.div>

      <h2 className="text-2xl font-semibold text-dark-100 my-2 mt-6">Data by Pages</h2>
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
        <PageReportTable values={report.pageReportPerPageCountValues ?? []} />
        <Wrapper className="flex gap-4 justify-between mb-16 mt-4 max-md-tab:flex-col">
          <TopFivePages values={report.titleWiseVisitCountValues ?? []} />
          <MostPopular
            values={report.titleWiseVisitCountValues ?? []}
            keyHead="Page Title"
            valueHead="Users"
            heading="Most Visited Pages"
          />
        </Wrapper>
      </motion.div>

      {report.searchConsoleData?.query && report.searchConsoleData.query.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-dark-100 my-2 mt-6">Performance</h2>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
            <SearchConsoleTable values={report.searchConsoleData} />
          </motion.div>
        </>
      )}

      <HireExpert />

      <DomainAiReportPaywall
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        domain={domain}
        onAlreadyUnlocked={() => {
          setShowPaywall(false);
          void checkUnlocked();
        }}
      />
      <AiReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        html={reportHtml}
        domain={domain}
        pdfEndpoint="/api/domain-analysis/pdf"
        pdfBody={{ domain }}
      />
    </Container>
  );
}

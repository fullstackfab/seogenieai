/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Check, Loader2, CircleX, Download, Mail } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useToast } from "@/providers/toast-provider";
import { AuditCard, AuditCardLocked } from "./audit-card";
import { ScoreHeader } from "./score-header";
import { UnlockBanner } from "./unlock-banner";
import {
  DomainAuthorityCard,
  BacklinksCard,
  AiVisibilityCard,
  FixPlanSection,
} from "./paid-data-cards";

const FREE_CHECKS = [
  { key: "https", title: "HTTPS Status" },
  { key: "robotsTxt", title: "robots.txt" },
  { key: "sitemap", title: "Sitemap" },
  { key: "h1", title: "H1 Headings" },
  { key: "headings", title: "Heading Structure" },
  { key: "title", title: "HTML <title>" },
  { key: "metaDescription", title: "Meta Description" },
  { key: "imageAlt", title: "Image Alt Text" },
  { key: "favicon", title: "Favicon & Touch Icons" },
  { key: "mixedContent", title: "Mixed Content" },
  { key: "rssFeed", title: "RSS/Atom Feed" },
  { key: "viewport", title: "Mobile Viewport Meta" },
  { key: "openGraph", title: "Open Graph" },
  { key: "twitterCard", title: "Twitter Card" },
];

const PAID_CHECKS = [
  { key: "dnsHardening", title: "DNS Hardening" },
  { key: "jsonLd", title: "JSON-LD Structured Data" },
  { key: "htmlLang", title: "HTML lang Attribute" },
  { key: "ogLocale", title: "Open Graph Locale Signals" },
  { key: "sameAs", title: "Knowledge Graph Links" },
  { key: "canonical", title: "Canonical Domain Alignment" },
  { key: "hreflang", title: "Hreflang Coverage" },
  { key: "metaRobots", title: "Meta Robots" },
  { key: "aiRobots", title: "AI Robots Directives" },
  { key: "aiContentRestrictions", title: "AI Content Restrictions" },
  { key: "llmsTxt", title: "llms.txt (AI Guidance)" },
  { key: "securityTxt", title: "security.txt" },
  { key: "sslCertificate", title: "SSL Certificate Health" },
  { key: "httpHeaders", title: "Security & Perf Headers" },
  { key: "redirectConsistency", title: "Redirect Consistency" },
  { key: "soft404", title: "Soft-404 Handling" },
  { key: "sitemapHealth", title: "Sitemap Health" },
  { key: "linkHygiene", title: "Link Hygiene" },
];

const TEASERS = [
  { title: "Domain Authority", desc: "DA/PA scores, spam score, linking domains, inbound links" },
  {
    title: "Backlink Profile",
    desc: "Total backlinks, referring domains, dofollow ratio, gov & edu links",
  },
  {
    title: "AI Visibility",
    desc: "How ChatGPT and Gemini perceive your brand — awareness, sentiment, topics",
  },
];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200" />
          <div className="w-32 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-12 h-5 bg-gray-200 rounded-full" />
      </div>
      <div className="w-full h-3 bg-gray-100 rounded mb-2" />
      <div className="w-3/4 h-3 bg-gray-100 rounded" />
    </div>
  );
}

export function AiAuditReportView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const urlParam = searchParams.get("url");
  const token = searchParams.get("token");

  const [inputUrl, setInputUrl] = useState(urlParam ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const [paidData, setPaidData] = useState<any>(null);
  const [paidLoading, setPaidLoading] = useState(false);
  const [paidUnlocked, setPaidUnlocked] = useState(false);
  const [paidError, setPaidError] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [resending, setResending] = useState(false);

  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [pdfStatusError, setPdfStatusError] = useState<string | null>(null);
  const statusPollCount = useRef(0);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAudit = useCallback(async (targetUrl: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Audit failed. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- run the audit whenever the ?url= query param changes
    if (urlParam) void runAudit(urlParam);
  }, [urlParam, runAudit]);

  // Once the free audit resolves, unlock the paid checks + fetch DA/backlinks/AI visibility/fix plan.
  useEffect(() => {
    if (!token || !urlParam || !result?.audit) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the paid-data fetch triggered by the audit result changing
    setPaidLoading(true);
    setPaidError(null);
    fetch("/api/ai-audit/paid-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, url: urlParam }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setPaidData(data);
          setPaidUnlocked(true);
        } else {
          setPaidError(data.error ?? `Failed to unlock report (HTTP ${res.status})`);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setPaidError(err instanceof Error ? err.message : "Network error unlocking report");
      })
      .finally(() => {
        if (!cancelled) setPaidLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, urlParam, result]);

  // Poll PDF-generation / email-delivery status independently of the paid-data unlock above.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(`/api/ai-audit/status?token=${encodeURIComponent(token!)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.status) {
          setPdfStatus(data.status);
          setPdfStatusError(null);
        } else {
          setPdfStatusError(data.error ?? `Status check failed (HTTP ${res.status})`);
        }
        const terminal = data.status === "sent" || data.status === "failed";
        statusPollCount.current += 1;
        if (!terminal && statusPollCount.current < 60) {
          statusTimer.current = setTimeout(tick, 3000);
        }
      } catch (err) {
        if (cancelled) return;
        setPdfStatusError(err instanceof Error ? err.message : "Network error checking status");
        statusPollCount.current += 1;
        if (statusPollCount.current < 60) statusTimer.current = setTimeout(tick, 3000);
      }
    }
    void tick();

    return () => {
      cancelled = true;
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, [token]);

  function handleNewAnalysis() {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    router.push(`/ai-audit/report?url=${encodeURIComponent(trimmed)}`);
  }

  async function handleDownloadPdf() {
    if (!token || !urlParam) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/ai-audit/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, url: urlParam }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-readiness-report-${(result?.domain ?? "report").replace(/[^a-z0-9.-]/gi, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  async function handleResend() {
    if (!token || !urlParam) return;
    setResending(true);
    try {
      const res = await fetch("/api/ai-audit/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, url: urlParam }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to resend report");
      showSuccess(`Report resent to ${data.email}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to resend report");
    } finally {
      setResending(false);
    }
  }

  const audit = result?.audit ?? null;

  return (
    <Wrapper className="min-h-[calc(100vh-290px)]">
      <Container>
        <Wrapper className="pt-8 pb-4">
          <BackToHome heading="New Analysis" link="/ai-audit" />
        </Wrapper>

        <Wrapper className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNewAnalysis()}
            placeholder="Enter another URL…"
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-dark-100 placeholder:text-gray-400 bg-lightblue-100 outline-none focus:border-dark-100 transition-colors"
          />
          <button
            onClick={handleNewAnalysis}
            disabled={loading}
            className="bg-dark-100 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-dark-100/90 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Analyzing…" : "Analyze →"}
          </button>
        </Wrapper>

        {error && (
          <Wrapper className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 text-red-700 text-sm">
            {error}
          </Wrapper>
        )}

        {loading && (
          <Wrapper>
            <Wrapper className="bg-white rounded-2xl border border-gray-100 p-8 mb-8 animate-pulse">
              <Wrapper className="flex items-center justify-between gap-6">
                <Wrapper className="flex-1">
                  <Wrapper className="w-48 h-6 bg-gray-200 rounded mb-2" />
                  <Wrapper className="w-72 h-4 bg-gray-100 rounded" />
                </Wrapper>
                <Wrapper className="w-36 h-28 bg-gray-100 rounded-2xl" />
              </Wrapper>
              <Wrapper className="h-3 bg-gray-100 rounded-full mt-6" />
            </Wrapper>
            <p className="text-center text-dark-100 font-semibold mb-1">
              Analyzing <span className="opacity-60">{urlParam}</span>
            </p>
            <p className="text-center text-sm text-gray-400 mb-8">
              Running checks — about 5–10 seconds
            </p>
            <Wrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </Wrapper>
          </Wrapper>
        )}

        {!loading && result && (
          <Wrapper className="pb-16">
            <ScoreHeader
              url={result.url}
              domain={result.domain}
              score={result.score}
              isPaid={paidUnlocked}
            />

            {token && paidUnlocked && (
              <Wrapper className="flex gap-3 flex-wrap -mt-2 mb-6">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="flex items-center gap-2 bg-dark-100 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-dark-100/90 transition-colors disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {downloading ? "Preparing…" : "Download Report"}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-2 border-2 border-black/15 text-[#171717] text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-60"
                >
                  {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {resending ? "Sending…" : "Resend Report"}
                </button>
              </Wrapper>
            )}

            {token && pdfStatus && (
              <Wrapper className="flex items-center gap-2 -mt-4 mb-6 text-sm">
                {pdfStatus === "sent" ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">PDF sent to your inbox or junk folder</span>
                  </>
                ) : pdfStatus === "failed" ? (
                  <>
                    <CircleX className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">
                      Email delivery failed — your report is still available here
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 text-dark-100 animate-spin" />
                    <span className="text-gray-500">
                      {pdfStatus === "sending_email" ? "Emailing your PDF…" : "Preparing your PDF…"}
                    </span>
                  </>
                )}
              </Wrapper>
            )}

            {token && pdfStatusError && (
              <Wrapper className="flex items-center gap-2 -mt-4 mb-6 text-sm text-red-600">
                <CircleX className="w-4 h-4" />
                <span>Couldn&apos;t check PDF status: {pdfStatusError}</span>
              </Wrapper>
            )}

            {token && paidError && (
              <Wrapper className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
                Couldn&apos;t unlock your full report: {paidError}
              </Wrapper>
            )}

            <Wrapper className="mb-2">
              <Wrapper className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                <h2 className="text-base font-bold text-dark-100">Free Report</h2>
                <span className="text-xs text-gray-400">({FREE_CHECKS.length} checks)</span>
              </Wrapper>
              <Wrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FREE_CHECKS.map(({ key, title }) => {
                  const item = audit[key];
                  if (!item) return null;
                  return (
                    <AuditCard
                      key={key}
                      title={title}
                      status={item.status}
                      value={item.value}
                      recommendation={item.recommendation}
                    />
                  );
                })}
              </Wrapper>
            </Wrapper>

            <Wrapper className="flex items-center gap-3 my-8">
              <Wrapper className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide px-2">
                Full Report — PDF Delivered by Email
              </span>
              <Wrapper className="flex-1 h-px bg-gray-100" />
            </Wrapper>

            {!paidUnlocked && <UnlockBanner url={result.url} />}

            <Wrapper>
              <Wrapper className="flex items-center gap-2 mb-4">
                <span
                  className={`w-3 h-3 rounded-full inline-block ${paidUnlocked ? "bg-green-500" : "bg-dark-100"}`}
                />
                <h2 className="text-base font-bold text-dark-100">Full Report</h2>
                <span className="text-xs text-gray-400">
                  ({PAID_CHECKS.length} additional checks + DA, backlinks, AI visibility)
                </span>
              </Wrapper>
              <Wrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PAID_CHECKS.map(({ key, title }) => {
                  if (!paidUnlocked) return <AuditCardLocked key={key} title={title} />;
                  const item = audit[key];
                  if (!item) return null;
                  return (
                    <AuditCard
                      key={key}
                      title={title}
                      status={item.status}
                      value={item.value}
                      recommendation={item.recommendation}
                    />
                  );
                })}
              </Wrapper>
            </Wrapper>

            {paidUnlocked ? (
              <Wrapper className="mt-8 space-y-4">
                <Wrapper className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DomainAuthorityCard data={paidData?.domainAuthority} />
                  <BacklinksCard data={paidData?.backlinks} />
                </Wrapper>
                <AiVisibilityCard data={paidData?.aiVisibility} />
                {paidData?.fixPlan?.length > 0 && (
                  <Wrapper className="mt-4">
                    <h2 className="text-base font-bold text-dark-100 mb-4">Prioritized Fix Plan</h2>
                    <FixPlanSection items={paidData.fixPlan} />
                  </Wrapper>
                )}
              </Wrapper>
            ) : (
              <Wrapper className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEASERS.map((s) => (
                  <Wrapper
                    key={s.title}
                    className="bg-white rounded-xl border border-gray-100 p-5 opacity-60 relative overflow-hidden"
                  >
                    <Wrapper className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-dark-100 bg-white/90 px-3 py-1 rounded-full border border-gray-200">
                        Included in PDF
                      </span>
                    </Wrapper>
                    <Wrapper className="blur-sm pointer-events-none">
                      <p className="font-bold text-dark-100 mt-2 mb-1">{s.title}</p>
                      <p className="text-sm text-gray-400">{s.desc}</p>
                    </Wrapper>
                  </Wrapper>
                ))}
              </Wrapper>
            )}

            {token && paidLoading && !paidUnlocked && (
              <p className="text-center text-sm text-gray-400 mt-6">Unlocking your full report…</p>
            )}
          </Wrapper>
        )}

        {!loading && !result && !error && (
          <Wrapper className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-12 h-12 mb-4 text-dark-100/40" />
            <h2 className="text-xl font-bold text-dark-100 mb-2">Enter a URL to get started</h2>
            <p className="text-gray-400 text-sm">Type a website URL above and click Analyze.</p>
          </Wrapper>
        )}
      </Container>
    </Wrapper>
  );
}

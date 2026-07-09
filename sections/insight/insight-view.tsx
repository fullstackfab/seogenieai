"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Laptop, Smartphone, Sparkles, Gauge } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { Processing } from "@/components/ui/processing";
import { HireExpert } from "@/components/hire-expert";
import { AiReportModal } from "@/components/ai-report-modal";
import { AiReportPaywall } from "./ai-report-paywall";
import { useAnalysis } from "@/providers/analysis-provider";
import { useToast } from "@/providers/toast-provider";
import { PageSpeedReport } from "./pagespeed-report";
import type { PageInsights } from "./types";

type Strategy = "desktop" | "mobile";

type CachedScan = {
  reports: Partial<Record<Strategy, PageInsights>>;
  analyticalPayload: unknown;
  stripeSessionId?: string;
};

const cacheKey = (domain: string) => `insight-scan:${domain}`;

export function InsightView() {
  const { domain } = useAnalysis();
  const { showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Strategy>("desktop");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Partial<Record<Strategy, PageInsights>>>({});
  const [analyticalPayload, setAnalyticalPayload] = useState<unknown>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const [reportHtml, setReportHtml] = useState("");
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [reportChecked, setReportChecked] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const analyse = useCallback(
    async (strategy: Strategy) => {
      setSelected(strategy);
      if (reports[strategy]) return;
      setLoading(true);
      try {
        const url = domain.includes("https") ? domain : `https://${domain}`;
        const res = await fetch("/api/pagespeed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, type: strategy }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? "PageSpeed request failed");
        setReports((prev) => {
          const next = { ...prev, [strategy]: data.pageInsights };
          const cached: CachedScan = {
            reports: next,
            analyticalPayload: data.report,
            stripeSessionId: sessionId ?? undefined,
          };
          sessionStorage.setItem(cacheKey(domain), JSON.stringify(cached));
          return next;
        });
        setAnalyticalPayload(data.report);
      } catch (err) {
        showError(err instanceof Error ? err.message : "Something went wrong! Try again later.");
      } finally {
        setLoading(false);
      }
    },
    [domain, reports, sessionId, showError]
  );

  function handleViewAiReport() {
    if (reportUnlocked) {
      setShowReportModal(true);
      return;
    }
    if (sessionId) return; // generation already in flight (see effect below)
    setPaywallOpen(true);
  }

  useEffect(() => {
    if (!domain) return;
    // Restores the scan already run before a Stripe redirect (or an earlier
    // visit this tab) so returning to /insight never re-hits /api/pagespeed.
    const cached = sessionStorage.getItem(cacheKey(domain));
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CachedScan;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from this tab's cached scan
        setReports(parsed.reports);
        setAnalyticalPayload(parsed.analyticalPayload);
        if (parsed.stripeSessionId) setSessionId(parsed.stripeSessionId);
        return;
      } catch {
        // fall through to a fresh scan
      }
    }
    void analyse("desktop");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the domain itself changes, not when `analyse` is recreated
  }, [domain]);

  // Returning from Stripe Checkout — confirm payment, then let the cache-check/generate effects below take over.
  useEffect(() => {
    const paidSessionId = searchParams.get("session_id");
    if (!paidSessionId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off verification of the returning Stripe session
    setVerifying(true);
    fetch(`/api/stripe/insight-verify?session_id=${encodeURIComponent(paidSessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setSessionId(paidSessionId);
          if (data.email) setCustomerEmail(data.email);
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
    router.replace("/insight");
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the session_id present on load
  }, []);

  // As soon as we know which paid session this is, check for an already-generated
  // report before ever considering a (token-costly) generation call.
  useEffect(() => {
    if (!sessionId || reportChecked) return;
    let cancelled = false;
    fetch(`/api/insight/report?stripeSessionId=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.unlocked && data.html) {
          setReportHtml(data.html);
          setReportUnlocked(true);
        }
      })
      .catch(() => {
        // Non-fatal — the generate effect below will still run if this fails.
      })
      .finally(() => {
        if (!cancelled) setReportChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, reportChecked]);

  // Only generate (and only once) if the cache check above came back empty.
  useEffect(() => {
    if (!sessionId || !analyticalPayload || !reportChecked || reportUnlocked || generating) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off report generation once the cache check confirms nothing exists yet
    setGenerating(true);
    fetch("/api/insight/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, stripeSessionId: sessionId, analyticalPayload }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (cancelled) return;
        if (!data.success) {
          showError(data.error ?? "Couldn't generate the AI report. Please try again.");
          return;
        }
        setReportHtml(data.html);
        setReportUnlocked(true);
        if (!customerEmail) return;
        setEmailStatus("sending");
        try {
          const emailRes = await fetch("/api/insight/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: data.html, domain, email: customerEmail, stripeSessionId: sessionId }),
          });
          if (!cancelled) setEmailStatus(emailRes.ok ? "sent" : "failed");
        } catch {
          if (!cancelled) setEmailStatus("failed");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once analytical payload + a confirmed, unchecked session are both ready
  }, [sessionId, analyticalPayload, reportChecked, reportUnlocked]);

  if (!domain) {
    return (
      <Container>
        <p className="text-center py-20">
          No domain selected. Go back to the homepage to start an insight scan.
        </p>
      </Container>
    );
  }

  const speedReport = reports[selected];

  return (
    <Wrapper className="min-h-[calc(100vh-290px)] ">
      <Container className="py-8">
        <AnimatePresence mode="wait">
          {(loading || verifying) && !speedReport && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="min-h-[calc(100vh-290px)] flex items-center justify-center"
            >
              <Processing
                heading={verifying ? "Confirming your payment…" : "Analysing your website..."}
              />
            </motion.div>
          )}
          {speedReport && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Wrapper className="flex justify-between items-center mb-6">
                <BackToHome />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  disabled={generating}
                  onClick={handleViewAiReport}
                  className="flex items-center gap-2 pt-[7px] pb-2 px-[21px] text-center text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 whitespace-nowrap bg-dark-100 text-white hover:bg-transparent hover:text-white disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {generating
                    ? "Generating report…"
                    : reportUnlocked
                      ? "View AI Report"
                      : sessionId
                        ? "Unlocking…"
                        : "Unlock AI Report"}
                </motion.button>
              </Wrapper>

              <Wrapper className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
                <Wrapper className="flex items-center gap-3">
                  <Wrapper className="w-11 h-11 rounded-xl bg-lightblue-100 flex items-center justify-center shrink-0">
                    <Gauge className="w-6 h-6 text-dark-100" />
                  </Wrapper>
                  <Wrapper>
                    <h1 className="text-lg font-bold text-dark-100 leading-tight">
                      Website Speed Insight
                    </h1>
                    <p className="text-sm text-gray-400">{domain}</p>
                  </Wrapper>
                </Wrapper>

                <Wrapper className="flex bg-lightblue-100 rounded-xl p-1">
                  {(["desktop", "mobile"] as const).map((name) => (
                    <button
                      key={name}
                      onClick={() => analyse(name)}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold ${
                        selected === name
                          ? "text-white bg-dark-100"
                          : "text-dark-100 hover:bg-white/60"
                      }`}
                    >
                      {selected === name && (
                        <motion.span
                          layoutId="device-tab-pill"
                          className="absolute inset-0 bg-dark-100 rounded-lg shadow-sm -z-10"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      {name === "desktop" ? (
                        <Laptop className="w-4 h-4" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                      <span className="capitalize">{name}</span>
                    </button>
                  ))}
                </Wrapper>
              </Wrapper>

              <div className="mb-8">
                <PageSpeedReport data={speedReport} />
              </div>
              <HireExpert />
            </motion.div>
          )}
        </AnimatePresence>
        <AiReportPaywall open={paywallOpen} onClose={() => setPaywallOpen(false)} domain={domain} />
        <AiReportModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          html={reportHtml}
          domain={domain}
          stripeSessionId={sessionId}
          emailStatus={emailStatus}
          customerEmail={customerEmail}
        />
      </Container>
    </Wrapper>
  );
}

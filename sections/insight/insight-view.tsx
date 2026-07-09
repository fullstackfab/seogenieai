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
import { useChatStream } from "@/lib/use-chat-stream";
import { PageSpeedReport } from "./pagespeed-report";
import type { PageInsights } from "./types";

type Strategy = "desktop" | "mobile";

type CachedScan = {
  reports: Partial<Record<Strategy, PageInsights>>;
  analyticalPayload: unknown;
};

const cacheKey = (domain: string) => `insight-scan:${domain}`;

export function InsightView() {
  const { domain } = useAnalysis();
  const { showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { answer, loading: reportLoading, run, setAnswer } = useChatStream();
  const [selected, setSelected] = useState<Strategy>("desktop");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Partial<Record<Strategy, PageInsights>>>({});
  const [analyticalPayload, setAnalyticalPayload] = useState<unknown>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

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
          sessionStorage.setItem(
            cacheKey(domain),
            JSON.stringify({ reports: next, analyticalPayload: data.report } satisfies CachedScan)
          );
          return next;
        });
        setAnalyticalPayload(data.report);
      } catch (err) {
        showError(err instanceof Error ? err.message : "Something went wrong! Try again later.");
      } finally {
        setLoading(false);
      }
    },
    [domain, reports, showError]
  );

  const generateAiReport = useCallback(
    async (paidSessionId: string) => {
      const result = await run(JSON.stringify(analyticalPayload), {
        pageSpeedInsights: true,
        stripeSessionId: paidSessionId,
      });
      if (!result.success) {
        showError("Couldn't generate the AI report. Please try again.");
        return;
      }
      if (!customerEmail) return;
      setEmailStatus("sending");
      try {
        const res = await fetch("/api/insight/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: result.answer,
            domain,
            email: customerEmail,
            stripeSessionId: paidSessionId,
          }),
        });
        setEmailStatus(res.ok ? "sent" : "failed");
      } catch {
        setEmailStatus("failed");
      }
    },
    [analyticalPayload, customerEmail, domain, run, showError]
  );

  function handleViewAiReport() {
    if (sessionId) {
      void generateAiReport(sessionId);
      return;
    }
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
        return;
      } catch {
        // fall through to a fresh scan
      }
    }
    void analyse("desktop");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the domain itself changes, not when `analyse` is recreated
  }, [domain]);

  // Returning from Stripe Checkout — confirm payment, then auto-run the report once data is ready.
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

  useEffect(() => {
    if (sessionId && analyticalPayload) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- triggers the streamed report + email send once payment + scan data are both ready
      void generateAiReport(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once analytical payload + a confirmed session are both available
  }, [sessionId, analyticalPayload]);

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
                  disabled={reportLoading}
                  onClick={handleViewAiReport}
                  className="flex items-center gap-2 pt-[7px] pb-2 px-[21px] text-center text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 whitespace-nowrap bg-dark-100 text-white hover:bg-transparent hover:text-white disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {reportLoading
                    ? "Loading report…"
                    : sessionId
                      ? "View AI Report"
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
          open={!!answer}
          onClose={() => setAnswer("")}
          html={answer}
          domain={domain}
          stripeSessionId={sessionId}
          emailStatus={emailStatus}
          customerEmail={customerEmail}
        />
      </Container>
    </Wrapper>
  );
}

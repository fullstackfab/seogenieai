"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, Check, Loader2, CircleX, FileText, TriangleAlert } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";

type PollStatus = "processing" | "generating_pdf" | "sending_email" | "sent" | "failed";

type PollResult = {
  success?: boolean;
  pending?: boolean;
  error?: string;
  accessToken?: string;
  auditUrl?: string;
  customerEmail?: string | null;
  status?: PollStatus;
};

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 40;
// After this many polls with no PaidAudit record yet, surface a visible warning
// instead of spinning silently — most likely cause locally is the Stripe
// webhook never reaching this machine (needs `stripe listen` forwarding).
const STILL_PENDING_WARNING_AFTER = 6;

const STEPS: { key: "payment" | "report" | "email" | "done"; label: string }[] = [
  { key: "payment", label: "Payment confirmed" },
  { key: "report", label: "Preparing your report" },
  { key: "email", label: "Emailing your PDF" },
  { key: "done", label: "Delivered" },
];

type StepState = "done" | "active" | "failed" | "pending";

// Order steps reach "done" as the pipeline advances through each status.
const REPORT_DONE_AT: PollStatus[] = ["sending_email", "sent", "failed"];
const EMAIL_DONE_AT: PollStatus[] = ["sent"];

function stepState(step: (typeof STEPS)[number]["key"], status: PollStatus | undefined): StepState {
  if (step === "payment") return "done";

  const active = status ?? "processing";

  if (step === "report") {
    if (REPORT_DONE_AT.includes(active)) return "done";
    return "active";
  }
  if (step === "email") {
    if (active === "failed") return "failed";
    if (EMAIL_DONE_AT.includes(active)) return "done";
    return active === "sending_email" ? "active" : "pending";
  }
  // step === "done"
  if (active === "sent") return "done";
  if (active === "failed") return "failed";
  return "pending";
}

export function AiAuditSuccessView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const emailParam = searchParams.get("email") ?? "";

  const [poll, setPoll] = useState<PollResult | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const pollCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId!)}`);
        const data: PollResult = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setFetchError(data.error ?? `Status check failed (HTTP ${res.status})`);
        } else {
          setFetchError(null);
          setPoll(data);
        }

        pollCountRef.current += 1;
        setPollCount(pollCountRef.current);

        const terminal = data.status === "sent" || data.status === "failed";
        if (!terminal && pollCountRef.current < MAX_POLLS) {
          timerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        } else if (!terminal) {
          setTimedOut(true);
        }
      } catch (err) {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "Network error while checking status");
        pollCountRef.current += 1;
        setPollCount(pollCountRef.current);
        if (pollCountRef.current < MAX_POLLS) {
          timerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        } else {
          setTimedOut(true);
        }
      }
    }

    void tick();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId]);

  const email = poll?.customerEmail ?? emailParam;
  const status = poll?.status;
  const reportUrl =
    poll?.accessToken && poll?.auditUrl
      ? `/ai-audit/report?url=${encodeURIComponent(poll.auditUrl)}&token=${encodeURIComponent(poll.accessToken)}`
      : null;

  // No PaidAudit record yet after several polls — webhook likely hasn't landed.
  const webhookPending = !fetchError && poll?.pending && pollCount >= STILL_PENDING_WARNING_AFTER;

  return (
    <Wrapper className="min-h-[calc(100vh-290px)] flex items-center justify-center bg-lightblue-100">
      <Container>
        <Wrapper className="max-w-[520px] mx-auto text-center">
          <Wrapper className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
            <Wrapper className="flex justify-center mb-6">
              <Wrapper className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CircleCheck className="w-10 h-10 text-green-600" />
              </Wrapper>
            </Wrapper>

            <h1 className="text-2xl font-bold text-dark-100 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              {!sessionId
                ? "We can't check your report status without a session ID — please use the link from your checkout confirmation."
                : status === "sent"
                  ? "Your full AI Readiness Report has been emailed to you."
                  : status === "failed"
                    ? "We hit a snag emailing your PDF — but your full report is ready to view below."
                    : "We're generating your full AI Readiness Report right now."}
            </p>

            {email ? (
              <Wrapper className="bg-lightblue-100 rounded-xl px-4 py-3 mb-6 text-sm text-dark-100">
                {status === "sent" ? "Sent to" : "Sending to"} <strong>{email}</strong>
              </Wrapper>
            ) : (
              <Wrapper className="bg-lightblue-100 rounded-xl px-4 py-3 mb-6 text-sm text-gray-500">
                Check the email address you provided at checkout.
              </Wrapper>
            )}

            {reportUrl && (
              <a
                href={reportUrl}
                className="inline-flex items-center justify-center gap-2 w-full bg-dark-100 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-dark-100/90 transition-all duration-200 shadow-md mb-6"
              >
                <FileText className="w-4 h-4" />
                View Your Full Report →
              </a>
            )}

            {fetchError && (
              <Wrapper className="flex items-start gap-2 text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <TriangleAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  Couldn&apos;t check payment status: <strong>{fetchError}</strong>. Retrying…
                </p>
              </Wrapper>
            )}

            {webhookPending && !timedOut && (
              <Wrapper className="flex items-start gap-2 text-left bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <TriangleAlert className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Still waiting for payment confirmation from Stripe ({pollCount} checks so far). If
                  you&apos;re testing locally, make sure <code className="font-mono text-xs bg-yellow-100 px-1 rounded">stripe listen --forward-to
                  localhost:3000/api/stripe/webhook</code> is running and that{" "}
                  <code className="font-mono text-xs bg-yellow-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> matches
                  its output.
                </p>
              </Wrapper>
            )}

            {timedOut && (
              <Wrapper className="flex items-start gap-2 text-left bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <CircleX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  {poll?.pending
                    ? "We never received payment confirmation from Stripe. Your card was charged, but the report couldn't start generating — please contact support with your session ID."
                    : "Report generation is taking longer than expected. It may still complete — check your email shortly, or contact support."}
                </p>
              </Wrapper>
            )}

            <Wrapper className="text-left bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
              <p className="text-xs font-bold text-dark-100 uppercase tracking-wide mb-1">Status</p>
              {STEPS.map((step) => {
                const state = stepState(step.key, status);
                return (
                  <Wrapper key={step.key} className="flex items-center gap-2 text-sm">
                    {state === "done" && <Check className="w-4 h-4 text-green-500 shrink-0" />}
                    {state === "active" && <Loader2 className="w-4 h-4 text-dark-100 animate-spin shrink-0" />}
                    {state === "failed" && <CircleX className="w-4 h-4 text-red-500 shrink-0" />}
                    {state === "pending" && <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0 inline-block" />}
                    <span
                      className={
                        state === "pending"
                          ? "text-gray-400"
                          : state === "failed"
                            ? "text-red-600"
                            : "text-gray-700"
                      }
                    >
                      {step.label}
                    </span>
                  </Wrapper>
                );
              })}
            </Wrapper>

            <p className="text-xs text-gray-400">
              {sessionId ? (
                <>
                  Session: <span className="font-mono">{sessionId}</span>
                </>
              ) : (
                "Missing session ID — this page must be reached via the Stripe checkout redirect."
              )}
              {" · "}Didn&apos;t get the email? Check your spam folder or contact support.
            </p>
          </Wrapper>
        </Wrapper>
      </Container>
    </Wrapper>
  );
}

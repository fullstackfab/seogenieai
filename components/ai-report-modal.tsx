"use client";

import { useState } from "react";
import { Sparkles, Download, Loader2, CircleCheck, CircleX } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { sanitizeHtml } from "@/lib/sanitize-html";

type EmailStatus = "idle" | "sending" | "sent" | "failed";

/** Renders a streamed AI report as sanitized HTML inside a modal, with a PDF download option. */
export function AiReportModal({
  open,
  onClose,
  html,
  domain,
  stripeSessionId,
  emailStatus = "idle",
  customerEmail,
  pdfEndpoint = "/api/insight/pdf",
  pdfBody,
}: {
  open: boolean;
  onClose: () => void;
  html: string;
  domain?: string;
  stripeSessionId?: string | null;
  emailStatus?: EmailStatus;
  customerEmail?: string | null;
  /** Which route renders the PDF — defaults to the insight report's route. */
  pdfEndpoint?: string;
  /** Overrides the request body sent to pdfEndpoint (defaults to the insight report's shape). */
  pdfBody?: Record<string, unknown>;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const canDownload = pdfBody ? true : !!stripeSessionId;

  async function handleDownload() {
    if (!canDownload) return;
    setError("");
    setDownloading(true);
    try {
      const res = await fetch(pdfEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfBody ?? { html, domain: domain ?? "", stripeSessionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pagespeed-ai-report-${(domain ?? "report").replace(/[^a-z0-9.-]/gi, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} contentLabel="AI report" className="max-w-4xl p-0!">
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-lightblue-100/50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-dark-100 leading-tight">AI Fix Report</h2>
            {domain && <p className="text-xs text-gray-400">{domain}</p>}
          </div>
        </div>
        {canDownload && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-dark-100 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-dark-100/90 transition-colors disabled:opacity-60 mr-8"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        )}
      </div>
      {error && <p className="px-6 pt-3 text-xs text-red-600">{error}</p>}
      {customerEmail && emailStatus !== "idle" && (
        <div className="flex items-center gap-2 px-6 pt-3 text-xs text-gray-500">
          {emailStatus === "sending" && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Emailing a copy to {customerEmail}…
            </>
          )}
          {emailStatus === "sent" && (
            <>
              <CircleCheck className="w-3.5 h-3.5 text-green-500" />
              We&apos;ve emailed a PDF copy to {customerEmail}
            </>
          )}
          {emailStatus === "failed" && (
            <>
              <CircleX className="w-3.5 h-3.5 text-red-500" />
              Couldn&apos;t email your copy — use Download PDF instead
            </>
          )}
        </div>
      )}
      <div
        className="ai-report-content max-h-[70vh] overflow-auto px-6 py-5"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      />
    </Modal>
  );
}

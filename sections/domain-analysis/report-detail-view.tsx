"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Trash2, LineChart, Loader2 } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useToast } from "@/providers/toast-provider";
import { sanitizeHtml } from "@/lib/sanitize-html";
import "@/components/ai-report-content.css";

export function ReportDetailView({
  id,
  domain,
  html,
  createdAt,
}: {
  id: string;
  domain: string;
  html: string;
  createdAt: string;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      const res = await fetch("/api/domain-analysis/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-growth-report-${domain.replace(/[^a-z0-9.-]/gi, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showError("Couldn't generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function deleteReport() {
    if (!window.confirm("Delete this saved report? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/domain-analysis/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showSuccess("Deleted.");
      router.push("/domain-analysis/reports");
    } catch {
      showError("Couldn't delete this report. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <Container>
      <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
        <BackToHome heading="My Reports" link="/domain-analysis/reports" />
        <Link
          href="/domain-analysis"
          className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
        >
          <LineChart className="w-4 h-4" aria-hidden="true" />
          Analyse another domain
        </Link>
      </Wrapper>

      <Wrapper className="flex items-center gap-2 flex-wrap mb-4 text-sm text-[#64748b]">
        <span className="px-2.5 py-1 rounded-full bg-dark-100/10 text-dark-100 font-medium">
          AI Growth Report
        </span>
        <span>·</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </Wrapper>
      <h1 className="text-[#171717] text-2xl font-bold mb-6 max-w-160">{domain}</h1>

      <Wrapper className="bg-white p-8 mb-6 overflow-auto rounded-2xl shadow-6xl max-md-mobile:p-5">
        <div className="ai-report-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
      </Wrapper>

      <Wrapper className="flex gap-3 flex-wrap mb-16">
        <button
          onClick={download}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-dark-100 text-white font-medium hover:bg-dark-100/90 transition-colors duration-200 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Preparing…" : "Download PDF"}
        </button>
        <button
          onClick={deleteReport}
          disabled={deleting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </Wrapper>
    </Container>
  );
}

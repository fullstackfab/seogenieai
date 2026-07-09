"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Code2, Trash2, PenLine } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { BackToHome } from "@/components/ui/buttons";
import { useToast } from "@/providers/toast-provider";
import { sanitizeHtml } from "@/lib/sanitize-html";

export function SavedContentView({
  id,
  html,
  contentType,
  topic,
  tone,
  createdAt,
}: {
  id: string;
  html: string;
  contentType: string;
  topic: string;
  tone: string;
  createdAt: string;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [copied, setCopied] = useState<"text" | "html" | null>(null);
  const [deleting, setDeleting] = useState(false);

  function copy(mode: "text" | "html") {
    const el = document.getElementById("saved-content-output");
    if (!el) return;
    const value = mode === "html" ? el.innerHTML : el.innerText;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(mode);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => showError("Couldn't copy to clipboard."));
  }

  async function deleteContent() {
    if (!window.confirm("Delete this saved content? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/content-writer/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showSuccess("Deleted.");
      router.push("/content-writer/history");
    } catch {
      showError("Couldn't delete this content. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <Container>
      <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
        <BackToHome heading="My saved content" link="/content-writer/history" />
        <Link
          href="/content-writer"
          className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
        >
          <PenLine className="w-4 h-4" aria-hidden="true" />
          Write new content
        </Link>
      </Wrapper>

      <Wrapper className="flex items-center gap-2 flex-wrap mb-4 text-sm text-[#64748b]">
        <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 font-medium">
          {contentType}
        </span>
        <span>·</span>
        <span>{tone} tone</span>
        <span>·</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </Wrapper>
      <h1 className="text-[#171717] text-2xl font-bold mb-6 max-w-160">{topic}</h1>

      <Wrapper className="bg-white p-8 mb-6 overflow-auto rounded-2xl shadow-6xl max-md-mobile:p-5">
        <div id="saved-content-output" className="ai-report-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
      </Wrapper>

      <Wrapper className="flex gap-3 flex-wrap mb-16">
        <button
          onClick={() => copy("text")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 border-black/15 text-[#171717] font-medium hover:bg-black/5 transition-colors duration-200"
        >
          <Copy className="w-4 h-4" aria-hidden="true" />
          {copied === "text" ? "Copied!" : "Copy text"}
        </button>
        <button
          onClick={() => copy("html")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 border-black/15 text-[#171717] font-medium hover:bg-black/5 transition-colors duration-200"
        >
          <Code2 className="w-4 h-4" aria-hidden="true" />
          {copied === "html" ? "Copied!" : "Copy HTML"}
        </button>
        <button
          onClick={deleteContent}
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

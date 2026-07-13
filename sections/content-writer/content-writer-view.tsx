"use client";

import { useState } from "react";
import Link from "next/link";
import { PenLine, ArrowRight, Copy, Code2, RotateCcw, Bookmark, FolderOpen } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { Text } from "@/components/ui/typography";
import { BackToHome, BackToHomeClick } from "@/components/ui/buttons";
import { Processing } from "@/components/ui/processing";
import { TagInput } from "@/components/forms/tag-input";
import { useChatStream } from "@/lib/use-chat-stream";
import { useContentSave } from "@/lib/use-content-save";
import { useToast } from "@/providers/toast-provider";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { useRouter } from "next/navigation";
import "@/components/ai-report-content.css";

const CONTENT_TYPES = [
  "Blog Post",
  "Product Description",
  "Social Media Post",
  "Ad Copy",
  "Meta Description",
  "Email Newsletter",
];
const TONES = ["Professional", "Casual", "Persuasive", "Informative", "Friendly", "Witty"];
const LENGTHS = [
  { value: "short", label: "Short (~150 words)" },
  { value: "medium", label: "Medium (~400 words)" },
  { value: "long", label: "Long (~800 words)" },
] as const;

const SELECT_CLASS =
  "max-md-mobile:p-6 p-4 focus:border-dark-100 focus:ring-4 focus:ring-dark-100/10 border-2 border-black/15 w-full bg-white transition-colors duration-200 rounded-[10px] text-base font-normal text-[#171717] leading-[15.96px] tracking-[0.02em]";

export function ContentWriterView() {
  const { showError } = useToast();
  const { answer, loading, run, setAnswer } = useChatStream();
  const { save, saving } = useContentSave(showError);
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState<(typeof LENGTHS)[number]["value"]>("medium");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [copied, setCopied] = useState<"text" | "html" | null>(null);

  async function generate() {
    if (!topic.trim()) {
      showError("Please tell us what to write about.");
      return;
    }
    const result = await run(topic.trim(), {
      contentWriter: true,
      contentType,
      tone,
      length,
      keywords,
    });
    if (!result.success) {
      showError(result.error ?? "Couldn't generate content. Please try again.");
    }
  }

  function copy(mode: "text" | "html") {
    const el = document.getElementById("content-writer-output");
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

  function handleSave() {
    save({ contentType, topic: topic.trim(), tone, length, keywords, html: answer });
  }

  function startNewContent() {
    setAnswer("");
    setTopic("");
    setKeywords([]);
    setCopied(null);
  }

  if (loading && !answer) {
    return (
      <Container>
        <Wrapper className="min-h-[calc(100vh-290px)] flex items-center justify-center">
          <Processing heading="Writing your content…" />
        </Wrapper>
      </Container>
    );
  }

  if (answer) {
    return (
      <Container>
        <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
          <BackToHomeClick heading="New content" onclick={startNewContent} />
          <Link
            href="/content-writer/history"
            className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
          >
            <FolderOpen className="w-4 h-4" aria-hidden="true" />
            My saved content
          </Link>
        </Wrapper>
        <Wrapper className="bg-white p-8 mb-6 overflow-auto rounded-2xl shadow-6xl max-md-mobile:p-5">
          <div
            id="content-writer-output"
            className="ai-report-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(answer) }}
          />
        </Wrapper>
        <Wrapper className="flex gap-3 flex-wrap mb-16">
          <button
            onClick={handleSave}
            disabled={saving}
            aria-label="Save content"
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-violet-500 text-white font-medium hover:bg-violet-500/90 transition-colors duration-200 disabled:opacity-50"
          >
            <Bookmark className="w-4 h-4" aria-hidden="true" />
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => copy("text")}
            aria-label="Copy content text"
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 border-black/15 text-[#171717] font-medium hover:bg-black/5 transition-colors duration-200"
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
            {copied === "text" ? "Copied!" : "Copy text"}
          </button>
          <button
            onClick={() => copy("html")}
            aria-label="Copy content HTML"
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] border-2 border-black/15 text-[#171717] font-medium hover:bg-black/5 transition-colors duration-200"
          >
            <Code2 className="w-4 h-4" aria-hidden="true" />
            {copied === "html" ? "Copied!" : "Copy HTML"}
          </button>
          <button
            onClick={generate}
            disabled={loading}
            aria-label="Regenerate content"
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-dark-100 text-white font-medium hover:bg-dark-100/90 transition-colors duration-200 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            {loading ? "Regenerating…" : "Regenerate"}
          </button>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-[800px] mx-auto mt-16 mb-16">
        <div className="flex justify-center">
          <BackToHome />
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500 text-white">
            <PenLine className="w-5 h-5" aria-hidden="true" />
          </span>
          <h1 className="text-[#171717] mt-5 text-[32px] font-bold leading-[1.15] tracking-[-0.01em] max-md-mobile:text-2xl">
            AI Content Writer
          </h1>
          <p className="mt-3 text-[15px] text-[#475569] max-w-130">
            Generate SEO-ready blog posts, product descriptions, ad copy and more — tuned to your
            topic, tone, and target keywords.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
          className="mt-10 rounded-2xl border border-black/5 bg-white p-6 shadow-6xl max-md-mobile:p-4"
        >
          <div className="grid grid-cols-2 gap-4 max-md-mobile:grid-cols-1">
            <div>
              <label
                htmlFor="content-type"
                className="mb-2 block text-[14px] font-medium text-[#171717]"
              >
                Content type
              </label>
              <select
                id="content-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className={SELECT_CLASS}
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="content-tone"
                className="mb-2 block text-[14px] font-medium text-[#171717]"
              >
                Tone
              </label>
              <select
                id="content-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={SELECT_CLASS}
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label
            htmlFor="content-topic"
            className="mb-2 mt-4 block text-[14px] font-medium text-[#171717]"
          >
            What should we write about?
          </label>
          <input
            id="content-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Benefits of organic skincare for sensitive skin"
            className={SELECT_CLASS}
          />

          {contentType !== "Meta Description" && (
            <div className="mt-4">
              <label
                htmlFor="content-length"
                className="mb-2 block text-[14px] font-medium text-[#171717]"
              >
                Length
              </label>
              <select
                id="content-length"
                value={length}
                onChange={(e) => setLength(e.target.value as typeof length)}
                className={SELECT_CLASS}
              >
                {LENGTHS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label
            htmlFor="content-keywords"
            className="mb-2 mt-4 block text-[14px] font-medium text-[#171717]"
          >
            SEO keywords <span className="text-[#94a3b8] font-normal">(optional)</span>
          </label>
          <TagInput
            id="content-keywords"
            tags={keywords}
            onChange={setKeywords}
            placeholder="organic skincare"
            maxTotalLength={150}
          />
          <Text className="mt-2 leading-normal! text-[#64748b]">
            Add keywords to naturally weave in for SEO. Separate with commas or Enter.
          </Text>

          <button
            type="submit"
            aria-label="Generate content"
            className="flex items-center justify-center gap-2 max-md-mobile:p-6 p-4 w-full mt-6 text-center text-base font-semibold rounded-[10px] bg-dark-100 text-white cursor-pointer transition-colors duration-200 hover:bg-dark-100/90"
          >
            Generate Content
            <ArrowRight className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </Container>
  );
}

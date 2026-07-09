"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowRight, Bookmark, FolderOpen } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { Text } from "@/components/ui/typography";
import { BackToHome, BackToHomeClick } from "@/components/ui/buttons";
import { Processing } from "@/components/ui/processing";
import { Modal } from "@/components/ui/modal";
import { LocationSelect } from "@/components/location-select";
import { TagInput } from "@/components/forms/tag-input";
import { KeywordAnalyticsTable } from "@/components/keyword-analytics-table";
import { useKeywordCollectionSave } from "@/lib/use-keyword-collection-save";
import { useToast } from "@/providers/toast-provider";
import { useRouter } from "next/navigation";

export function KeywordPlannerView() {
  const { showError } = useToast();
  const navigate = useRouter();
  const { save, saving } = useKeywordCollectionSave(showError);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [location, setLocation] = useState<{ country?: string; state?: string; city?: string }>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<unknown[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (keywords.length === 0) {
      showError("Please add a keyword first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keywords.join(", "), location: location.country }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error ?? "Keyword lookup failed. Please try again.");
      }
      setResults(Array.isArray(data.data) ? data.data : []);
      setShowResults(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  function openSaveModal() {
    if (!results || results.length === 0) {
      showError("Nothing to save yet — search for keywords first.");
      return;
    }
    setCollectionName(keywords.slice(0, 3).join(", ") || "My keywords");
    setSaveModalOpen(true);
  }

  function confirmSave(e: React.FormEvent) {
    e.preventDefault();
    const name = collectionName.trim();
    if (!name) {
      showError("Please name this collection.");
      return;
    }
    save({
      name,
      seedKeywords: keywords,
      location: location.country,
      keywords: results ?? [],
    });
    setSaveModalOpen(false);
  }

  if (loading) {
    return (
      <Container>
        <Wrapper className="min-h-[calc(100vh-290px)] flex items-center justify-center">
          <Processing heading="Searching Keywords" />
        </Wrapper>
      </Container>
    );
  }

  if (showResults) {
    return (
      <Container>
        <Wrapper className="py-6 flex items-center justify-between flex-wrap gap-3">
          <BackToHomeClick heading="New keyword search" onclick={() => setShowResults(false)} />
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/keyword-planner/collections"
              className="flex items-center gap-2 text-sm font-medium text-dark-100 hover:underline"
            >
              <FolderOpen className="w-4 h-4" aria-hidden="true" />
              My saved collections
            </Link>
            <button
              onClick={openSaveModal}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-[10px] bg-amber-500 text-white transition-colors duration-200 hover:bg-amber-500/90 disabled:opacity-50"
            >
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              {saving ? "Saving…" : "Save to Collection"}
            </button>
          </div>
        </Wrapper>
        <Wrapper className="bg-white p-10 mb-10 overflow-auto rounded-2xl shadow-6xl">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <KeywordAnalyticsTable keywords={results as any} />
        </Wrapper>

        <Modal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} contentLabel="Save keyword collection">
          <form onSubmit={confirmSave} className="space-y-4">
            <h2 className="text-xl font-semibold">Save to Collection</h2>
            <p className="text-sm text-[#64748b]">
              Give this set of {results?.length ?? 0} keywords a name so you can find it again later.
              You&apos;ll need to sign in with Google if you haven&apos;t already.
            </p>
            <div>
              <label htmlFor="collection-name" className="mb-2 block text-[14px] font-medium text-[#171717]">
                Collection name
              </label>
              <input
                id="collection-name"
                autoFocus
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g. Krishna Art Keywords"
                className="p-3 border-2 border-black/15 w-full bg-white transition-colors duration-200 rounded-[10px] text-base font-normal text-[#171717] focus:border-dark-100 focus:ring-4 focus:ring-dark-100/10"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-[10px] border-2 border-black/15 text-[#171717] hover:bg-black/5 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-[10px] bg-dark-100 text-white hover:bg-dark-100/90 transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
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
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-white">
            <KeyRound className="w-5 h-5" aria-hidden="true" />
          </span>
          <h1 className="text-[#171717] mt-5 text-[32px] font-bold leading-[1.15] tracking-[-0.01em] max-md-mobile:text-2xl">
            Keyword Planner
          </h1>
          <p className="mt-3 text-[15px] text-[#475569] max-w-130">
            Discover high-performing keywords and outsmart your competition with AI-powered keyword
            research.
          </p>
        </div>

        <form
          onSubmit={submitForm}
          className="mt-10 rounded-2xl border border-black/5 bg-white p-6 shadow-6xl max-md-mobile:p-4"
        >
          <label
            htmlFor="keyword-input"
            className="mb-3 block text-[14px] font-medium text-[#171717]"
          >
            Tell us more about your website business model in keywords
          </label>
          <TagInput
            id="keyword-input"
            tags={keywords}
            onChange={setKeywords}
            placeholder="Shoes"
            maxTotalLength={1000}
          />
          <Text className="mt-2 leading-normal! text-[#64748b]">
            For example if your business model is Shoes, then you can add shoes, nike shoes etc. as
            Keyword. <b>Multiple keywords can be added, separated by commas (,).</b>
          </Text>

          <div className="mt-4">
            <LocationSelect onChange={(loc) => setLocation((prev) => ({ ...prev, ...loc }))} />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 max-md-mobile:p-6 p-4 w-full mt-6 text-center text-base font-semibold rounded-[10px] bg-dark-100 text-white cursor-pointer transition-colors duration-200 hover:bg-dark-100/90"
          >
            Search Keywords
            <ArrowRight className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </Container>
  );
}

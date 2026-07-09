"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

function Stat({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-lg font-bold text-dark-100">{value ?? "—"}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function DataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <p className="font-semibold text-dark-100 text-sm mb-4">{title}</p>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function DomainAuthorityCard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <DataCard title="Domain Authority">
      <Stat label="Domain Authority" value={data.domainAuthority} />
      <Stat label="Spam Score" value={data.spamScore} />
      <Stat label="Linking Domains" value={data.linkingDomains} />
      <Stat label="Inbound Links" value={data.inboundLinks} />
    </DataCard>
  );
}

export function BacklinksCard({ data }: { data: any }) {
  if (!data) return null;
  const dofollowRatio =
    typeof data.dofollowLinks === "number" && typeof data.totalBacklinks === "number" && data.totalBacklinks > 0
      ? `${Math.round((data.dofollowLinks / data.totalBacklinks) * 100)}%`
      : null;
  return (
    <DataCard title="Backlink Profile">
      <Stat label="Total Backlinks" value={data.totalBacklinks} />
      <Stat label="Referring Domains" value={data.referringDomains} />
      <Stat label="Dofollow Ratio" value={dofollowRatio} />
      <Stat label="Crawled Pages" value={data.crawledPages} />
    </DataCard>
  );
}

export function AiVisibilityCard({ data }: { data: any }) {
  if (!data || (!data.chatgpt && !data.gemini)) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <p className="font-semibold text-dark-100 text-sm mb-4">AI Visibility</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "ChatGPT", result: data.chatgpt },
          { label: "Gemini", result: data.gemini },
        ].map(({ label, result }) =>
          result ? (
            <div key={label} className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-bold text-dark-100 uppercase tracking-wide mb-2">{label}</p>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {result.summary ?? result.sentiment ?? "No summary available."}
              </p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

const EFFORT_BADGE: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export function FixPlanSection({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="font-semibold text-dark-100 text-sm">
              {item.priority ? `${item.priority}. ` : ""}
              {item.title}
            </p>
            <div className="flex gap-2 shrink-0">
              {item.effort && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${EFFORT_BADGE[item.effort] ?? "bg-gray-100 text-gray-600"}`}>
                  {item.effort}
                </span>
              )}
              {item.impact && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap bg-blue-50 text-blue-700">
                  {item.impact} impact
                </span>
              )}
            </div>
          </div>
          {item.description && <p className="text-sm text-gray-500 leading-relaxed mb-2">{item.description}</p>}
          {item.fix && <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">{item.fix}</p>}
        </div>
      ))}
    </div>
  );
}

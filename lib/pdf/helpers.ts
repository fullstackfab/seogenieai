import "server-only";

/* Shared building blocks for the PDF report (split from the legacy 750-line
 * pdf.controller.js). All values are HTML-escaped before interpolation. */

export const safe = (v: unknown, fallback = "—") =>
  v !== null && v !== undefined && String(v).trim() !== "" ? String(v) : fallback;

/** DataForSEO WHOIS dates come back as "1995-08-14 01:00:00 +00:00" — render as "Aug 14, 1995". */
export const fmtDate = (v: unknown) => {
  if (v === null || v === undefined || String(v).trim() === "") return "—";
  const d = new Date(String(v));
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const fmt = (n: unknown) => {
  if (n === null || n === undefined) return "—";
  const num = Number(String(n).replace(/,/g, ""));
  if (isNaN(num)) return String(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(num);
};

export const scoreColor = (s: number) => (s >= 70 ? "#16a34a" : s >= 40 ? "#ca8a04" : "#dc2626");
export const scoreBg = (s: number) => (s >= 70 ? "#f0fdf4" : s >= 40 ? "#fefce8" : "#fff1f2");
export const scoreLabel = (s: number) => (s >= 70 ? "Good" : s >= 40 ? "Needs Work" : "Poor");

/** Display string from any value ({ text } / { analysis } objects, arrays, primitives). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const str = (v: any, maxLen = 400): string => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.slice(0, maxLen);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v))
    return v
      .map((i) => str(i, 100))
      .filter(Boolean)
      .join(", ");
  if (typeof v === "object") {
    const pick =
      v.text ?? v.analysis ?? v.value ?? v.label ?? v.description ?? v.content ?? v.summary;
    if (pick !== undefined) return str(pick, maxLen);
    const j = JSON.stringify(v);
    return j === "{}" ? "" : j.slice(0, maxLen);
  }
  return "";
};

export const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const STATUS: Record<
  string,
  { bg: string; border: string; dot: string; badge: string; text: string; label: string }
> = {
  pass: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#16a34a", badge: "#dcfce7", text: "#15803d", label: "Pass" },
  warn: { bg: "#fefce8", border: "#fde68a", dot: "#ca8a04", badge: "#fef9c3", text: "#854d0e", label: "Warn" },
  fail: { bg: "#fff1f2", border: "#fecdd3", dot: "#dc2626", badge: "#fee2e2", text: "#b91c1c", label: "Fail" },
  info: { bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6", badge: "#dbeafe", text: "#1d4ed8", label: "Info" },
};

export const FREE_CHECKS = [
  { key: "https", title: "HTTPS Status" },
  { key: "robotsTxt", title: "robots.txt" },
  { key: "sitemap", title: "Sitemap" },
  { key: "h1", title: "H1 Headings" },
  { key: "headings", title: "Heading Structure" },
  { key: "title", title: "HTML Title" },
  { key: "metaDescription", title: "Meta Description" },
  { key: "imageAlt", title: "Image Alt Text" },
  { key: "favicon", title: "Favicon & Touch Icons" },
  { key: "mixedContent", title: "Mixed Content" },
  { key: "rssFeed", title: "RSS/Atom Feed" },
  { key: "viewport", title: "Mobile Viewport" },
  { key: "openGraph", title: "Open Graph" },
  { key: "twitterCard", title: "Twitter Card" },
];

export const PAID_CHECKS = [
  { key: "dnsHardening", title: "DNS Hardening" },
  { key: "jsonLd", title: "JSON-LD Schema" },
  { key: "htmlLang", title: "HTML lang" },
  { key: "ogLocale", title: "OG Locale" },
  { key: "sameAs", title: "Knowledge Graph" },
  { key: "canonical", title: "Canonical URL" },
  { key: "hreflang", title: "Hreflang" },
  { key: "metaRobots", title: "Meta Robots" },
  { key: "aiRobots", title: "AI Bot Directives" },
  { key: "aiContentRestrictions", title: "AI Content Access" },
  { key: "llmsTxt", title: "llms.txt (AI Guidance)" },
  { key: "securityTxt", title: "security.txt" },
  { key: "sslCertificate", title: "SSL Certificate Health" },
  { key: "httpHeaders", title: "Security & Perf Headers" },
  { key: "redirectConsistency", title: "Redirect Consistency" },
  { key: "soft404", title: "Soft-404 Handling" },
  { key: "sitemapHealth", title: "Sitemap Health" },
  { key: "linkHygiene", title: "Link Hygiene" },
];

export function auditCard(title: string, item?: { status: string; value?: unknown; recommendation?: string }) {
  if (!item) return "";
  const st = STATUS[item.status] || STATUS.info;
  return `<div style="background:${st.bg};border:1px solid ${st.border};border-radius:10px;padding:14px 16px;break-inside:avoid;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;">
      <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
        <span style="width:9px;height:9px;border-radius:50%;background:${st.dot};flex-shrink:0;display:inline-block;"></span>
        <span style="font-size:12px;font-weight:700;color:#111827;">${esc(title)}</span>
      </div>
      <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:8px;background:${st.badge};color:${st.text};white-space:nowrap;margin-left:8px;">${st.label}</span>
    </div>
    ${item.value ? `<div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:5px;">${esc(String(item.value).slice(0, 80))}</div>` : ""}
    ${item.recommendation ? `<div style="font-size:11px;color:#6b7280;line-height:1.5;">${esc(item.recommendation)}</div>` : ""}
  </div>`;
}

export function kvRow(label: string, value: unknown) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f3f4f6;">
    <span style="font-size:12px;color:#9ca3af;">${esc(label)}</span>
    <span style="font-size:12px;font-weight:700;color:#111827;">${esc(safe(value))}</span>
  </div>`;
}

export function infoBox(title: string, content: string) {
  return `<div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;padding:16px;margin-bottom:12px;">
    <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">${esc(title)}</div>
    ${content}
  </div>`;
}

export function secHeader(color: string, title: string, sub?: string) {
  return `<div style="display:flex;align-items:center;gap:8px;padding:16px 40px 10px;background:#f8fafc;">
    <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block;"></span>
    <span style="font-size:14px;font-weight:800;color:#111827;">${esc(title)}</span>
    ${sub ? `<span style="font-size:11px;color:#9ca3af;">${esc(sub)}</span>` : ""}
  </div>`;
}

export function pageHeader(title: string, sub?: string) {
  return `<div style="background:#1a1a2e;padding:22px 40px 20px;">
    <h2 style="font-size:20px;color:#fff;font-weight:800;margin:0 0 4px;">${esc(title)}</h2>
    ${sub ? `<div style="font-size:12px;color:rgba(255,255,255,0.5);">${esc(sub)}</div>` : ""}
  </div>`;
}

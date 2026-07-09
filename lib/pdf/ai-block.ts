import "server-only";
import { esc, str } from "@/lib/pdf/helpers";

/* AI visibility block (ChatGPT / Gemini) for the PDF report. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aiBlock(data: any, name: string): string {
  if (!data)
    return `<div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;padding:20px;">
    <div style="font-size:16px;font-weight:800;color:#111827;margin-bottom:8px;">${esc(name)}</div>
    <p style="color:#9ca3af;font-size:13px;margin:0;">No data available for this AI model.</p>
  </div>`;

  const brandAwarenessRaw = str(data.brandAwareness);
  const sentimentRaw = str(data.sentiment);
  const credibilityRaw = str(data.credibility);
  const brandDescRaw = str(data.brandDescription, 250);
  const brandNameRaw = str(data.brandName, 80);
  const companyUrlRaw = str(data.companyUrl, 100);

  const awareness = (() => {
    const v = brandAwarenessRaw.toLowerCase();
    if (v.includes("high") || v.includes("strong"))
      return { label: "High", color: "#16a34a", bg: "#f0fdf4" };
    if (v.includes("medium") || v.includes("moderate"))
      return { label: "Medium", color: "#ca8a04", bg: "#fefce8" };
    if (v.includes("low") || v.includes("weak"))
      return { label: "Low", color: "#dc2626", bg: "#fff1f2" };
    if (v.includes("unknown") || !v) return { label: "Unknown", color: "#9ca3af", bg: "#f9fafb" };
    if (v.length > 30) {
      if (v.match(/\bhigh\b|\bstrong\b/)) return { label: "High", color: "#16a34a", bg: "#f0fdf4" };
      if (v.match(/\bmedium\b|\bmoderate\b/))
        return { label: "Medium", color: "#ca8a04", bg: "#fefce8" };
      if (v.match(/\blow\b|\bweak\b/)) return { label: "Low", color: "#dc2626", bg: "#fff1f2" };
    }
    return { label: brandAwarenessRaw.slice(0, 20) || "Unknown", color: "#9ca3af", bg: "#f9fafb" };
  })();

  const sentiment = (() => {
    const v = sentimentRaw.toLowerCase();
    if (v.includes("positive")) return { label: "Positive", color: "#15803d", bg: "#dcfce7" };
    if (v.includes("negative")) return { label: "Negative", color: "#b91c1c", bg: "#fee2e2" };
    if (v.includes("neutral")) return { label: "Neutral", color: "#1d4ed8", bg: "#dbeafe" };
    return { label: sentimentRaw.slice(0, 20) || "Neutral", color: "#1d4ed8", bg: "#dbeafe" };
  })();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = (arr: any, take: number, maxLen: number): string[] =>
    (Array.isArray(arr) ? arr.slice(0, take) : []).map((x) => str(x, maxLen)).filter(Boolean);

  const topics = list(data.topTopics, 6, 50);
  const comps = list(data.topCompetitors, 5, 50);
  const prompts = list(data.relatedPrompts, 5, 100);
  const services = list(data.servicesProducts, 6, 60);

  const chips = (items: string[], bg: string, color: string, border: string) =>
    items
      .map(
        (t) =>
          `<span style="font-size:11px;border-radius:8px;padding:3px 9px;background:${bg};color:${color};border:1px solid ${border};">${esc(t)}</span>`
      )
      .join("");

  const section = (label: string, inner: string) =>
    `<div style="margin-bottom:12px;">
      <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${label}</div>
      ${inner}
    </div>`;

  return `<div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;padding:18px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f3f4f6;">
      <span style="font-size:16px;font-weight:800;color:#111827;">${esc(name)}</span>
      ${sentimentRaw ? `<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;background:${sentiment.bg};color:${sentiment.color};">${esc(sentiment.label)}</span>` : ""}
    </div>
    ${brandNameRaw ? `<div style="font-size:14px;font-weight:800;color:#1a1a2e;margin-bottom:3px;">${esc(brandNameRaw)}</div>` : ""}
    ${companyUrlRaw ? `<div style="font-size:11px;color:#3b82f6;margin-bottom:8px;">${esc(companyUrlRaw)}</div>` : ""}
    ${brandDescRaw ? `<div style="font-size:12px;color:#374151;margin-bottom:12px;line-height:1.6;background:#f9fafb;border-radius:6px;padding:10px;">${esc(brandDescRaw)}</div>` : ""}
    <div style="background:${awareness.bg};border-radius:8px;padding:14px;text-align:center;margin-bottom:14px;">
      <div style="font-size:30px;font-weight:900;color:${awareness.color};">${esc(awareness.label)}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:3px;font-weight:600;">Brand Awareness</div>
      ${brandAwarenessRaw.length > 5 && brandAwarenessRaw.length <= 200 ? `<div style="font-size:11px;color:${awareness.color};margin-top:6px;line-height:1.4;">${esc(brandAwarenessRaw)}</div>` : ""}
    </div>
    ${
      credibilityRaw
        ? section(
            "Credibility Analysis",
            `<div style="font-size:12px;color:#374151;line-height:1.6;background:#f9fafb;border-radius:6px;padding:10px;">${esc(credibilityRaw)}</div>`
          )
        : ""
    }
    ${
      services.length > 0
        ? section(
            "Services &amp; Products",
            `<div style="display:flex;flex-wrap:wrap;gap:5px;">${chips(services, "#f0fdf4", "#15803d", "#bbf7d0")}</div>`
          )
        : ""
    }
    ${
      topics.length > 0
        ? section(
            "AI Associates With",
            `<div style="display:flex;flex-wrap:wrap;gap:5px;">${chips(topics, "#eff6ff", "#1d4ed8", "#bfdbfe")}</div>`
          )
        : ""
    }
    ${
      comps.length > 0
        ? section(
            "Also Mentions (Competitors)",
            `<div style="display:flex;flex-wrap:wrap;gap:5px;">${chips(comps, "#f3f4f6", "#374151", "#e5e7eb")}</div>`
          )
        : ""
    }
    ${
      prompts.length > 0
        ? section(
            "Queries That Surface Your Brand",
            prompts
              .map(
                (p) =>
                  `<div style="font-size:12px;color:#374151;padding:5px 0;border-bottom:1px solid #f9fafb;line-height:1.4;">&#x2022; ${esc(p)}</div>`
              )
              .join("")
          )
        : ""
    }
  </div>`;
}

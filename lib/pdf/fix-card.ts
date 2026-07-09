import "server-only";
import { esc } from "@/lib/pdf/helpers";
import type { FixPlanItem } from "@/lib/audit/types";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#6b7280"];
const EBG: Record<string, string> = { Easy: "#dcfce7", Medium: "#fef3c7", Hard: "#fee2e2" };
const ETXT: Record<string, string> = { Easy: "#15803d", Medium: "#92400e", Hard: "#991b1b" };
const IBG: Record<string, string> = { High: "#ede9fe", Medium: "#dbeafe", Low: "#f3f4f6" };
const ITXT: Record<string, string> = { High: "#6d28d9", Medium: "#1d4ed8", Low: "#374151" };

/** One prioritised fix item for the PDF action plan. */
export function fixCard(item: FixPlanItem, i: number): string {
  const color = COLORS[i] || COLORS[6];
  const effort = item.effort || "Medium";
  const impact = item.impact || "Medium";

  return `<div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;border-left:5px solid ${color};padding:18px 20px;margin-bottom:14px;break-inside:avoid;">
    <div style="display:flex;align-items:flex-start;gap:14px;">
      <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#fff;flex-shrink:0;margin-top:2px;">${item.priority || i + 1}</div>
      <div style="flex:1;">
        <div style="font-size:15px;font-weight:800;color:#111827;margin-bottom:8px;">${esc(item.title || "")}</div>
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;background:${EBG[effort] || "#f3f4f6"};color:${ETXT[effort] || "#374151"};">${esc(effort)} Effort</span>
          <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;background:${IBG[impact] || "#f3f4f6"};color:${ITXT[impact] || "#374151"};">${esc(impact)} Impact</span>
        </div>
        ${
          item.description
            ? `<div style="margin-bottom:10px;">
          <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px;">Why This Matters</div>
          <p style="font-size:13px;color:#374151;line-height:1.7;margin:0;">${esc(item.description)}</p>
        </div>`
            : ""
        }
        ${
          item.fix
            ? `<div style="background:#f8fafc;border-radius:8px;padding:12px 14px;border-left:3px solid ${color};">
          <div style="font-size:10px;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px;">Step-by-Step Fix</div>
          <div style="font-size:12px;color:#374151;line-height:1.8;">${esc(item.fix)}</div>
        </div>`
            : ""
        }
        ${
          item.resources
            ? `<div style="margin-top:10px;font-size:11px;color:#6b7280;">
          <span style="font-weight:700;">Resources: </span>${esc(item.resources)}
        </div>`
            : ""
        }
      </div>
    </div>
  </div>`;
}

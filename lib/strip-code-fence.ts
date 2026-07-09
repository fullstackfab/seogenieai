/**
 * Removes a leading/trailing ```html (or bare ```) markdown fence some models
 * add despite being asked for raw HTML. Safe to call on a growing string mid-stream:
 * the anchors only match a fence actually at the start/end of the current text.
 */
export function stripCodeFence(raw: string): string {
  return raw.replace(/^```[a-z]*\s*\n?/i, "").replace(/\n?```\s*$/, "");
}

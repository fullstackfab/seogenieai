import "server-only";

export type ContentLength = "short" | "medium" | "long";

export type ChatFlags = {
  userPrompt: string;
  nonHtmlResponse?: boolean;
  keyWordsContent?: boolean;
  pageSpeedInsights?: boolean;
  contentWriter?: boolean;
  contentType?: string;
  tone?: string;
  length?: ContentLength;
  keywords?: string[];
  country?: string;
  state?: string;
  city?: string;
};

/**
 * Prompt templates revived from the legacy chat.service.js (they were fully
 * commented out on the Express server, leaving the AI-report features dead).
 */
const NO_FENCE_RULE =
  "Do not wrap the output in markdown code fences (no ```html or ``` of any kind) — return the raw HTML only.";

const CONTENT_TYPE_GUIDANCE: Record<string, string> = {
  "Blog Post":
    "Structure it as a blog post: an <h1> title, a short introductory paragraph, 2-4 <h2> subheadings each with 1-2 paragraphs of body text, and a brief concluding paragraph.",
  "Product Description":
    "Write a product description: one short punchy paragraph, followed by a <ul> of 3-5 key features or benefits, ending with a one-sentence call to action.",
  "Social Media Post":
    "Write a short, engaging social media caption (2-4 sentences) in a single <p>, followed by a second <p> containing 3-6 relevant hashtags.",
  "Ad Copy":
    "Write short ad copy: a bold headline (<strong>), one or two persuasive sentences, and a clear call-to-action sentence.",
  "Meta Description":
    "Write ONLY a single meta description between 140 and 160 characters, wrapped in one <p> tag. No headline, no other content.",
  "Email Newsletter":
    "Write an email newsletter: a suggested subject line as a bolded first line, a greeting, 2-3 short body sections, and a sign-off.",
};

const LENGTH_WORDS: Record<ContentLength, string> = {
  short: "about 150 words",
  medium: "about 400 words",
  long: "about 800 words",
};

/** Builds the prompt for the structured AI Content Writer (topic/type/tone/length/keywords). */
function buildContentWriterPrompt(flags: ChatFlags, lengthInstruction: string): string {
  const contentType = flags.contentType ?? "Blog Post";
  const tone = flags.tone ?? "Professional";
  const length = flags.length ?? "medium";
  const guidance = CONTENT_TYPE_GUIDANCE[contentType] ?? CONTENT_TYPE_GUIDANCE["Blog Post"];
  const lengthNote =
    contentType === "Meta Description"
      ? ""
      : `Target length: ${LENGTH_WORDS[length]}. ${lengthInstruction}`;
  const keywordNote = flags.keywords?.length
    ? `Naturally incorporate these SEO keywords where they fit (do not force or stuff them): ${flags.keywords.join(", ")}.`
    : "";

  return `You are an expert content writer. Write a "${contentType}" about "${flags.userPrompt}" in a ${tone.toLowerCase()} tone.

${guidance}
${lengthNote}
${keywordNote}

Return the content strictly as raw HTML (only the tags described above — no <html>, <head>, or <body> wrapper).
${NO_FENCE_RULE}`;
}

const LENGTH_WORD_COUNT: Record<ContentLength, string> = {
  short: "approximately 150 words",
  medium: "approximately 400 words",
  long: "approximately 800 words",
};

function getLengthInstruction(length?: ContentLength): string {
  if (!length) return "";
  return ` The response should be ${LENGTH_WORD_COUNT[length]}, excluding HTML tags.`;
}

export function buildChatPrompt(flags: ChatFlags): string {
  const { userPrompt, country, state, city, length } = flags;
  const lengthInstruction = getLengthInstruction(length);
  if (flags.contentWriter) {
    return buildContentWriterPrompt(flags, lengthInstruction);
  }
  if (flags.nonHtmlResponse) {
    return `Hey you are an expert content writer. Please return the data strictly in HTML format and do not include any extra tags or anything, for ${userPrompt}.${lengthInstruction}\n${NO_FENCE_RULE}`;
  }
  if (flags.keyWordsContent) {
    return `Please suggest at least 10-15 keywords related to "${userPrompt}" for digital ads specifically targeting the following place:
- Country: ${country ?? "any"}
- State: ${state ?? "any"}
- City: ${city ?? "any"}
Ensure the suggested keywords:
1. Have a good search volume to ensure sufficient traffic.
2. Possess medium competition to balance between difficulty and opportunity.
3. Exhibit low keyword difficulty to facilitate easier ranking.
4. Show good CPC values to maximize return on investment.
Also provide the context of the data in a p tag for showing description.
Provide the data in a table format with the following headings:
- Keyword
- Avg. Monthly Searches
- Three Month Change
- Competition
- Top of Page Bid (Low Range)
- Top of Page Bid (High Range)
Please return the data strictly in HTML format. Do not include any additional text or explanations outside of the HTML code.
${NO_FENCE_RULE}`;
  }
  if (flags.pageSpeedInsights) {
    return `You are a senior web performance & SEO consultant. Analyze this PageSpeed Insights / Lighthouse report and write a report that tells the site owner exactly HOW to fix every issue, not just what's wrong: "${userPrompt}"
Structure the response as HTML with these sections, in this order:
1. <h2>Priority Fix Plan</h2> — a <table> with columns "Issue", "Impact" (High/Medium/Low), "Effort" (Quick win/Moderate/Involved), and "Fix" (one-sentence summary of the fix). List the 5-8 highest-impact issues across all categories, ordered by impact (highest first).
2. <h2>Performance</h2> — for the 3-4 most impactful issues affecting First Contentful Paint, Largest Contentful Paint, Total Blocking Time, or Cumulative Layout Shift: an <h3> naming the issue, one sentence on why it hurts the score, then an ordered list (<ol>, 3-5 steps max) of concrete implementation steps (specific techniques, e.g. "compress images with WebP/AVIF", "add width/height attributes to <img> tags", "defer non-critical JS with the defer attribute", "enable text compression via gzip/brotli on the server"). Use <code> for file names, attributes, or config keys.
3. <h2>SEO</h2> — the 3-4 most impactful issues affecting crawlability/indexability, each with an <h3>, a one-sentence explanation, and an ordered list (3-5 steps max) of the exact steps to fix it.
4. <h2>Accessibility</h2> — same format, 3-4 issues max: <h3> per issue, why it matters for real users, ordered list of fixes (3-5 steps max).
5. <h2>Best Practices</h2> — same format, 3-4 issues max: <h3> per issue, ordered list of fixes (3-5 steps max).
Keep each fix's ordered list tight and scannable — every fix must be actionable enough that a developer can follow the steps directly without further research, but do not pad with filler steps. Do not just restate the audit findings. Only cover a category if the report has real issues in it; skip a section entirely if that category already scores well.
**Return the response in HTML format only. Do not include any additional text or explanations outside of the HTML code.**
${NO_FENCE_RULE}`;
  }
  return `Use the following report, analyse and provide the analysis in a valid html section tag without wrapping in html tag: \n ${userPrompt}\n${lengthInstruction}\n${NO_FENCE_RULE}`;
}

/**
 * Paid "AI Growth Report" for a domain's GA4 + Search Console snapshot.
 * Structure/length bounds mirror the pageSpeedInsights prompt below — that
 * one was the fix for 4096-token truncation on a similarly detailed report,
 * so this reuses the same section caps plus the 8192 max_tokens ceiling.
 */
export function buildAnalyticsAiReportPrompt(analyticsJson: string, domain: string): string {
  return `You are a senior growth marketer and SEO consultant. Analyze this GA4 + Search Console report for "${domain}" and write a report that tells the site owner exactly HOW to act on it, not just what the numbers are:
${analyticsJson}

Structure the response as HTML with these sections, in this order:
1. <h2>Priority Fix Plan</h2> — a <table> with columns "Issue", "Impact" (High/Medium/Low), "Effort" (Quick win/Moderate/Involved), and "Fix" (one-sentence summary). List the 5-8 highest-impact issues found in the data, ordered by impact (highest first).
2. <h2>Traffic & Engagement Insights</h2> — the 3-4 most important findings (e.g. weak channels, high-bounce pages, low engagement time): each with an <h3> naming the finding, one sentence on why it matters, then an ordered list (<ol>, 3-5 steps max) of concrete actions.
3. <h2>Conversion & Revenue Opportunities</h2> — same format, 3-4 findings max, focused on turning existing traffic into more sales/leads.
4. <h2>SEO & Content Opportunities</h2> — same format, 3-4 findings max, using the Search Console query/page data to suggest concrete content or on-page fixes.
Keep each finding's action list tight and scannable — actionable enough to follow directly without further research, but no filler steps. Only include a section if the data actually supports it; skip a section entirely if there's nothing meaningful to say.
**Return the response in HTML format only. Do not include any additional text or explanations outside of the HTML code.**
${NO_FENCE_RULE}`;
}

export type SearchSuggestion = {
  title: string;
  key: "domain" | "websiteAnalysis" | "content" | "keyword" | "insight" | "rankTracker";
  content: string;
  link: string;
};

export const searchSuggestions: SearchSuggestion[] = [
  {
    title: "Analyse Your Website Traffic",
    key: "domain",
    content: "Create your website analysis with SeoGenieAI.",
    link: "/",
  },
  {
    title: "Complete Website SEO & Traffic Analysis Suite",
    key: "websiteAnalysis",
    content: "Get a complete overview of any website's performance with advanced SEO and traffic analytics.",
    link: "/ai-audit",
  },
  {
    title: "Content Writing",
    key: "content",
    content: "Generate blog posts, product descriptions, ad copy and more with AI.",
    link: "/content-writer",
  },
  {
    title: "Keyword Research",
    key: "keyword",
    content: "Plan your keywords for digital ads with SeoGenieAI.",
    link: "/keyword-planner",
  },
  {
    title: "Test Your Website Speed",
    key: "insight",
    content: "Check your site's speed insight and improve it.",
    link: "/",
  },
  {
    title: "Rank Tracker",
    key: "rankTracker",
    content: "Track your Google keyword rankings daily and see trends over time.",
    link: "/rank-tracker",
  },
];

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AppProviders } from "@/providers/app-providers";
import { WebVitals } from "@/components/analytics/web-vitals";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "SEOGenieAI — AI-Powered SEO & Digital Marketing",
    template: "%s | SEOGenieAI",
  },
  description:
    "Analyse your website traffic, domain authority, backlinks, keywords and AI visibility with SEOGenieAI's AI-powered SEO tools.",
  verification: { google: "feUn5y4_AahF2iqvm1KUeqnJCbVUzQhuJiszt_1_xw4" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only" aria-label="Skip to content">
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <WebVitals />
      </body>
    </html>
  );
}

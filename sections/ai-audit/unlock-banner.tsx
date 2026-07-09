"use client";

import { useState } from "react";
import { LockOpen, Loader2 } from "lucide-react";

const PAID_FEATURES = [
  "DNS Hardening",
  "JSON-LD Schema",
  "HTML lang",
  "OG Locale",
  "sameAs Links",
  "Canonical",
  "Hreflang",
  "Meta Robots",
  "AI Bot Directives",
  "AI Content Access",
];

export function UnlockBanner({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleUnlock() {
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Your email is required — we'll send the full PDF report there.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Failed to start checkout. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-8 rounded-2xl bg-dark-100 text-white p-8 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <LockOpen className="w-6 h-6" />
            <h2 className="text-xl font-bold">Get Your Full AI Readiness Report</h2>
          </div>
          <p className="text-white/70 text-sm leading-relaxed max-w-[480px]">
            One-time payment. We run the full 19-check audit plus domain authority, backlink
            profile, and AI visibility analysis — then email you a complete PDF instantly. No
            account needed. No subscription.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {PAID_FEATURES.map((f) => (
              <span
                key={f}
                className="text-xs bg-white/10 px-3 py-1 rounded-full whitespace-nowrap"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[260px] w-full max-w-[320px]">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black">$9.99</span>
            <div className="text-left">
              <p className="text-xs text-white/60 leading-tight">one-time</p>
              <p className="text-xs text-white/60 leading-tight">PDF to your inbox</p>
            </div>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="your@email.com"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/60 transition-all"
          />
          {error && <p className="text-red-300 text-xs">{error}</p>}

          <button
            onClick={handleUnlock}
            disabled={loading}
            aria-label="Get Full Report"
            className="w-full bg-white text-dark-100 font-bold py-3.5 rounded-xl text-sm hover:bg-white/90 transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to payment…
              </>
            ) : (
              "Get Full Report — $9.99 →"
            )}
          </button>
          <p className="text-center text-xs text-white/40">
            Secured by Stripe · PDF delivered to your email
          </p>
        </div>
      </div>
    </div>
  );
}

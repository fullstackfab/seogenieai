"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const listStagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const listItem = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

const INCLUDED = [
  "Performance breakdown & fixes",
  "SEO crawlability issues",
  "Accessibility recommendations",
  "Best-practices checklist",
];

/** Paywall shown before a PageSpeed AI report is generated — $4.99 one-time, unlocks this scan. */
export function AiReportPaywall({
  open,
  onClose,
  domain,
}: {
  open: boolean;
  onClose: () => void;
  domain: string;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUnlock() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/insight-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, email: session?.user?.email ?? undefined }),
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
    <Modal open={open} onClose={onClose} contentLabel="Unlock AI report" className="max-w-md">
      <div className="flex flex-col items-center text-center pt-2">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-14 h-14 rounded-2xl bg-dark-100 flex items-center justify-center mb-4"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-dark-100 mb-1">Unlock the AI Report</h2>
        <p className="text-sm text-gray-500 mb-5 max-w-[320px]">
          Claude analyses this PageSpeed scan for <span className="font-semibold text-dark-100">{domain}</span> and
          writes plain-English fixes for every issue found.
        </p>

        <motion.ul variants={listStagger} initial="hidden" animate="show" className="w-full space-y-2 mb-6 text-left">
          {INCLUDED.map((item) => (
            <motion.li variants={listItem} key={item} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              {item}
            </motion.li>
          ))}
        </motion.ul>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-black text-dark-100">$4.99</span>
          <span className="text-sm text-gray-400">one-time</span>
        </div>

        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUnlock}
          disabled={loading}
          className="w-full bg-dark-100 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-dark-100/90 transition-colors duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to payment…
            </>
          ) : (
            "Unlock AI Report — $4.99 →"
          )}
        </motion.button>
        <p className="text-center text-xs text-gray-400 mt-3">
          Secured by Stripe · Instant unlock · We&apos;ll also email you a PDF copy
        </p>
      </div>
    </Modal>
  );
}

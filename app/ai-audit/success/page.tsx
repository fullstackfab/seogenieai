// Rendering: Client (searchParams-driven) — reads the Stripe session/email off the query string.
import type { Metadata } from "next";
import { Suspense } from "react";
import { AiAuditSuccessView } from "@/sections/ai-audit/success-view";

export const metadata: Metadata = {
  title: "Payment Successful",
  robots: { index: false, follow: false },
};

export default function AiAuditSuccessPage() {
  return (
    <Suspense>
      <AiAuditSuccessView />
    </Suspense>
  );
}

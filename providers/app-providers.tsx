"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/providers/toast-provider";
import { AnalysisProvider } from "@/providers/analysis-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AnalysisProvider>{children}</AnalysisProvider>
      </ToastProvider>
    </SessionProvider>
  );
}

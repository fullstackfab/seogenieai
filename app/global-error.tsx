"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself (outside app/error.tsx's
 * reach). Must render its own <html>/<body> since it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- last-resort boundary; no server logger available here
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            The application ran into an unexpected error. Please try reloading the page.
          </p>
          <button
            onClick={reset}
            aria-label="Try again"
            className="pt-[7px] pb-2 px-[21px] text-center text-base font-normal rounded-[9px] border border-gray-900 bg-gray-900 text-white hover:bg-transparent hover:text-gray-900 transition-colors duration-300"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-segment error boundary. Next.js renders this in place of the page
 * whenever a rendering/runtime error is thrown below it in the tree — without
 * this file, users would see a blank page or the raw Next.js error overlay.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- client-side error boundary; no server logger available here
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-290px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
        <h1 className="text-2xl font-bold text-dark-100 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          An unexpected error occurred while loading this page. You can try again, or head back
          to the homepage.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="pt-[7px] pb-2 px-[21px] text-center text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 bg-dark-100 text-white hover:bg-transparent hover:text-dark-100"
          >
            Try again
          </button>
          <Link
            href="/"
            className="pt-[7px] pb-2 px-[21px] text-center text-base leading-[21.28px] font-normal rounded-[9px] border border-dark-100 transition-colors duration-300 text-dark-100 hover:bg-dark-100 hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

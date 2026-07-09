"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Toast = { kind: "error" | "success"; message: string } | null;

type ToastContextValue = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const AUTO_DISMISS_MS = 5000;

/** Replaces the legacy per-component Error/SuccessNotification pattern. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((kind: "error" | "success", message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ kind, message });
    timer.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
  }, []);

  const showError = useCallback((message: string) => show("error", message), [show]);
  const showSuccess = useCallback((message: string) => show("success", message), [show]);

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      {toast && (
        <div
          role="alert"
          className={`fixed top-20 right-4 z-[999999] max-w-96 w-full rounded-lg p-4 text-white shadow transition-all ${
            toast.kind === "error" ? "bg-red-500" : "bg-green-700"
          }`}
        >
          <p className="text-base font-medium">{toast.message}</p>
        </div>
      )}
    </ToastContext.Provider>
  );
}

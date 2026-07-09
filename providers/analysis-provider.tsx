"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type AnalysisOption = {
  id?: number;
  name?: string;
  domain?: string;
  oneDayAgo?: boolean;
  oneWeekAgo?: boolean;
  oneMonthAgo?: boolean;
  compareDates?: boolean;
  value?: { startDate: string; endDate: string };
} | null;

type AnalysisContextValue = {
  /** Domain the user is analysing (persisted to localStorage). */
  domain: string;
  setDomain: (domain: string) => void;
  /** GA4 + Search Console report from /api/google/analytics-report. */
  googleResponse: unknown;
  setGoogleResponse: Dispatch<SetStateAction<unknown>>;
  /** Which analysis the home search should run. */
  selectedPrimaryOption: string;
  setSelectedPrimaryOption: Dispatch<SetStateAction<string>>;
  /** Date-range option chosen on /options. */
  dataOption: AnalysisOption;
  setDataOption: Dispatch<SetStateAction<AnalysisOption>>;
  /** Free-text prompt handed from the home search to /response. */
  promptMessage: string;
  setPromptMessage: Dispatch<SetStateAction<string>>;
};

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

/**
 * The only cross-page client state: the analysed domain and the report handed
 * from /options to /domain-analysis. (The legacy app kept ~20 unrelated values
 * in one "Theme" context; auth now lives in the Auth.js session and streaming
 * state is local to the components that stream.)
 */
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [domain, setDomainState] = useState("");
  const [googleResponse, setGoogleResponse] = useState<unknown>(undefined);
  const [selectedPrimaryOption, setSelectedPrimaryOption] = useState("domain");
  const [dataOption, setDataOption] = useState<AnalysisOption>(null);
  const [promptMessage, setPromptMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("domain");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage on mount
    if (stored) setDomainState(stored);
  }, []);

  const setDomain = (value: string) => {
    setDomainState(value);
    if (value) localStorage.setItem("domain", value);
  };

  return (
    <AnalysisContext.Provider
      value={{
        domain,
        setDomain,
        googleResponse,
        setGoogleResponse,
        selectedPrimaryOption,
        setSelectedPrimaryOption,
        dataOption,
        setDataOption,
        promptMessage,
        setPromptMessage,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

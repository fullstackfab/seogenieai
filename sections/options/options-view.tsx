"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { DateRange } from "react-day-picker";
import { CircleAlert } from "lucide-react";
import { Container, Wrapper } from "@/components/ui/primitives";
import { H4, Text } from "@/components/ui/typography";
import { BackToHome } from "@/components/ui/buttons";
import { Processing } from "@/components/ui/processing";
import { useAnalysis } from "@/providers/analysis-provider";
import { useToast } from "@/providers/toast-provider";
import { getDomainOptions, type DomainOption } from "@/lib/domain-options";
import { formatDate } from "@/lib/date";

// react-day-picker only matters once a user picks "Compare dates" — deferred
// out of the initial /options bundle instead of loading unconditionally.
const DateRangeModal = dynamic(
  () => import("@/components/date-range-modal").then((m) => m.DateRangeModal),
  { ssr: false }
);

const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

export function OptionsView() {
  const router = useRouter();
  const { showError } = useToast();
  const { domain, setDataOption, setGoogleResponse } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (!domain) router.replace("/");
  }, [domain, router]);

  async function runAnalysis(option: DomainOption) {
    setDataOption(option);
    setLoading(true);
    try {
      const res = await fetch("/api/google/analytics-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: { ...option, domain } }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setCriticalError("Your session expired. Please sign in again.");
        return;
      }
      if (!data.success) {
        setCriticalError("Your Google account is not connected to Google Analytics.");
        return;
      }
      if (data.report?.noAnalyticsAccountFound) {
        showError("You do not have an analytics account associated with your Google login.");
        router.push("/");
        return;
      }
      if (data.report?.noMatchFoundForDomain) {
        showError("The domain is not associated with this Google account.");
        router.push("/");
        return;
      }
      setGoogleResponse(data.report);
      router.push("/domain-analysis");
    } catch {
      showError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  function selectOption(index: number) {
    const options = getDomainOptions();
    const option = options[index];
    if (option.compareDates) {
      setCompareOpen(true);
      return;
    }
    void runAnalysis(option);
  }

  function confirmCompareRange() {
    if (!range?.from || !range?.to) return;
    setCompareOpen(false);
    void runAnalysis({
      ...getDomainOptions()[3],
      value: { startDate: formatDate(range.from), endDate: formatDate(range.to) },
    });
  }

  if (criticalError) {
    return (
      <Container>
        <Wrapper className="h-[calc(100vh-250px)] flex items-center justify-center">
          <Wrapper className="flex flex-col items-center gap-1 w-full">
            <CircleAlert className="w-16 h-16 text-red-600" />
            <Text className="text-center !text-2xl max-w-[340px] mx-auto">{criticalError}</Text>
            <BackToHome />
          </Wrapper>
        </Wrapper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Wrapper className="h-[calc(100vh-250px)] flex items-center justify-center">
          <Processing heading="Please wait while we set things up for you!" />
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper className="space-y-4 max-w-[340px]">
        <BackToHome />
        {getDomainOptions().map((item, i) => (
          <div
            key={item.id}
            className="px-[31px] py-[18px] border-2 border-black/30 relative rounded-[10px] hover:bg-dark-100 group transition-all"
          >
            <H4 className="text-dark-100 group-hover:text-white transition-all duration-300">
              {item.name}
            </H4>
            <button
              onClick={() => selectOption(i)}
              className="absolute inset-0"
              aria-label={item.name}
            />
          </div>
        ))}
      </Wrapper>
      <DateRangeModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        range={range}
        onRangeChange={setRange}
        minDate={twoMonthsAgo}
        onConfirm={confirmCompareRange}
      />
    </Container>
  );
}

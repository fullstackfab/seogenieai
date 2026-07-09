"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Wrapper } from "@/components/ui/primitives";
import { Processing } from "@/components/ui/processing";
import { useToast } from "@/providers/toast-provider";

/** Handles the Stripe return: verifies payment, creates the pack, runs the first check, then redirects in. */
export function RankTrackerNewView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError } = useToast();
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      router.replace("/rank-tracker");
      return;
    }
    let cancelled = false;
    fetch(`/api/rank-tracker/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          router.replace(`/rank-tracker/packs/${data.packId}`);
        } else {
          const message = data.error ?? "Couldn't confirm your payment. Please try again.";
          setError(message);
          showError(message);
        }
      })
      .catch(() => {
        if (cancelled) return;
        const message = "Couldn't confirm your payment. Please try again.";
        setError(message);
        showError(message);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the session_id present on load
  }, []);

  return (
    <Container>
      <Wrapper className="min-h-[calc(100vh-290px)] flex items-center justify-center">
        {error ? (
          <p className="text-center text-red-600 max-w-100">{error}</p>
        ) : (
          <Processing heading="Setting up your rank tracker and checking initial rankings…" />
        )}
      </Wrapper>
    </Container>
  );
}

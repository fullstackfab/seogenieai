"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/primitives";
import { Processing } from "@/components/ui/processing";
import { HireExpert } from "@/components/hire-expert";
import { SearchBox } from "@/components/search/search-box";
import { useAnalysis } from "@/providers/analysis-provider";
import { useChatStream } from "@/lib/use-chat-stream";
import { sanitizeHtml } from "@/lib/sanitize-html";
import "@/components/ai-report-content.css";

/** Streams a free-text AI content response for the home search's "content" mode. */
export function ResponseView() {
  const { promptMessage, domain } = useAnalysis();
  const { answer, loading, failed, run } = useChatStream();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !promptMessage) return;
    started.current = true;
    void run(promptMessage, { nonHtmlResponse: true });
  }, [promptMessage, run]);

  return (
    <Container className="h-full min-h-[calc(100vh-290px)] flex flex-col justify-between pb-8">
      <div className={`flex-1 flex flex-col ${!answer ? "justify-center" : ""}`}>
        {loading && !answer && <Processing heading="PROCESSING Data" />}
        {failed && !loading && (
          <div className="text-center -mt-24">
            <h2 className="text-2xl uppercase font-semibold text-dark-100">Something went wrong!!</h2>
          </div>
        )}
        {answer && !failed && (
          <>
            <HireExpert />
            <div className="bg-white p-8 rounded-xl max-h-[70vh] overflow-auto">
              <div
                className="ai-report-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(answer) }}
              />
            </div>
          </>
        )}
      </div>
      <SearchBox value={promptMessage || domain} refresh />
    </Container>
  );
}

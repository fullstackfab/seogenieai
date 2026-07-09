import type { ReactNode } from "react";
import { Container, Wrapper } from "@/components/ui/primitives";

/** Shared shell for the static legal pages (privacy, terms). */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-center">
          <div className="bg-white rounded-md flex justify-center">
            <div className="px-6 py-8 w-[70%] max-md-tab:w-full">
              <h1 className="text-3xl font-bold mb-2 text-center">{title}</h1>
              <br />
              {children}
            </div>
          </div>
        </Container>
      </Wrapper>
    </Wrapper>
  );
}

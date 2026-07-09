import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";

/** Shared loading skeleton for the static legal pages (privacy, terms). */
export function LegalPageSkeleton() {
  return (
    <Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center flex justify-center">
          <div className="bg-white rounded-md flex justify-center w-full">
            <div className="px-6 py-8 w-[70%] max-md-tab:w-full">
              <Skeleton className="h-8 w-64 mx-auto mb-8" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-6">
                  <Skeleton className="h-5 w-48 mb-3" />
                  <SkeletonLines lines={3} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Wrapper>
    </Wrapper>
  );
}

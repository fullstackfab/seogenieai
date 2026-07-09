import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function WebsiteAnalysisLoading() {
  return (
    <Container className="min-h-[calc(100vh-290px)]">
      <Wrapper className="py-6 flex items-start justify-between flex-wrap gap-4 mb-2">
        <Skeleton className="h-4 w-24" />
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </Wrapper>

      <div className="pb-16 space-y-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-56 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-28 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

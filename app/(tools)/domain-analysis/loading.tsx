import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function DomainAnalysisLoading() {
  return (
    <Container>
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="flex w-full justify-end mb-4">
        <Skeleton className="h-11 w-40 rounded-[9px]" />
      </div>
      <Skeleton className="h-9 w-96 max-w-full mb-6" />

      <Wrapper className="flex gap-4 mb-4 max-md-tab:grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-28 rounded-lg" />
        ))}
      </Wrapper>

      <Wrapper className="flex gap-4 justify-between max-md-tab:flex-col">
        <Skeleton className="flex-[2] h-[400px] rounded-lg" />
        <Skeleton className="flex-1 h-[400px] rounded-lg" />
      </Wrapper>

      <Skeleton className="h-7 w-48 my-6" />
      <Wrapper className="flex gap-4 justify-between max-md-tab:flex-col">
        <Skeleton className="flex-[2] h-[400px] rounded-lg" />
        <Skeleton className="flex-1 h-[400px] rounded-lg" />
      </Wrapper>

      <Skeleton className="h-7 w-48 my-6" />
      <Skeleton className="h-64 w-full rounded-lg mb-4" />
      <Wrapper className="flex gap-4 justify-between mb-16 max-md-tab:flex-col">
        <Skeleton className="flex-[2] h-[400px] rounded-lg" />
        <Skeleton className="flex-1 h-[400px] rounded-lg" />
      </Wrapper>
    </Container>
  );
}

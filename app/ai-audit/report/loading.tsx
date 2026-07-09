import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

function AuditSkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-12 h-5 rounded-full" />
      </div>
      <Skeleton className="w-full h-3 mb-2" />
      <Skeleton className="w-3/4 h-3" />
    </div>
  );
}

export default function AiAuditReportLoading() {
  return (
    <Wrapper className="min-h-[calc(100vh-290px)] ">
      <Container>
        <Wrapper className="pt-8 pb-4">
          <Skeleton className="h-4 w-32" />
        </Wrapper>

        <Wrapper className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <Skeleton className="h-11 w-full rounded-lg" />
        </Wrapper>

        <Wrapper className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <Wrapper className="flex items-center justify-between gap-6">
            <Wrapper className="flex-1">
              <Skeleton className="w-48 h-6 mb-2" />
              <Skeleton className="w-72 h-4" />
            </Wrapper>
            <Skeleton className="w-36 h-28 rounded-2xl" />
          </Wrapper>
          <Skeleton className="h-3 rounded-full mt-6" />
        </Wrapper>

        <Wrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <AuditSkeletonCard key={i} />
          ))}
        </Wrapper>
      </Container>
    </Wrapper>
  );
}

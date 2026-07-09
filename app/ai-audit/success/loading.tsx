import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiAuditSuccessLoading() {
  return (
    <Wrapper className="min-h-[calc(100vh-290px)] flex items-center justify-center bg-lightblue-100">
      <Container>
        <Wrapper className="max-w-[520px] mx-auto text-center">
          <Wrapper className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
            <Wrapper className="flex justify-center mb-6">
              <Skeleton className="w-20 h-20 rounded-full" />
            </Wrapper>
            <Skeleton className="h-7 w-56 mx-auto mb-3" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-11 w-full rounded-xl mb-6" />
            <div className="text-left bg-gray-50 rounded-xl p-5 space-y-3">
              <Skeleton className="h-3 w-32" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </Wrapper>
        </Wrapper>
      </Container>
    </Wrapper>
  );
}

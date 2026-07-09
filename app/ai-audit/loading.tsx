import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiAuditLoading() {
  return (
    <Wrapper className="min-h-[calc(100vh-290px)] flex flex-col">
      <Container>
        <Wrapper className="pt-8">
          <Skeleton className="h-4 w-24" />
        </Wrapper>
      </Container>

      <Wrapper className="flex-1 flex items-center justify-center py-16 px-4">
        <Wrapper className="max-w-[720px] w-full mx-auto text-center">
          <Skeleton className="h-7 w-48 rounded-full mx-auto mb-6" />
          <Skeleton className="h-12 w-full max-w-lg mx-auto mb-2" />
          <Skeleton className="h-12 w-2/3 max-w-sm mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-md mx-auto mb-1" />
          <Skeleton className="h-5 w-2/3 max-w-sm mx-auto mb-10" />
          <Skeleton className="h-16 w-full rounded-xl mb-3" />
          <div className="flex items-center justify-center gap-3 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </Wrapper>
      </Wrapper>
    </Wrapper>
  );
}

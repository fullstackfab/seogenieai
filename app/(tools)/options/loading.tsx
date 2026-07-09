import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function OptionsLoading() {
  return (
    <Container>
      <Wrapper className="space-y-4 max-w-[340px]">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-[10px]" />
        ))}
      </Wrapper>
    </Container>
  );
}

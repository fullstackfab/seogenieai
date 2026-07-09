import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightLoading() {
  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-11 w-40 rounded-[9px]" />
      </div>
      <div className="flex justify-center items-center gap-3 mb-6">
        <Skeleton className="h-14 w-32" />
        <Skeleton className="h-14 w-32" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </Container>
  );
}

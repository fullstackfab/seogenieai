import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center pt-10 pb-12">
        <div>
          <Skeleton className="h-7 w-44 rounded-full" />
          <Skeleton className="h-10 w-full max-w-md mt-5" />
          <Skeleton className="h-10 w-3/4 max-w-sm mt-2" />
          <Skeleton className="h-4 w-full max-w-130 mt-4" />
          <Skeleton className="h-4 w-2/3 max-w-130 mt-2" />
        </div>
        <Skeleton className="mx-auto w-full max-w-115 aspect-square rounded-full max-md-mobile:max-w-70" />
      </div>

      <Skeleton className="h-20 w-full rounded-2xl" />

      <div className="mt-4 flex flex-wrap gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-32" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-black/5 bg-white p-5">
            <Skeleton className="w-11 h-11 rounded-xl" />
            <Skeleton className="h-4 w-3/4 mt-4" />
            <Skeleton className="h-3 w-full mt-2" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-6 mb-12 h-24 w-full rounded-2xl" />
    </Container>
  );
}

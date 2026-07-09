import { Container } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeywordPlannerLoading() {
  return (
    <Container>
      <div className="max-w-[800px] mx-auto mt-16 mb-16">
        <div className="flex justify-center mb-8">
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="flex flex-col items-center">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="h-8 w-52 mt-5" />
          <Skeleton className="h-4 w-full max-w-md mt-3" />
        </div>

        <div className="mt-10 rounded-2xl border border-black/5 bg-white p-6">
          <Skeleton className="h-4 w-72 max-w-full mb-3" />
          <Skeleton className="h-16 w-full rounded-[10px]" />
          <Skeleton className="h-4 w-full max-w-lg mt-3" />
          <Skeleton className="h-11 w-full rounded-[10px] mt-4" />
          <Skeleton className="h-13 w-full rounded-[10px] mt-6" />
        </div>
      </div>
    </Container>
  );
}

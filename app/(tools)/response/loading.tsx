import { Container } from "@/components/ui/primitives";
import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";

export default function ResponseLoading() {
  return (
    <Container className="h-full min-h-[calc(100vh-290px)] flex flex-col justify-between pb-8">
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white p-8 rounded-xl">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <SkeletonLines lines={6} />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-[10px] mt-4" />
    </Container>
  );
}

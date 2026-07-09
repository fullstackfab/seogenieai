import { Container, Wrapper } from "@/components/ui/primitives";
import { Skeleton, SkeletonLines } from "@/components/ui/skeleton";

export default function ServiceDetailLoading() {
  return (
    <Wrapper>
      <Wrapper className="mb-10 mt-16 max-sm-tab:mt-0">
        <Container className="items-center justify-center">
          <div className="bg-white rounded-md flex justify-center">
            <div className="px-6 py-8 w-[70%] max-md-tab:w-full">
              <Skeleton className="h-8 w-2/3 mb-6" />
              <SkeletonLines lines={4} />
              <Skeleton className="h-6 w-1/2 mt-8 mb-4" />
              <SkeletonLines lines={4} />
            </div>
          </div>
        </Container>
      </Wrapper>
      <Container>
        <Skeleton className="h-32 w-full rounded-xl" />
      </Container>
    </Wrapper>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function BlogsLoading() {
  return (
    <div className="min-h-[calc(100vh-290px)] flex items-center justify-center flex-col -mt-24 gap-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-5 w-96 max-w-full" />
    </div>
  );
}

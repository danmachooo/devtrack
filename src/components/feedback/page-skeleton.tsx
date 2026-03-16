import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}

import Skeleton from "../ui/Skeleton";

export default function SelectSkeleton({ labelWidth = "w-24" }) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-4 ${labelWidth}`} />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

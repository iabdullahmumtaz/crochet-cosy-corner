import { CardGridSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <CardGridSkeleton count={8} />
    </div>
  );
}

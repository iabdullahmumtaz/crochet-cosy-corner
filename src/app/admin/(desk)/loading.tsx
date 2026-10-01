import { Bone } from "@/components/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="grid gap-3 sm:grid-cols-3">
        <Bone className="h-24 rounded-3xl" />
        <Bone className="h-24 rounded-3xl" />
        <Bone className="h-24 rounded-3xl" />
      </div>
      <div className="mt-6 overflow-hidden rounded-[28px] border border-line bg-white">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-t border-line px-4 py-3 first:border-t-0">
            <Bone className="h-14 w-11 shrink-0 rounded-xl" />
            <Bone className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

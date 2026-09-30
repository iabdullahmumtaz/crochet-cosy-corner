import { Bone } from "@/components/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading the desk">
      <Bone className="h-12 w-48" />
      <Bone className="mt-3 h-4 w-64" />
      <Bone className="mt-6 h-72 rounded-[28px]" />
    </div>
  );
}

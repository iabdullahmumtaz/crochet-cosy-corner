import { cn } from "@/lib/cn";

export function Bone({ className }: { className?: string }) {
  return <div className={cn("bone rounded-2xl", className)} aria-hidden />;
}

export function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" aria-busy="true" aria-label="Loading the shop">
      <Bone className="h-12 w-56" />
      <Bone className="mt-3 h-4 w-72 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index}>
            <Bone className="aspect-[4/5] w-full rounded-3xl" />
            <Bone className="mt-4 h-5 w-3/4" />
            <Bone className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2" aria-busy="true" aria-label="Loading this piece">
      <Bone className="aspect-[4/5] w-full rounded-[28px]" />
      <div>
        <Bone className="h-4 w-28" />
        <Bone className="mt-4 h-14 w-4/5" />
        <Bone className="mt-4 h-4 w-32" />
        <Bone className="mt-6 h-4 w-full" />
        <Bone className="mt-2 h-4 w-5/6" />
        <Bone className="mt-2 h-4 w-2/3" />
        <Bone className="mt-8 h-12 w-48 rounded-full" />
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[340px_1fr]" aria-busy="true" aria-label="Loading your account">
      <Bone className="h-72 rounded-[28px]" />
      <div className="space-y-4">
        <Bone className="h-10 w-40" />
        <Bone className="h-24 rounded-3xl" />
        <Bone className="h-24 rounded-3xl" />
        <Bone className="h-24 rounded-3xl" />
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_320px]" aria-busy="true" aria-label="Loading checkout">
      <div className="space-y-4">
        <Bone className="h-12 w-48" />
        <Bone className="h-12 rounded-2xl" />
        <Bone className="h-12 rounded-2xl" />
        <Bone className="h-12 rounded-2xl" />
        <Bone className="h-28 rounded-2xl" />
      </div>
      <Bone className="h-64 rounded-[28px]" />
    </div>
  );
}

export function ReceiptSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" aria-busy="true" aria-label="Loading your order">
      <Bone className="h-8 w-40" />
      <Bone className="mt-3 h-14 w-72" />
      <Bone className="mt-8 h-56 rounded-[28px]" />
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" aria-busy="true" aria-label="Loading pieces">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <Bone className="aspect-[4/5] w-full rounded-3xl" />
          <Bone className="mt-4 h-5 w-3/4" />
          <Bone className="mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

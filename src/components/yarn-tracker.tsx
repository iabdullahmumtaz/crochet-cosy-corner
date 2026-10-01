import { STATUS_FLOW, STATUS_LABEL } from "@/lib/order-flow";
import { formatWhenTime } from "@/lib/format";
import type { OrderStatus, TrackingEvent } from "@/lib/types";

export function YarnTracker({ status, events }: { status: OrderStatus; events: TrackingEvent[] }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-3xl border border-sale/20 bg-blush px-5 py-4 text-sm text-bark">
        This order was cancelled. The pieces went back on the shelf.
      </div>
    );
  }

  const current = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  const progress = current <= 0 ? 0 : (current / (STATUS_FLOW.length - 1)) * 100;

  return (
    <div>
      <ol className="space-y-2 sm:hidden">
        {STATUS_FLOW.map((step, index) => {
          const on = index <= current;
          return (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className={on ? "loop loop-on" : "loop"}>{index + 1}</span>
              <span className={on ? "text-ink" : "text-muted"}>{STATUS_LABEL[step]}</span>
            </li>
          );
        })}
      </ol>
      <div className="hidden overflow-x-auto pb-2 sm:block">
        <div className="relative min-w-[40rem]">
        <div className="absolute top-[10px] right-4 left-4 h-[2px] bg-line" />
        <div className="absolute top-[10px] left-4 h-[2px] bg-sage" style={{ width: `calc((100% - 2rem) * ${progress / 100})` }} />
        <ol className="relative grid grid-cols-7 gap-1">
          {STATUS_FLOW.map((step, index) => {
            const on = index <= current;
            return (
              <li key={step} className="flex flex-col items-center gap-2 text-center">
                <span className={on ? "loop loop-on" : "loop"}>{index + 1}</span>
                <span className={`text-[11px] leading-tight ${on ? "text-bark" : "text-muted"}`}>{STATUS_LABEL[step]}</span>
              </li>
            );
          })}
        </ol>
        </div>
      </div>
      <ol className="mt-8 space-y-4 border-l border-line pl-4">
        {[...events].reverse().map((event) => (
          <li key={event.id}>
            <p className="text-sm font-medium text-ink">{event.label}</p>
            <p className="text-sm text-muted">{event.note}</p>
            <p className="text-xs text-muted">{formatWhenTime(event.at)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const tone =
    status === "delivered"
      ? "bg-foam text-sage-deep"
      : status === "cancelled"
        ? "bg-blush text-sale"
        : status === "making"
          ? "bg-[#f8efd4] text-[#7a5b12]"
          : "bg-white text-bark ring-1 ring-line";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone}`}>{STATUS_LABEL[status]}</span>;
}

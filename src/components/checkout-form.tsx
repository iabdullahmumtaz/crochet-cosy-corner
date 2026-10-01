"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { placeOrder, quoteCart } from "@/actions/shop";
import { Button, Field, controlClass } from "@/components/button";
import { useCart } from "@/components/cart-provider";
import { CITIES, FREE_DELIVERY, PAYMENTS } from "@/lib/domain";
import { formatRs } from "@/lib/format";
import type { PublicUser, Quote } from "@/lib/types";

export function CheckoutForm({ user }: { user: PublicUser | null }) {
  const router = useRouter();
  const { items, clear, ready } = useCart();
  const [city, setCity] = useState(user?.city && (CITIES as readonly string[]).includes(user.city) ? user.city : "Lahore");
  const [line, setLine] = useState(user?.addresses[0]?.line ?? "");
  const [phone, setPhone] = useState(user?.addresses[0]?.phone || user?.phone || "");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]["id"]>("cod");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let live = true;
    const handle = window.setTimeout(() => {
      quoteCart({
        items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
        city,
        coupon,
      }).then((result) => {
        if (live) setQuote(result);
      });
    }, 120);
    return () => {
      live = false;
      window.clearTimeout(handle);
    };
  }, [items, city, coupon, ready]);

  if (!ready) return <p className="text-sm text-muted">Preparing checkout…</p>;
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Your basket is empty. <a className="underline" href="/shop">Return to the shop</a>.
      </p>
    );
  }

  const remaining = quote?.ok ? Math.max(0, FREE_DELIVERY - quote.subtotal) : null;

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1fr_320px]"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await placeOrder({
          name: data.get("name"),
          email: user?.email ?? data.get("email"),
          phone,
          address: line,
          city,
          notes: data.get("notes"),
          payment,
          reference: data.get("reference"),
          company: data.get("company"),
          coupon,
          items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
        });
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        clear();
        toast.success("Order placed");
        router.push(`/order/${result.number}`);
        router.refresh();
      }}
    >
      <div className="grid gap-4">
        <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <Field label="Name">
          <input name="name" required defaultValue={user?.name ?? ""} autoComplete="name" className={controlClass} />
        </Field>
        <Field label="Email" hint={user ? "Orders on this account use this email." : "We'll use this for tracking."}>
          <input name="email" type="email" required defaultValue={user?.email ?? ""} readOnly={Boolean(user)} autoComplete="email" className={controlClass} />
        </Field>
        {user && user.addresses.length > 0 ? (
          <Field label="Saved address">
            <select
              className={controlClass}
              defaultValue={user.addresses[0]?.id ?? ""}
              onChange={(event) => {
                const found = user.addresses.find((item) => item.id === event.target.value);
                if (!found) return;
                setLine(found.line);
                setPhone(found.phone);
                if ((CITIES as readonly string[]).includes(found.city)) setCity(found.city);
              }}
            >
              {user.addresses.map((item) => (
                <option key={item.id} value={item.id}>{item.label} · {item.city}</option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Phone">
          <input name="phone" required value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" className={controlClass} />
        </Field>
        <Field label="Address">
          <input name="address" required value={line} onChange={(event) => setLine(event.target.value)} autoComplete="street-address" className={controlClass} />
        </Field>
        <Field label="City">
          <select name="city" value={city} onChange={(event) => setCity(event.target.value)} className={controlClass}>
            {CITIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Note for the studio" hint="Initials, colours, or a gift message.">
          <textarea name="notes" rows={3} className={`${controlClass} h-auto py-3`} />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm text-bark">Payment</legend>
          <div className="grid gap-2">
            {PAYMENTS.map((option) => (
              <label key={option.id} className={`rounded-2xl border px-4 py-3 ${payment === option.id ? "border-sage bg-foam" : "border-line bg-white"}`}>
                <input type="radio" name="payment" className="mr-2" checked={payment === option.id} onChange={() => setPayment(option.id)} />
                <span className="text-sm">{option.label}</span>
                <span className="mt-1 block pl-6 text-xs text-muted">{option.detail}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {payment !== "cod" ? (
          <Field label="Payment reference" hint="Optional. A transaction id helps us match the transfer.">
            <input name="reference" maxLength={40} className={controlClass} />
          </Field>
        ) : null}
        <Button disabled={pending || !quote?.ok}>{pending ? "Placing order…" : "Place order"}</Button>
      </div>
      <aside className="panel h-fit rounded-[28px] p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl text-cocoa">Your pieces</h2>
        {quote && !quote.ok ? <p className="mt-3 text-sm text-sale">{quote.error}</p> : null}
        {quote?.ok ? (
          <ul className="mt-4 space-y-2 text-sm">
            {quote.lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3">
                <span>{line.name} × {line.qty}</span>
                <span>{formatRs(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {quote?.ok ? (
          <div className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatRs(quote.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{quote.shipping === 0 ? "Free" : formatRs(quote.shipping ?? 0)}</span></div>
            {quote.discount > 0 ? <div className="flex justify-between"><span className="text-muted">{quote.couponLabel || "Offer"}</span><span>-{formatRs(quote.discount)}</span></div> : null}
            <div className="flex justify-between font-medium"><span>Total</span><span>{formatRs(quote.total)}</span></div>
            {quote.couponError ? <p className="text-xs text-sale">{quote.couponError}</p> : null}
            <p className="pt-2 text-xs text-muted">
              {remaining === 0 ? "Delivery is on us." : `Add ${formatRs(remaining ?? 0)} for free delivery.`}
            </p>
          </div>
        ) : null}
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-bark">Offer code</span>
          <input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Code" className={controlClass} />
        </label>
      </aside>
    </form>
  );
}

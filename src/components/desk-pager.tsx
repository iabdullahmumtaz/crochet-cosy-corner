import Link from "next/link";

export function DeskPager({
  page,
  pages,
  total,
  from,
  to,
  pathname,
  params,
  pageKey = "page",
}: {
  page: number;
  pages: number;
  total: number;
  from: number;
  to: number;
  pathname: string;
  params?: Record<string, string | undefined>;
  pageKey?: string;
}) {
  if (total === 0) return null;

  function href(next: number) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) search.set(key, value);
    }
    if (next > 1) search.set(pageKey, String(next));
    else search.delete(pageKey);
    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const numbers = pages <= 7 ? Array.from({ length: pages }, (_, index) => index + 1) : [];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
      <p className="text-muted">
        {from}–{to} of {total}
      </p>
      {pages > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {page > 1 ? (
            <Link href={href(page - 1)} className="rounded-full px-3 py-1.5 text-bark ring-1 ring-line hover:bg-foam">
              Previous
            </Link>
          ) : (
            <span className="rounded-full px-3 py-1.5 text-muted ring-1 ring-line">Previous</span>
          )}
          {numbers.map((number) => (
            <Link
              key={number}
              href={href(number)}
              aria-current={number === page ? "page" : undefined}
              className={
                number === page
                  ? "grid h-8 w-8 place-items-center rounded-full bg-sage text-white"
                  : "grid h-8 w-8 place-items-center rounded-full text-bark ring-1 ring-line hover:bg-foam"
              }
            >
              {number}
            </Link>
          ))}
          {page < pages ? (
            <Link href={href(page + 1)} className="rounded-full px-3 py-1.5 text-bark ring-1 ring-line hover:bg-foam">
              Next
            </Link>
          ) : (
            <span className="rounded-full px-3 py-1.5 text-muted ring-1 ring-line">Next</span>
          )}
        </div>
      ) : null}
    </div>
  );
}

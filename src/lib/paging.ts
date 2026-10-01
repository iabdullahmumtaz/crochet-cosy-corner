export const PAGE_SIZE = 8;

export function parsePage(value: string | undefined) {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

export function pageOf<T>(items: T[], page: number, size = PAGE_SIZE) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: current,
    pages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + size, total),
  };
}

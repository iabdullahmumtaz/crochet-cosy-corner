import type { Product, QuoteLine } from "@/lib/types";

export function priceLines(
  products: Product[],
  lines: { productId: string; qty: number }[],
): { ok: true; lines: QuoteLine[]; subtotal: number } | { ok: false; error: string } {
  if (lines.length === 0) return { ok: false, error: "Your basket is empty." };
  if (lines.length > 20) return { ok: false, error: "That's more pieces than one parcel can hold." };

  const seen = new Set<string>();
  const priced: QuoteLine[] = [];

  for (const line of lines) {
    if (seen.has(line.productId)) {
      return { ok: false, error: "A piece was listed twice. Refresh the basket and try again." };
    }
    seen.add(line.productId);
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 5) {
      return { ok: false, error: "Choose between 1 and 5 of each piece." };
    }
    const product = products.find((item) => item.id === line.productId);
    if (!product || !product.active) {
      return { ok: false, error: "A piece in your basket is no longer in the shop." };
    }
    if (product.stock < line.qty) {
      return {
        ok: false,
        error:
          product.stock === 0
            ? `${product.name} just sold out.`
            : `Only ${product.stock} of ${product.name} left.`,
      };
    }
    priced.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      qty: line.qty,
      lineTotal: product.price * line.qty,
      motif: product.motif,
      palette: product.palette,
      stock: product.stock,
    });
  }

  const subtotal = priced.reduce((sum, line) => sum + line.lineTotal, 0);
  return { ok: true, lines: priced, subtotal };
}

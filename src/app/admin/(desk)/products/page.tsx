import Link from "next/link";
import { buttonClass } from "@/components/button";
import { categoryLabel } from "@/lib/domain";
import { readStore } from "@/lib/db";
import { formatRs } from "@/lib/format";

export default async function ProductsPage() {
  const store = await readStore();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-cocoa">Pieces</h1>
          <p className="mt-1 text-sm text-muted">{store.products.length} in the studio book.</p>
        </div>
        <Link href="/admin/products/new" className={buttonClass("solid")}>New piece</Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">Collection</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Shop</th>
            </tr>
          </thead>
          <tbody>
            {store.products.map((product) => (
              <tr key={product.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="text-ink hover:underline">{product.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{categoryLabel(product.category, store.categories)}</td>
                <td className="px-4 py-3">{formatRs(product.price)}</td>
                <td className={`px-4 py-3 ${product.stock <= 3 ? "text-sale" : ""}`}>{product.stock}</td>
                <td className="px-4 py-3 text-muted">{product.active ? (product.featured ? "Live · featured" : "Live") : "Hidden"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

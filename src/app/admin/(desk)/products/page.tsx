import Link from "next/link";
import { CardPhoto } from "@/components/card-photo";
import { DeleteProduct } from "@/components/delete-product";
import { DeskPager } from "@/components/desk-pager";
import { buttonClass } from "@/components/button";
import { categoryLabel } from "@/lib/domain";
import { readStore } from "@/lib/db";
import { formatRs } from "@/lib/format";
import { pageOf, parsePage } from "@/lib/paging";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const category = params.category ?? "";
  const store = await readStore();
  const products = store.products.filter((product) => {
    if (category && product.category !== category) return false;
    if (!q) return true;
    return product.name.toLowerCase().includes(q) || product.slug.includes(q);
  });
  const { items, ...pager } = pageOf(products, parsePage(params.page));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-cocoa">Pieces</h1>
          <p className="mt-1 text-sm text-muted">{products.length} in this view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex flex-wrap gap-2">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search pieces" className="h-12 rounded-full border border-line bg-white px-4 text-sm" />
          </form>
          <Link href="/admin/products/new" className={buttonClass("solid")}>New piece</Link>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={q ? `/admin/products?q=${encodeURIComponent(q)}` : "/admin/products"} className={`rounded-full px-3 py-1.5 text-xs ${category ? "bg-white text-bark ring-1 ring-line" : "bg-sage text-white"}`}>
          All
        </Link>
        {(store.categories ?? []).map((item) => (
          <Link
            key={item.id}
            href={`/admin/products?category=${item.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-3 py-1.5 text-xs ${category === item.id ? "bg-sage text-white" : "bg-white text-bark ring-1 ring-line"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="stack w-full text-left text-sm md:min-w-[680px]">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">Collection</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Shop</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id} className="border-t border-line">
                <td className="px-4 py-2">
                  <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 text-ink hover:underline">
                    {product.imageUrl ? (
                      <CardPhoto src={product.imageUrl} className="h-14 w-11 shrink-0 rounded-xl" />
                    ) : (
                      <span className="grid h-14 w-11 shrink-0 place-items-center rounded-xl bg-foam text-[10px] text-muted">None</span>
                    )}
                    <span>{product.name}</span>
                  </Link>
                </td>
                <td data-label="Collection" className="px-4 py-3 text-muted">{categoryLabel(product.category, store.categories)}</td>
                <td data-label="Price" className="px-4 py-3">{formatRs(product.price)}</td>
                <td data-label="Stock" className={`px-4 py-3 ${product.stock <= 3 ? "text-sale" : ""}`}>{product.stock}</td>
                <td data-label="Shop" className="px-4 py-3 text-muted">{product.active ? (product.featured ? "Live · featured" : "Live") : "Hidden"}</td>
                <td data-label="" className="px-4 py-3">
                  <span className="flex gap-3">
                    <Link href={`/admin/products/${product.id}`} className="text-sage-deep">Edit</Link>
                    <Link href={`/product/${product.slug}`} className="text-bark">View</Link>
                    <DeleteProduct id={product.id} compact />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No pieces in this view.</p> : null}
        <DeskPager
          {...pager}
          pathname="/admin/products"
          params={{ q: params.q, category: category || undefined }}
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { DeleteReview } from "@/components/delete-review";
import { DeskPager } from "@/components/desk-pager";
import { readStore } from "@/lib/db";
import { formatWhen } from "@/lib/format";
import { pageOf, parsePage } from "@/lib/paging";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const store = await readStore();
  const { items, ...pager } = pageOf(store.reviews, parsePage(params.page));

  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Reviews</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Shoppers leave these on a piece. Remove one if it should not stay on the shop.</p>
      <div className="overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="stack w-full text-left text-sm md:min-w-[720px]">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {items.map((review) => {
              const product = store.products.find((item) => item.id === review.productId);
              return (
                <tr key={review.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    {product ? (
                      <Link href={`/admin/products/${product.id}`} className="hover:underline">{product.name}</Link>
                    ) : (
                      <span className="text-muted">Piece removed</span>
                    )}
                    <span className="mt-1 block text-xs text-muted">{formatWhen(review.createdAt)}</span>
                  </td>
                  <td data-label="From" className="px-4 py-3">
                    {review.userId ? (
                      <Link href={`/admin/customers/${review.userId}`} className="hover:underline">{review.name}</Link>
                    ) : (
                      review.name
                    )}
                    <span className="block text-xs text-muted">{review.city} · {review.rating}/5</span>
                  </td>
                  <td data-label="Note" className="max-w-sm px-4 py-3 leading-6">{review.text}</td>
                  <td data-label="" className="px-4 py-3"><DeleteReview id={review.id} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {store.reviews.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No reviews yet.</p> : null}
        <DeskPager {...pager} pathname="/admin/reviews" />
      </div>
    </div>
  );
}

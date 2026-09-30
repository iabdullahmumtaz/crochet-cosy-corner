import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteProduct } from "@/components/delete-product";
import { ProductForm } from "@/components/product-form";
import { readStore } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const product = store.products.find((item) => item.id === id);
  if (!product) notFound();
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-sage-deep">Back to pieces</Link>
      <h1 className="mt-2 mb-6 font-display text-4xl text-cocoa">Edit piece</h1>
      <ProductForm product={product} categories={store.categories ?? []} />
      <DeleteProduct id={product.id} />
    </div>
  );
}

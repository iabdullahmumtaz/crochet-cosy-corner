import Link from "next/link";
import { ProductForm } from "@/components/product-form";
import { readStore } from "@/lib/db";

export default async function NewProductPage() {
  const store = await readStore();
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-sage-deep">Back to pieces</Link>
      <h1 className="mt-2 mb-6 font-display text-4xl text-cocoa">New piece</h1>
      <ProductForm categories={store.categories ?? []} />
    </div>
  );
}

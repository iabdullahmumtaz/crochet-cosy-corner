import { CategoryManager } from "@/components/category-manager";
import { readStore } from "@/lib/db";

export default async function CategoriesPage() {
  const store = await readStore();
  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Collections</h1>
      <p className="mt-1 mb-6 text-sm text-muted">These are the filters on the shop. A collection with pieces in it cannot be deleted.</p>
      <CategoryManager categories={store.categories ?? []} />
    </div>
  );
}

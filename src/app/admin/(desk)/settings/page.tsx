import { DeskPager } from "@/components/desk-pager";
import { DeskSettings } from "@/components/desk-settings";
import { ThemePicker } from "@/components/theme-picker";
import { readStore } from "@/lib/db";
import { pageOf, parsePage } from "@/lib/paging";
import { themeId } from "@/lib/themes";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const store = await readStore();
  const { items, ...pager } = pageOf(store.subscribers ?? [], parsePage(params.page));
  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Settings</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Theme, WhatsApp, the next order number, and the mailing list are stored in the database.</p>
      <div className="grid gap-6">
        <ThemePicker current={themeId(store.theme)} />
        <DeskSettings
          number={store.whatsapp ?? ""}
          seq={store.seq}
          subscribers={items}
          pager={<DeskPager {...pager} pathname="/admin/settings" />}
        />
      </div>
    </div>
  );
}

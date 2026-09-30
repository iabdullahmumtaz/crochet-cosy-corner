import { DeskSettings } from "@/components/desk-settings";
import { readStore } from "@/lib/db";

export default async function SettingsPage() {
  const store = await readStore();
  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Settings</h1>
      <p className="mt-1 mb-6 text-sm text-muted">WhatsApp, the next order number, and the mailing list are stored in the database.</p>
      <DeskSettings number={store.whatsapp ?? ""} seq={store.seq} subscribers={store.subscribers ?? []} />
    </div>
  );
}

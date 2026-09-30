import { WhatsappSettings } from "@/components/whatsapp-settings";
import { readStore } from "@/lib/db";

export default async function SettingsPage() {
  const store = await readStore();
  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Settings</h1>
      <p className="mt-1 mb-6 text-sm text-muted">The green chat button on the shop opens this WhatsApp chat.</p>
      <WhatsappSettings number={store.whatsapp ?? ""} />
    </div>
  );
}

"use client";

import { toast } from "sonner";

export async function guardSave<T>(setPending: (pending: boolean) => void, work: () => Promise<T>): Promise<T | null> {
  setPending(true);
  try {
    return await work();
  } catch {
    toast.error("That did not save. Try again.");
    return null;
  } finally {
    setPending(false);
  }
}

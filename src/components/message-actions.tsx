"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markMessage } from "@/actions/admin";

export function MessageActions({ id, read, email }: { id: string; read: boolean; email: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <a className="text-sage-deep underline" href={`mailto:${email}`}>
        Reply by email
      </a>
      <button
        type="button"
        className="text-sage-deep underline"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const result = await markMessage(id, !read);
          setPending(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(read ? "Marked new" : "Marked read");
          router.refresh();
        }}
      >
        {read ? "Mark new" : "Mark read"}
      </button>
    </div>
  );
}

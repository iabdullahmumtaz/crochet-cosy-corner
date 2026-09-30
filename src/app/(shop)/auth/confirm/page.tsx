"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeEmailSignup } from "@/actions/auth";

export default function ConfirmPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const accessToken = hash.get("access_token") ?? "";
    const problem = hash.get("error_description") || query.get("error_description");
    if (problem) {
      setMessage(problem);
      return;
    }
    if (!accessToken) {
      setMessage("Open the confirmation link from your email on this same browser.");
      return;
    }
    completeEmailSignup(accessToken).then((result) => {
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      router.replace("/account");
      router.refresh();
    });
  }, [router]);

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="font-display text-4xl text-cocoa">Email confirmation</h1>
      <p className="mt-3 text-sm text-muted">{message}</p>
    </div>
  );
}

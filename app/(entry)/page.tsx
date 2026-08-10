"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    const preferred = navigator.languages?.[0] ?? navigator.language;
    const locale = preferred?.toLowerCase().startsWith("ru") ? "ru" : "en";
    router.replace(`/${locale}`);
  }, [router]);

  return (
    <main className="entry-page" aria-label="VANSMITHLAB — loading">
      <h1 className="sr-only">VANSMITHLAB — Design knowledge library</h1>
      <p className="entry-mark">VANSMITHLAB®</p>
    </main>
  );
}

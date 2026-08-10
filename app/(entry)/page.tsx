"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { entityDescriptions, rootStructuredData } from "@/lib/structured-data";

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    const preferred = navigator.languages?.[0] ?? navigator.language;
    const locale = preferred?.toLowerCase().startsWith("ru") ? "ru" : "en";
    router.replace(`/${locale}`);
  }, [router]);

  return (
    <main className="entry-page" aria-label="VANSMITHLAB — loading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(rootStructuredData()).replace(/</g, "\\u003c") }} />
      <p className="entry-mark">VANSMITHLAB®</p>
      <h1>Independent encyclopedia of design and visual culture.</h1>
      <p className="entry-description">{entityDescriptions.en}</p>
    </main>
  );
}

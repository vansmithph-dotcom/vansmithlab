"use client";

import Link from "next/link";
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
    <main className="entry-page">
      <p className="entry-mark">VANSMITHLAB®</p>
      <h1>Independent design knowledge library</h1>
      <div className="entry-links">
        <Link href="/ru">Русский</Link>
        <Link href="/en">English</Link>
      </div>
    </main>
  );
}

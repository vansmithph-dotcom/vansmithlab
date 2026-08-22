"use client";

import { useState } from "react";
import type { Locale } from "@/lib/site-data";

const labels = {
  ru: { share: "Поделиться", copied: "Ссылка скопирована" },
  en: { share: "Share", copied: "Link copied" },
} as const;

export function ShareButton({ locale, title, summary }: { locale: Locale; title: string; summary: string }) {
  const [copied, setCopied] = useState(false);
  const text = labels[locale];

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: summary, url });
      } catch {
        // user cancelled the native share sheet; no error state needed
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; nothing more we can do without a server round-trip
    }
  }

  return (
    <button className="text-link share-button" onClick={handleShare} type="button">
      <span aria-hidden="true">{copied ? "✓" : "↗"}</span>
      {copied ? text.copied : text.share}
    </button>
  );
}

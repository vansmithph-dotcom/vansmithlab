"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/site-data";

export type FeaturedAnalysisItem = { content_id: string; title: string; summary: string; href: string; hero_image?: { src: string; alt: string } };

export function FeaturedAnalysisRotator({ locale, items }: { locale: Locale; items: FeaturedAnalysisItem[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 8000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const item = items[index];
  if (!item) return null;

  return (
    <section className="analysis-section" aria-roledescription={locale === "ru" ? "ротатор публикаций" : "publication rotator"}>
      <div className="shell analysis-grid analysis-feature">
        <div>
          <p className="eyebrow">{locale === "ru" ? "Новая аналитика" : "Latest analysis"}</p>
          <h2>{item.title}</h2>
          <p className="analysis-feature-summary">{item.summary}</p>
          <Link className="text-link" href={item.href}>{locale === "ru" ? "Читать материал" : "Read publication"}<span>→</span></Link>
          {items.length > 1 && <div className="analysis-dots" aria-label={locale === "ru" ? "Выбор материала" : "Choose publication"}>{items.map((candidate, dotIndex) => <button aria-label={candidate.title} aria-pressed={dotIndex === index} key={candidate.content_id} onClick={() => setIndex(dotIndex)} type="button" />)}</div>}
        </div>
        {item.hero_image ? <span className="analysis-feature-media"><Image alt={item.hero_image.alt} fill priority sizes="(max-width: 800px) 100vw, 50vw" src={item.hero_image.src} /></span> : null}
      </div>
    </section>
  );
}

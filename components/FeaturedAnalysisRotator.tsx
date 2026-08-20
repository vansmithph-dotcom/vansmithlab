"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  canAdvanceFeaturedAnalysis,
  getNextFeaturedAnalysisIndex,
} from "@/lib/featured-analysis-rotation.mjs";
import type { Locale } from "@/lib/site-data";

export type FeaturedAnalysisItem = { content_id: string; title: string; summary: string; href: string; hero_image?: { src: string; alt: string } };

const AUTOPLAY_DELAY_MS = 7000;

export function FeaturedAnalysisRotator({ locale, items }: { locale: Locale; items: FeaturedAnalysisItem[] }) {
  const [index, setIndex] = useState(0);
  const [restartToken, setRestartToken] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const interactionPaused = hovered || focusWithin || pointerActive || userPaused;

  useEffect(() => {
    if (!canAdvanceFeaturedAnalysis({
      itemCount: items.length,
      prefersReducedMotion,
      interactionPaused,
      pageVisible,
    })) return;

    const timer = window.setTimeout(() => {
      setIndex((current) => getNextFeaturedAnalysisIndex(current, items.length));
    }, AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [index, interactionPaused, items.length, pageVisible, prefersReducedMotion, restartToken]);

  const item = items[index % items.length];
  if (!item) return null;

  const selectItem = (nextIndex: number) => {
    setIndex(nextIndex);
    setRestartToken((current) => current + 1);
  };

  return (
    <section
      className="analysis-section"
      aria-roledescription={locale === "ru" ? "ротатор публикаций" : "publication rotator"}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Element | null;
        if (
          !nextTarget
          || !event.currentTarget.contains(nextTarget)
          || nextTarget.closest(".analysis-autoplay-toggle")
        ) setFocusWithin(false);
      }}
      onFocusCapture={(event) => {
        if (!(event.target as Element).closest(".analysis-autoplay-toggle")) setFocusWithin(true);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerCancel={() => setPointerActive(false)}
      onPointerDown={() => setPointerActive(true)}
      onPointerUp={() => setPointerActive(false)}
    >
      <div className="shell analysis-grid analysis-feature">
        <div className="analysis-feature-copy" key={item.content_id}>
          <p className="eyebrow">{locale === "ru" ? "Новая аналитика" : "Latest analysis"}</p>
          <h2>{item.title}</h2>
          <p className="analysis-feature-summary">{item.summary}</p>
          <Link className="text-link" href={item.href}>{locale === "ru" ? "Читать материал" : "Read publication"}<span>→</span></Link>
          {items.length > 1 && (
            <div className="analysis-controls">
              <div className="analysis-dots" aria-label={locale === "ru" ? "Выбор материала" : "Choose publication"}>
                {items.map((candidate, dotIndex) => (
                  <button
                    aria-label={candidate.title}
                    aria-pressed={dotIndex === index % items.length}
                    key={candidate.content_id}
                    onClick={() => selectItem(dotIndex)}
                    type="button"
                  />
                ))}
              </div>
              <button
                aria-pressed={userPaused}
                className="analysis-autoplay-toggle"
                onClick={() => setUserPaused((current) => !current)}
                type="button"
              >
                {userPaused ? (locale === "ru" ? "Продолжить" : "Continue") : (locale === "ru" ? "Пауза" : "Pause")}
              </button>
            </div>
          )}
        </div>
        {item.hero_image ? (
          <span className="analysis-feature-media" key={`${item.content_id}-media`}>
            <Image alt={item.hero_image.alt} fill priority sizes="(max-width: 800px) 100vw, 50vw" src={item.hero_image.src} />
          </span>
        ) : null}
      </div>
    </section>
  );
}

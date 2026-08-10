import Link from "next/link";
import type { Locale } from "@/lib/site-data";

const messages = {
  ru: { title: "Материалы проходят верификацию", text: "Этот раздел будет наполняться по мере готовности объектов, источников и проверенных публикаций. Каждый материал проходит путь от исследования до выпуска.", cta: "Вернуться на главную" },
  en: { title: "Materials are undergoing verification", text: "This section will be populated as objects, sources and verified publications become ready. Every piece of content travels from research through to release.", cta: "Return home" },
};

export function EmptyState({ locale, section }: { locale: Locale; section?: string }) {
  const m = messages[locale];
  return (
    <section className="empty-state" style={{ textAlign: "center", padding: "100px 24px", maxWidth: 520, marginInline: "auto" }}>
      <p className="eyebrow" style={{ marginBottom: 24, textAlign: "center" }}>
        VSL / {section?.toUpperCase() ?? "SECTION"}
      </p>
      <h2 style={{ marginBottom: 18, font: "500 clamp(28px,4vw,48px)/1.08 var(--font-playfair),Georgia,serif", letterSpacing: "-.03em" }}>
        {m.title}
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
        {m.text}
      </p>
      <Link className="text-link" href={`/${locale}`} style={{ marginTop: 32, display: "inline-flex" }}>
        {m.cta} <span>→</span>
      </Link>
    </section>
  );
}

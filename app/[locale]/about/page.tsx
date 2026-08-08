import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { copy, isLocale } from "@/lib/site-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = copy[locale].section.about;
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: page.title,
    description: page.text,
    alternates: {
      canonical: `/${locale}/about`,
      languages: { [locale]: `/${locale}/about`, [otherLocale]: `/${otherLocale}/about`, "x-default": "/ru/about" },
    },
  };
}

const aboutContent = {
  ru: {
    manifest: {
      title: "Манифест",
      text: "VANSMITHLAB — независимая энциклопедия дизайна и визуальной культуры. Мы строим долгосрочную публичную базу знаний, где источники важнее уверенного тона, а исправления — часть качества. Каждый материал строится вокруг объекта, утверждений, источников и связей. Статус достоверности, история обновлений и происхождение медиа всегда остаются видимыми.",
    },
    methodology: {
      title: "Методология",
      text: "Каждая публикация проходит путь от вопроса через исследование, проверку, установление связей и публикацию. AI собирает и сопоставляет первичные и независимые источники. Каждое существенное утверждение получает evidence, confidence и статус. Объект становится частью хронологии, словаря и сети связанных тем. Русский оригинал проходит выпуск, затем появляется английская адаптация.",
    },
    verification: {
      title: "Верификация",
      text: "Каждое утверждение в базе имеет verification state (verified, multi_source_verified, partially_verified), confidence score (0–1) и привязанные источники. Читатель видит эту информацию на странице каждого объекта через Trust Panel и панель источников. Материалы без достаточной проверки маркируются явно.",
    },
    corrections: {
      title: "Исправления",
      text: "Исправления — часть качества, а не признак ошибки. Каждое изменение объекта или публикации версионируется. История правок видна читателю. При обнаружении неточности мы выпускаем correction notice, обновляем связанные материалы и оповещаем подписчиков. Процесс исправлений автоматизирован, но решение о содержательной правке принимается редактором.",
    },
  },
  en: {
    manifest: {
      title: "Manifest",
      text: "VANSMITHLAB is an independent encyclopedia of design and visual culture. We are building a long-term public knowledge library where sources matter more than a confident tone and corrections are part of quality. Every publication begins with an object, claims, sources and relationships. Verification status, update history and media provenance remain visible.",
    },
    methodology: {
      title: "Methodology",
      text: "Every publication travels from question through research, verification, relationship mapping and release. AI collects and compares primary and independent sources. Every material claim receives evidence, confidence and a status. Each object joins a timeline, glossary and network of related subjects. The Russian master releases first, followed by an English editorial adaptation.",
    },
    verification: {
      title: "Verification",
      text: "Every claim in the knowledge base has a verification state (verified, multi_source_verified, partially_verified), a confidence score (0–1) and linked sources. Readers see this information on every object page through the Trust Panel and source sidebar. Insufficiently verified materials are explicitly marked.",
    },
    corrections: {
      title: "Corrections",
      text: "Corrections are part of quality, not a sign of error. Every object or publication change is versioned. Revision history is visible to the reader. When an inaccuracy is found, we issue a correction notice, update related materials and notify subscribers. The correction process is automated, but substantive editorial decisions are made by an editor.",
    },
  },
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = copy[locale].section.about;
  const content = aboutContent[locale];

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.text}</p>
        </div>
        <TrustPanel locale={locale} />
      </div>

      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "var(--line)", border: "1px solid var(--line)", marginTop: 60 }}>
        {[content.manifest, content.methodology, content.verification, content.corrections].map((section) => (
          <article key={section.title} style={{ background: "var(--paper)", padding: "32px 28px" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 500, letterSpacing: "-.03em" }}>{section.title}</h2>
            <p style={{ margin: 0, color: "#514d45", fontSize: 14, lineHeight: 1.7 }}>{section.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { isLocale } from "@/lib/site-data";

export async function generateStaticParams() {
  return ["ru", "en"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: locale === "ru" ? "Политика конфиденциальности" : "Privacy Policy",
    description:
      locale === "ru"
        ? "Как VANSMITHLAB обрабатывает данные посетителей и подписчиков."
        : "How VANSMITHLAB handles visitor and subscriber data.",
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { [locale]: `/${locale}/privacy`, [otherLocale]: `/${otherLocale}/privacy`, "x-default": "/ru/privacy" },
    },
  };
}

const content = {
  ru: {
    eyebrow: "Правовая информация",
    intro:
      "VANSMITHLAB — независимая база знаний о дизайне и визуальной культуре. Мы собираем минимум данных, необходимых для работы сайта, и не продаём их.",
    sections: [
      { title: "Какие данные мы обрабатываем", text: "При посещении сайта могут обрабатываться технические данные, необходимые для доставки страниц: IP-адрес, тип браузера и устройства, язык интерфейса, страницы запроса. Мы не требуем регистрацию для чтения публикаций и не собираем персональные данные без явного согласия." },
      { title: "Файлы cookie и аналитика", text: "Сайт может использовать минимальные cookie и сторонние сервисы аналитики и поисковой индексации для понимания, какие материалы востребованы. Вы можете отключить cookie в настройках браузера; доступ к публичным материалам от этого не зависит." },
      { title: "Социальные сети и внешние ссылки", text: "Материалы могут содержать ссылки на внешние источники (музеи, библиотеки, официальные сайты) и социальные платформы. Обработка данных на этих ресурсах регулируется их собственными политиками конфиденциальности." },
      { title: "Права на контент", text: "Тексты и оригинальные редакционные визуалы принадлежат VANSMITHLAB. Изображения, заимствованные у правообладателей, публикуются с атрибуцией и ссылкой на источник; права остаются у правообладателя. Копирование материалов без указания источника не допускается." },
      { title: "Контакты", text: "По вопросам обработки данных и прав на контент вы можете написать нам через форму или контакты, указанные на сайте. Мы отвечаем на запросы об удалении или исправлении данных в разумный срок." },
    ],
  },
  en: {
    eyebrow: "Legal information",
    intro:
      "VANSMITHLAB is an independent knowledge base on design and visual culture. We collect only the minimum data needed to run the site and never sell it.",
    sections: [
      { title: "What data we process", text: "Visiting the site may process technical data required to deliver pages: IP address, browser and device type, interface language and requested pages. We do not require registration to read publications and do not collect personal data without explicit consent." },
      { title: "Cookies and analytics", text: "The site may use minimal cookies and third-party analytics and search indexing services to understand which materials are useful. You can disable cookies in your browser settings; access to public content is not affected." },
      { title: "Social media and external links", text: "Materials may link to external sources (museums, libraries, official sites) and social platforms. Data processing on those resources is governed by their own privacy policies." },
      { title: "Content rights", text: "Texts and original editorial visuals belong to VANSMITHLAB. Images borrowed from rights holders are published with attribution and a source link; rights remain with the rights holder. Reproduction without attribution is not permitted." },
      { title: "Contact", text: "For data processing and content rights questions, contact us through the form or contacts listed on the site. We respond to deletion or correction requests within a reasonable time." },
    ],
  },
};

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = content[locale];

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{locale === "ru" ? "Политика конфиденциальности" : "Privacy Policy"}</h1>
          <p>{page.intro}</p>
        </div>
        <TrustPanel locale={locale} />
      </div>
      <div className="article-copy" style={{ maxWidth: 760, paddingTop: 40 }}>
        {page.sections.map((section) => (
          <section key={section.title} style={{ marginBottom: 36 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 26 }}>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
      </div>
    </section>
  );
}

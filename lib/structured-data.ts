export const siteUrl = "https://vansmithlab.com";
export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const pinterestUrl = "https://www.pinterest.com/van_smith_ai/";

export const entityDescriptions = {
  ru: "VANSMITHLAB — независимая двуязычная энциклопедия дизайна и визуальной культуры: архитектуры, моды, искусства, фотографии, типографики, материалов и технологий.",
  en: "VANSMITHLAB is an independent bilingual encyclopedia of design and visual culture covering architecture, fashion, art, photography, typography, materials and technology.",
} as const;

export const organizationStructuredData = {
  "@type": "Organization",
  "@id": organizationId,
  name: "VANSMITHLAB",
  alternateName: "VAN SMITH LAB",
  url: `${siteUrl}/`,
  description: entityDescriptions.en,
  sameAs: [pinterestUrl],
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/icon.svg`,
  },
  knowsAbout: [
    "Architecture",
    "Fashion design",
    "Art",
    "Photography",
    "Graphic design",
    "Typography",
    "Materials",
    "Design technology",
    "Visual culture",
  ],
} as const;

export function rootStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "VANSMITHLAB",
        alternateName: ["VAN SMITH LAB", "vansmithlab.com"],
        url: `${siteUrl}/`,
        description: entityDescriptions.en,
        inLanguage: ["ru", "en"],
        sameAs: [pinterestUrl],
        publisher: { "@id": organizationId },
      },
      organizationStructuredData,
    ],
  };
}

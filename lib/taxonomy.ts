// Taxonomy v2 — see VANSMITHLAB_OS/TAXONOMY.md.
//
// Three axes describe a subject: the discipline it belongs to, the kind of thing
// it is, and — when it is a person — the role they held. Sections are a query
// over these fields rather than a stored list, so adding one article with a new
// role is enough to make that section appear.

export const DISCIPLINES = [
  "architecture", "fashion", "art", "photography",
  "graphic-design", "product-design", "interior-design", "media-publishing",
  "materials", "technology",
] as const;

export const KINDS = [
  "person", "organization", "material-technique", "work",
  "movement-style", "place", "event-exhibition", "term", "theme",
] as const;

export type Discipline = (typeof DISCIPLINES)[number];
export type Kind = (typeof KINDS)[number];

export type RoleDef = {
  /** Controlled role term written into [ARTICLE_META]. */
  role: string;
  /** URL segment under /glossary/. */
  route: string;
  ru: string;
  en: string;
  descRu: string;
  descEn: string;
  /** Roles the site already renders from a dedicated page file. */
  hasStaticPage?: boolean;
};

// `fashion-designer` keeps the historical `designers` route so existing links
// and the page that already renders it continue to work.
export const ROLES: RoleDef[] = [
  { role: "architect", route: "architects", ru: "Архитекторы", en: "Architects",
    descRu: "Авторы, чей метод сформировал построенную среду — от частного дома до города.",
    descEn: "Authors whose method shaped the built environment, from the private house to the city." },
  { role: "fashion-designer", route: "designers", ru: "Модельеры", en: "Fashion designers",
    descRu: "Авторы одежды и творческие директора домов, изменившие язык моды.",
    descEn: "Authors of clothing and creative directors who changed the language of fashion.",
    hasStaticPage: true },
  { role: "artist", route: "artists", ru: "Художники", en: "Artists",
    descRu: "Художники, чьи методы и образы стали частью языка визуальной культуры.",
    descEn: "Artists whose methods and images became part of the language of visual culture.",
    hasStaticPage: true },
  { role: "photographer", route: "photographers", ru: "Фотографы", en: "Photographers",
    descRu: "Авторы фотографического изображения — редакционного, документального и авторского.",
    descEn: "Authors of the photographic image: editorial, documentary and authored.",
    hasStaticPage: true },
  { role: "art-director", route: "art-directors", ru: "Арт-директора", en: "Art directors",
    descRu: "Авторы редакционной формы: разворот, ритм страницы и визуальная логика издания.",
    descEn: "Authors of editorial form: the spread, the rhythm of the page, the logic of a publication." },
  { role: "graphic-designer", route: "graphic-designers", ru: "Графические дизайнеры", en: "Graphic designers",
    descRu: "Авторы идентичности, типографики, обложки и знака.",
    descEn: "Authors of identity, typography, the cover and the mark." },
  { role: "fashion-editor", route: "fashion-editors", ru: "Редакторы моды", en: "Fashion editors",
    descRu: "Редакторы, определявшие, что попадает на страницу и как это прочитывается.",
    descEn: "Editors who decided what reached the page and how it would be read." },
  { role: "stylist", route: "stylists", ru: "Стилисты", en: "Stylists",
    descRu: "Авторы образа в кадре и на показе.",
    descEn: "Authors of the look in the frame and on the runway." },
  { role: "curator", route: "curators", ru: "Кураторы", en: "Curators",
    descRu: "Авторы выставочных высказываний и институциональных программ.",
    descEn: "Authors of exhibition arguments and institutional programmes." },
  { role: "industrial-designer", route: "industrial-designers", ru: "Промышленные дизайнеры", en: "Industrial designers",
    descRu: "Авторы серийного предмета — от инструмента до мебели и техники.",
    descEn: "Authors of the serial object, from the tool to furniture and appliances." },
  { role: "interior-designer", route: "interior-designers", ru: "Дизайнеры интерьера", en: "Interior designers",
    descRu: "Авторы внутреннего пространства, света и сценария обитания.",
    descEn: "Authors of interior space, light and the scenario of inhabiting it." },
  { role: "illustrator", route: "illustrators", ru: "Иллюстраторы", en: "Illustrators",
    descRu: "Авторы рисованного изображения в моде, издании и рекламе.",
    descEn: "Authors of the drawn image in fashion, publishing and advertising." },
  { role: "critic-theorist", route: "critics-theorists", ru: "Критики и теоретики", en: "Critics and theorists",
    descRu: "Авторы, сформировавшие язык, которым дизайн описывает сам себя.",
    descEn: "Authors who shaped the language design uses to describe itself." },
];

export const roleByRoute = (route: string) => ROLES.find((r) => r.route === route);
export const sectionForRole = (role: string) => {
  const def = ROLES.find((r) => r.role === role);
  return def ? `glossary/${def.route}` : "glossary/people";
};

/** Content directories the taxonomy can produce, for lib/content.ts. */
export const GLOSSARY_SECTIONS = ROLES.map((r) => `glossary/${r.route}`);

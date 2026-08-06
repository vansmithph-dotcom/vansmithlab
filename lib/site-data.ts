export const locales = ["ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

type Copy = {
  nav: Array<{ href: string; label: string }>;
  search: string;
  language: string;
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  explore: string;
  methodology: string;
  trustTitle: string;
  trustText: string;
  fieldsTitle: string;
  fieldsText: string;
  processTitle: string;
  process: Array<{ number: string; title: string; text: string }>;
  analysisTitle: string;
  analysisEyebrow: string;
  analysisHeadline: string;
  analysisText: string;
  analysisLink: string;
  footerText: string;
  section: Record<string, { eyebrow: string; title: string; text: string; items: string[] }>;
  labels: {
    verified: string;
    confidence: string;
    reviewed: string;
    sources: string;
    related: string;
    comingSoon: string;
    read: string;
    viewAll: string;
  };
};

const sharedSections = {
  encyclopedia: ["Objects", "People", "Materials", "Techniques", "Movements", "Visual culture"],
  glossary: ["Silhouette", "Material", "Craft", "Visual identity", "Typography", "Construction"],
  articles: ["Research", "Case studies", "Visual analysis", "Guides"],
  analysis: ["Culture and dress", "Technology and form", "Identity and image", "Design and power"],
  timeline: ["Periods", "Movements", "Collections", "Key events"],
  collections: ["Design language", "Materials", "Image-making", "Design systems"],
  search: ["Fashion", "Architecture", "Photography", "Typography", "Materials", "Artificial intelligence"],
  about: ["Manifest", "Methodology", "Verification", "Corrections"],
};

export const copy: Record<Locale, Copy> = {
  ru: {
    nav: [
      { href: "/encyclopedia", label: "Энциклопедия" },
      { href: "/glossary", label: "Глоссарий" },
      { href: "/articles", label: "Статьи" },
      { href: "/analysis", label: "Анализ" },
      { href: "/timeline", label: "Хронология" },
    ],
    search: "Поиск по базе знаний",
    language: "EN",
    heroEyebrow: "Независимая база знаний о дизайне",
    heroTitle: "Дизайн — это система связей, а не поток изображений.",
    heroText:
      "VANSMITHLAB исследует моду, архитектуру, фотографию, типографику, материалы и технологии через проверяемые факты, визуальный анализ и культурный контекст.",
    explore: "Начать исследование",
    methodology: "Как мы работаем",
    trustTitle: "Знание, которому можно проследить путь",
    trustText:
      "Каждый материал строится вокруг объекта, утверждений, источников и связей. Статус достоверности, история обновлений и происхождение медиа всегда остаются видимыми.",
    fieldsTitle: "Поля исследования",
    fieldsText: "Единая энциклопедия для того, что обычно существует разрозненно.",
    processTitle: "От вопроса к опубликованному знанию",
    process: [
      { number: "01", title: "Исследование", text: "AI собирает и сопоставляет первичные и независимые источники." },
      { number: "02", title: "Проверка", text: "Каждое существенное утверждение получает evidence, confidence и статус." },
      { number: "03", title: "Связи", text: "Объект становится частью хронологии, словаря и сети связанных тем." },
      { number: "04", title: "Публикация", text: "Русский оригинал проходит выпуск, затем появляется английская адаптация." },
    ],
    analysisTitle: "Аналитика VANSMITHLAB",
    analysisEyebrow: "В разработке · авторский формат",
    analysisHeadline: "Как религия формирует язык модной одежды",
    analysisText:
      "Аналитические эссе — пространство для аргумента. Они всегда отделяют интерпретацию от фактов и возвращают читателя к источникам и объектам базы.",
    analysisLink: "О принципах аналитики",
    footerText: "Независимая энциклопедия дизайна и визуальной культуры.",
    section: {
      encyclopedia: { eyebrow: "База знаний", title: "Энциклопедия", text: "Люди, объекты, бренды, материалы, техники и движения — с источниками, хронологией и связями.", items: ["Бренды и студии", "Дизайнеры и авторы", "Материалы и техники", "Объекты и коллекции", "Движения и стили", "Технологии и AI"] },
      glossary: { eyebrow: "Язык дизайна", title: "Глоссарий", text: "Точные определения для понятий, которые связывают дисциплины дизайна.", items: ["Силуэт", "Материал", "Конструкция", "Визуальная идентичность", "Типографика", "Ремесло"] },
      "glossary/designers": { eyebrow: "Дизайнеры и авторы", title: "Дизайнеры и архитекторы", text: "Биографические и визуально-аналитические материалы об авторах, чей метод стал частью языка дизайна.", items: ["Мода", "Архитектура", "Промышленный дизайн"] },
      articles: { eyebrow: "Исследование", title: "Статьи", text: "Длинные тексты, которые объясняют предмет через проверяемые связи, а не через новостной шум.", items: ["Исследования", "Case studies", "Визуальный анализ", "Практические гиды"] },
      analysis: { eyebrow: "Аргумент", title: "Анализ", text: "Подписанные или атрибутированные эссе, где факты, интерпретация и мнение обозначены отдельно.", items: ["Культура и одежда", "Технология и форма", "Идентичность и образ", "Дизайн и власть"] },
      timeline: { eyebrow: "Время и контекст", title: "Хронология", text: "События, периоды и изменения, связанные с объектами и источниками базы.", items: ["Периоды", "Движения", "Коллекции", "Ключевые события"] },
      collections: { eyebrow: "Связанные знания", title: "Подборки", text: "Кураторские маршруты через объекты, темы, материалы и визуальные языки.", items: ["Язык дизайна", "Материалы", "Создание образа", "Системы дизайна"] },
      search: { eyebrow: "Найти в базе", title: "Поиск", text: "Ищите по словам или начните с дисциплины, времени, места, объекта или концепции.", items: ["Мода", "Архитектура", "Фотография", "Типографика", "Материалы", "Искусственный интеллект"] },
      about: { eyebrow: "О проекте", title: "Метод VANSMITHLAB", text: "Мы строим долгосрочную публичную базу знаний, где источники важнее уверенного тона, а исправления — часть качества.", items: ["Манифест", "Методология", "Верификация", "Исправления"] },
    },
    labels: { verified: "Проверка", confidence: "Уверенность", reviewed: "Обновлено", sources: "Источники", related: "Связанные темы", comingSoon: "Материалы проходят верификацию", read: "Открыть", viewAll: "Смотреть все" },
  },
  en: {
    nav: [
      { href: "/encyclopedia", label: "Encyclopedia" },
      { href: "/glossary", label: "Glossary" },
      { href: "/articles", label: "Articles" },
      { href: "/analysis", label: "Analysis" },
      { href: "/timeline", label: "Timeline" },
    ],
    search: "Search the knowledge base",
    language: "RU",
    heroEyebrow: "An independent design knowledge library",
    heroTitle: "Design is a system of connections, not a stream of images.",
    heroText:
      "VANSMITHLAB examines fashion, architecture, photography, typography, materials and technology through traceable facts, visual analysis and cultural context.",
    explore: "Start exploring",
    methodology: "Our method",
    trustTitle: "Knowledge with a visible trail",
    trustText:
      "Every publication begins with an object, claims, sources and relationships. Verification status, update history and media provenance remain visible.",
    fieldsTitle: "Fields of inquiry",
    fieldsText: "One encyclopedia for knowledge that is usually fragmented.",
    processTitle: "From question to published knowledge",
    process: [
      { number: "01", title: "Research", text: "AI collects and compares primary and independent sources." },
      { number: "02", title: "Verification", text: "Every material claim receives evidence, confidence and a status." },
      { number: "03", title: "Relationships", text: "Each object joins a timeline, glossary and network of related subjects." },
      { number: "04", title: "Publication", text: "The Russian master releases first, followed by an English editorial adaptation." },
    ],
    analysisTitle: "VANSMITHLAB analysis",
    analysisEyebrow: "In development · authorial format",
    analysisHeadline: "How religion shapes the language of fashionable dress",
    analysisText:
      "Analytical essays are a place for argument. They distinguish interpretation from fact and always return the reader to sources and underlying objects.",
    analysisLink: "About analytical writing",
    footerText: "An independent encyclopedia of design and visual culture.",
    section: {
      encyclopedia: { eyebrow: "Knowledge base", title: "Encyclopedia", text: "People, objects, brands, materials, techniques and movements — with sources, chronology and relations.", items: ["Brands and studios", "Designers and authors", "Materials and techniques", "Objects and collections", "Movements and styles", "Technology and AI"] },
      glossary: { eyebrow: "The language of design", title: "Glossary", text: "Precise definitions for concepts that connect design disciplines.", items: ["Silhouette", "Material", "Construction", "Visual identity", "Typography", "Craft"] },
      "glossary/designers": { eyebrow: "Designers and authors", title: "Designers and Architects", text: "Biographical and visual-analytical profiles of authors whose method became part of the language of design.", items: ["Fashion", "Architecture", "Industrial design"] },
      articles: { eyebrow: "Research", title: "Articles", text: "Long-form work that explains a subject through verified connections, rather than news noise.", items: ["Research", "Case studies", "Visual analysis", "Practical guides"] },
      analysis: { eyebrow: "Argument", title: "Analysis", text: "Signed or attributed essays where fact, interpretation and opinion are visibly distinct.", items: ["Culture and dress", "Technology and form", "Identity and image", "Design and power"] },
      timeline: { eyebrow: "Time and context", title: "Timeline", text: "Events, periods and change connected to the objects and sources in the knowledge base.", items: ["Periods", "Movements", "Collections", "Key events"] },
      collections: { eyebrow: "Connected knowledge", title: "Collections", text: "Curated routes through objects, themes, materials and visual languages.", items: ["Design language", "Materials", "Image-making", "Design systems"] },
      search: { eyebrow: "Find in the library", title: "Search", text: "Search by term or begin with a discipline, time, place, object or concept.", items: ["Fashion", "Architecture", "Photography", "Typography", "Materials", "Artificial intelligence"] },
      about: { eyebrow: "About", title: "The VANSMITHLAB method", text: "We are building a long-term public knowledge library where sources matter more than a confident tone and corrections are part of quality.", items: ["Manifest", "Methodology", "Verification", "Corrections"] },
    },
    labels: { verified: "Verification", confidence: "Confidence", reviewed: "Last reviewed", sources: "Sources", related: "Related subjects", comingSoon: "Materials are undergoing verification", read: "Open", viewAll: "View all" },
  },
};

export const fields: Record<Locale, Array<{ title: string; text: string; href: string }>> = {
  ru: [
    { title: "Мода и костюм", text: "Одежда, коллекции, силуэты, ремесло и культурный контекст.", href: "/encyclopedia" },
    { title: "Изображение", text: "Фотография, art direction, журналы, кино и визуальные системы.", href: "/articles" },
    { title: "Предмет и пространство", text: "Архитектура, интерьеры, мебель, материалы и производство.", href: "/collections" },
    { title: "Технология", text: "Инструменты, AI, процессы и их влияние на язык дизайна.", href: "/glossary" },
  ],
  en: [
    { title: "Fashion and dress", text: "Garments, collections, silhouettes, craft and cultural context.", href: "/encyclopedia" },
    { title: "The image", text: "Photography, art direction, magazines, film and visual systems.", href: "/articles" },
    { title: "Object and space", text: "Architecture, interiors, furniture, materials and production.", href: "/collections" },
    { title: "Technology", text: "Tools, AI, processes and their effect on design language.", href: "/glossary" },
  ],
};

export const objectSamples = [
  { slug: "bauhaus", type: { ru: "Движение", en: "Movement" }, title: { ru: "Баухаус", en: "Bauhaus" }, summary: { ru: "Демонстрационный объект будущей энциклопедии: источники и claims будут добавлены через knowledge engine.", en: "A demonstration object for the future encyclopedia: sources and claims will be added through the knowledge engine." } },
  { slug: "material", type: { ru: "Глоссарий", en: "Glossary" }, title: { ru: "Материал", en: "Material" }, summary: { ru: "Термин, который связывает форму, технологию, происхождение и ощущение объекта.", en: "A term that connects an object’s form, technology, provenance and sensory quality." } },
  { slug: "visual-identity", type: { ru: "Понятие", en: "Concept" }, title: { ru: "Визуальная идентичность", en: "Visual identity" }, summary: { ru: "Система признаков, через которую организация или проект становятся узнаваемыми.", en: "A system of signs through which an organization or project becomes recognizable." } },
] as const;

export const sectionKeys = Object.keys(sharedSections);

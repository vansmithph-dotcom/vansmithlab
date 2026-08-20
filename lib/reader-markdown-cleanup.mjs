const SERVICE_LINE = /^(?:placement|caption_note|format|asset|caption_required|alt_required|rights(?:_status)?):\s*/i;
const CLAIM_MARKER = /\[\^[A-Za-z0-9_-]+\]/g;

const TEMPLATE_HEADINGS = {
  ru: new Map([
    ["Editorial thesis", "Редакционный тезис"],
    ["Reader question", "Вопрос читателя"],
    ["Short answer", "Короткий ответ"],
    ["Sources", "Источники"],
    ["See also", "По теме"],
    ["Р РµРґР°РєС†РёРѕРЅРЅС‹Р№ С‚РµР·РёСЃ", "Редакционный тезис"],
    ["Р’РѕРїСЂРѕСЃ С‡РёС‚Р°С‚РµР»СЏ", "Вопрос читателя"],
    ["РљРѕСЂРѕС‚РєРёР№ РѕС‚РІРµС‚", "Короткий ответ"],
    ["РСЃС‚РѕС‡РЅРёРєРё", "Источники"],
  ]),
  en: new Map([
    ["Редакционный тезис", "Editorial thesis"],
    ["Вопрос читателя", "Reader question"],
    ["Короткий ответ", "Short answer"],
    ["Краткий ответ", "Short answer"],
    ["Источники", "Sources"],
    ["По теме", "See also"],
  ]),
};

function localizeTemplateHeading(line, locale) {
  const translations = TEMPLATE_HEADINGS[locale];
  if (!translations) return line;
  const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
  if (!match) return line;
  const translated = translations.get(match[2]);
  return translated ? `${match[1]} ${translated}` : line;
}

export function cleanReaderMarkdown(input, locale) {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const output = [];

  for (const originalLine of lines) {
    const line = localizeTemplateHeading(
      originalLine.replace(/^(#{1,6})\s+#{1,6}\s+/, "$1 "),
      locale,
    );
    if (!SERVICE_LINE.test(line.trim())) {
      output.push(line);
      continue;
    }

    const markers = line.match(CLAIM_MARKER) ?? [];
    if (markers.length === 0) continue;

    let target = output.length - 1;
    while (target >= 0 && output[target].trim() === "") target -= 1;
    if (target >= 0) {
      const missing = markers.filter((marker) => !output[target].includes(marker));
      output[target] += missing.join("");
    }
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

import assert from "node:assert/strict";
import test from "node:test";
import { cleanReaderMarkdown } from "../lib/reader-markdown-cleanup.mjs";

test("removes a duplicated Markdown heading marker", () => {
  assert.equal(cleanReaderMarkdown("## ## Редакционный тезис\n"), "## Редакционный тезис\n");
});

test("removes media-brief lines and preserves their claim marker", () => {
  const input = [
    "Текст утверждения.",
    "",
    "placement: sec-1|format: full-width 16:9|asset: test",
    "",
    "caption_note: служебная заметка.[^clm_surface]",
    "",
    "## Раздел",
    "",
  ].join("\n");
  assert.equal(cleanReaderMarkdown(input), "Текст утверждения.[^clm_surface]\n\n## Раздел\n");
});

test("removes concatenated legacy media instructions", () => {
  const input = "Абзац.\n\nplacement: after-sectionformat: inline 4:5caption_required: yesalt_required: yesrights: permission-required\n";
  assert.equal(cleanReaderMarkdown(input), "Абзац.\n");
});

test("localizes exact English template headings in Russian reader Markdown", () => {
  const input = "## Editorial thesis\n\n## Reader question\n\n## Short answer\n";
  assert.equal(
    cleanReaderMarkdown(input, "ru"),
    "## Редакционный тезис\n\n## Вопрос читателя\n\n## Короткий ответ\n",
  );
});

test("repairs the known double-decoded Russian template headings", () => {
  const input = [
    "## Р РµРґР°РєС†РёРѕРЅРЅС‹Р№ С‚РµР·РёСЃ",
    "",
    "## Р’РѕРїСЂРѕСЃ С‡РёС‚Р°С‚РµР»СЏ",
    "",
    "## РљРѕСЂРѕС‚РєРёР№ РѕС‚РІРµС‚",
    "",
    "## РСЃС‚РѕС‡РЅРёРєРё",
    "",
  ].join("\n");
  assert.equal(
    cleanReaderMarkdown(input, "ru"),
    "## Редакционный тезис\n\n## Вопрос читателя\n\n## Короткий ответ\n\n## Источники\n",
  );
});

test("localizes exact Russian template headings in English reader Markdown", () => {
  const input = "## Редакционный тезис\n\n## Вопрос читателя\n\n## Короткий ответ\n";
  assert.equal(
    cleanReaderMarkdown(input, "en"),
    "## Editorial thesis\n\n## Reader question\n\n## Short answer\n",
  );
});

import test from "node:test";
import assert from "node:assert/strict";
import { sourceDisplayMeta, sourceDisplayTitle, uniqueSourcesByUrl } from "../lib/source-display.mjs";

test("turns a domain-only source title into a distinct path label", () => {
  assert.equal(
    sourceDisplayTitle({ title: "www.vitsoe.com", url: "https://www.vitsoe.com/gb/606/structures" }),
    "vitsoe.com — 606 / structures",
  );
});

test("keeps a meaningful editorial source title", () => {
  assert.equal(
    sourceDisplayTitle({ title: "606 Universal Shelving System", url: "https://www.vitsoe.com/eu/606" }),
    "606 Universal Shelving System",
  );
});

test("omits an empty source metadata line", () => {
  assert.equal(sourceDisplayMeta({}), "");
  assert.equal(sourceDisplayMeta({ publisher: "Vitsoe", accessed_at: "2026-08-18" }), "Vitsoe · 2026-08-18");
});

test("deduplicates exact source URLs while preserving order", () => {
  const sources = [
    { id: "one", title: "First", url: "https://example.com/history/" },
    { id: "two", title: "Duplicate", url: "https://example.com/history" },
    { id: "three", title: "Other", url: "https://example.com/archive" },
  ];
  assert.deepEqual(uniqueSourcesByUrl(sources).map((source) => source.id), ["one", "three"]);
});

test("does not merge case-sensitive paths or distinct queries", () => {
  const sources = [
    { id: "upper", url: "https://EXAMPLE.com/Archive" },
    { id: "lower", url: "https://example.com/archive" },
    { id: "query-one", url: "https://example.com/archive?page=1" },
    { id: "query-two", url: "https://example.com/archive?page=2" },
  ];
  assert.deepEqual(uniqueSourcesByUrl(sources).map((source) => source.id), [
    "upper",
    "lower",
    "query-one",
    "query-two",
  ]);
});

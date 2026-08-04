import test from "node:test";
import assert from "node:assert/strict";
import { validateKnowledge } from "../scripts/automation/validate.mjs";

const validObject = () => ({
  id: "obj_test", canonical_locale: "ru", revision: 1, verification_state: "verified", confidence_score: 0.9,
  sources: [
    { id: "src_primary", title: "Primary", url: "https://example.org/primary" },
    { id: "src_independent", title: "Independent", url: "https://example.edu/independent" }
  ],
  claims: [{ id: "clm_test", wording_ru: "Проверяемое утверждение", verification_state: "verified", confidence_score: 0.9 }],
  citations: [{ id: "cit_test", claim_id: "clm_test", source_id: "src_primary", locator: "Section 1" }],
  contradictions: []
});

test("accepts a knowledge object above the publication threshold", () => {
  assert.equal(validateKnowledge(validObject()), true);
});

test("rejects a material claim below 0.85", () => {
  const object = validObject();
  object.claims[0].confidence_score = 0.84;
  assert.throws(() => validateKnowledge(object), /below threshold/);
});

test("rejects a claim without a citation", () => {
  const object = validObject();
  object.citations = [];
  assert.throws(() => validateKnowledge(object), /missing citation/);
});

test("rejects an active high-grade contradiction", () => {
  const object = validObject();
  object.contradictions = [{ active: true, grade: "high" }];
  assert.throws(() => validateKnowledge(object), /contradiction/);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  canAdvanceFeaturedAnalysis,
  getNextFeaturedAnalysisIndex,
} from "../lib/featured-analysis-rotation.mjs";

test("advances to the next publication and wraps after the last one", () => {
  assert.equal(getNextFeaturedAnalysisIndex(0, 5), 1);
  assert.equal(getNextFeaturedAnalysisIndex(4, 5), 0);
});

test("advances automatically only while the rotator is visible and idle", () => {
  const ready = {
    itemCount: 5,
    prefersReducedMotion: false,
    interactionPaused: false,
    pageVisible: true,
  };

  assert.equal(canAdvanceFeaturedAnalysis(ready), true);
  assert.equal(canAdvanceFeaturedAnalysis({ ...ready, itemCount: 1 }), false);
  assert.equal(canAdvanceFeaturedAnalysis({ ...ready, prefersReducedMotion: true }), true);
  assert.equal(canAdvanceFeaturedAnalysis({ ...ready, interactionPaused: true }), false);
  assert.equal(canAdvanceFeaturedAnalysis({ ...ready, pageVisible: false }), false);
});

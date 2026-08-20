/**
 * @param {number} currentIndex
 * @param {number} itemCount
 */
export function getNextFeaturedAnalysisIndex(currentIndex, itemCount) {
  if (itemCount < 1) return 0;
  return (currentIndex + 1) % itemCount;
}

/**
 * @param {{
 *   itemCount: number;
 *   prefersReducedMotion: boolean;
 *   interactionPaused: boolean;
 *   pageVisible: boolean;
 * }} state
 */
export function canAdvanceFeaturedAnalysis({
  itemCount,
  interactionPaused,
  pageVisible,
}) {
  return itemCount > 1 && !interactionPaused && pageVisible;
}

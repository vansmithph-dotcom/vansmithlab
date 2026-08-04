import type { Locale } from "@/lib/site-data";
import { copy } from "@/lib/site-data";

export function TrustPanel({ locale }: { locale: Locale }) {
  const labels = copy[locale].labels;
  return (
    <aside className="trust-panel" aria-label={labels.verified}>
      <div><span>{labels.verified}</span><strong>{labels.comingSoon}</strong></div>
      <div><span>{labels.confidence}</span><strong>—</strong></div>
      <div><span>{labels.reviewed}</span><strong>—</strong></div>
    </aside>
  );
}

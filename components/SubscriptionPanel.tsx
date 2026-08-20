import type { Locale } from "@/lib/site-data";

export function SubscriptionPanel({ locale }: { locale: Locale }) {
  return (
    <section className="subscription-panel" aria-labelledby="subscription-title">
      <div>
        <p className="eyebrow">{locale === "ru" ? "Подписка без слежения" : "Tracking-free subscription"}</p>
        <h2 id="subscription-title">{locale === "ru" ? "Новые материалы и подборки" : "New materials and collections"}</h2>
      </div>
      <div>
        <p>{locale === "ru" ? "Добавьте ленту в любой RSS/Atom‑ридер: новые публикации появятся автоматически, без передачи email и профилирования." : "Add a feed to any RSS/Atom reader: new publications arrive automatically, without sharing an email address or being profiled."}</p>
        <div className="subscription-actions">
          <a className="button button-dark" href="/feed.xml">{locale === "ru" ? "Все новые материалы" : "All new materials"}<span>↗</span></a>
          <a className="text-link" href="/collections.xml">{locale === "ru" ? "Только подборки" : "Collections only"}<span>→</span></a>
        </div>
      </div>
    </section>
  );
}

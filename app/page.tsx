import Link from "next/link";

export default function EntryPage() {
  return (
    <main className="entry-page">
      <p className="entry-mark">VANSMITHLAB®</p>
      <h1>Independent design knowledge library</h1>
      <div className="entry-links">
        <Link href="/ru">Русский</Link>
        <Link href="/en">English</Link>
      </div>
    </main>
  );
}

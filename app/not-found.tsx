import Link from "next/link";

export default function NotFound() {
  return <main className="entry-page"><p className="entry-mark">VANSMITHLAB®</p><h1>Page not found</h1><div className="entry-links"><Link href="/ru">Русский</Link><Link href="/en">English</Link></div></main>;
}

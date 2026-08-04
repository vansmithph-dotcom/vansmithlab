import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vansmithlab.com"),
  title: { default: "VANSMITHLAB — Design Knowledge Library", template: "%s — VANSMITHLAB" },
  description: "An independent, bilingual encyclopedia of design and visual culture.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  alternates: { canonical: "/ru" },
  openGraph: {
    type: "website",
    siteName: "VANSMITHLAB",
    title: "VANSMITHLAB — Design Knowledge Library",
    description: "A bilingual encyclopedia of design and visual culture.",
    images: [{ url: "/og.png", width: 1736, height: 908, alt: "VANSMITHLAB — Design Knowledge Library" }],
  },
  twitter: { card: "summary_large_image", title: "VANSMITHLAB — Design Knowledge Library", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}

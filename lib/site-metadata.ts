import type { Metadata } from "next";
import { entityDescriptions } from "@/lib/structured-data";

export const siteMetadata: Metadata = {
  metadataBase: new URL("https://vansmithlab.com"),
  applicationName: "VANSMITHLAB",
  title: { default: "VANSMITHLAB — Independent Encyclopedia of Design and Visual Culture", template: "%s — VANSMITHLAB" },
  description: entityDescriptions.en,
  authors: [{ name: "VANSMITHLAB", url: "https://vansmithlab.com/en/about/" }],
  creator: "VANSMITHLAB",
  publisher: "VANSMITHLAB",
  category: "Design and visual culture",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  alternates: { canonical: "/ru", languages: { ru: "/ru", en: "/en", "x-default": "/ru" } },
  openGraph: {
    type: "website",
    siteName: "VANSMITHLAB",
    title: "VANSMITHLAB — Independent Encyclopedia of Design and Visual Culture",
    description: entityDescriptions.en,
    images: [{ url: "/og.png", width: 1736, height: 908, alt: "VANSMITHLAB — independent encyclopedia of design and visual culture" }],
  },
  twitter: { card: "summary_large_image", title: "VANSMITHLAB — Independent Encyclopedia of Design and Visual Culture", description: entityDescriptions.en, images: ["/og.png"] },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

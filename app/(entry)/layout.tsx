import "../globals.css";
import { fontVariables } from "@/app/fonts";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = {
  ...siteMetadata,
  alternates: {
    canonical: "/",
    languages: { ru: "/ru", en: "/en", "x-default": "/" },
  },
};

export default function EntryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html className={fontVariables} lang="ru"><body>{children}</body></html>;
}

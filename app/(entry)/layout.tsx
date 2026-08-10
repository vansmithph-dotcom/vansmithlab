import "../globals.css";
import { fontVariables } from "@/app/fonts";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = siteMetadata;

export default function EntryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html className={fontVariables} lang="ru"><body>{children}</body></html>;
}

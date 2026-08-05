import "../globals.css";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = siteMetadata;

export default function EntryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}

import type { Metadata } from "next";

import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Main from "@/components/layout/Main";
import Shell from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "VAN SMITH LAB",
  description: "Independent Knowledge Library of Contemporary Visual Culture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Shell>
          <Header />
          <Main>{children}</Main>
          <Footer />
        </Shell>
      </body>
    </html>
  );
}
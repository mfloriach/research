import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { cache } from "react";
import { argument as argumentFallback } from "@/db/nuclear";
import { getContentFromDb } from "@/lib/content-db";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteNavbar } from "@/components/site-navbar";
import { site } from "@/db/nuclear";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * The dossier argument, shared by metadata and the breadcrumb root.
 *
 * `cache` dedupes the read so a single request performs one Mongo query even
 * though both the metadata and the layout need it.
 */
const loadArgument = cache(async () => {
  try {
    const { argument } = await getContentFromDb();
    return argument;
  } catch {
    return argumentFallback;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const argument = await loadArgument();
  return { title: argument.title, description: argument.description };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const argument = await loadArgument();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteNavbar
          brand={site.brand}
          search={site.search}
          avatar={site.avatar}
        />
        <div className="mx-12">
          <Breadcrumbs topic={argument.title} />
        </div>
        {children}
      </body>
    </html>
  );
}

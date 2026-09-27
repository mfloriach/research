import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site as siteFallback } from "@/lib/content";
import { getContentFromDb } from "@/lib/content-db";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { site } = await getContentFromDb();
    return { title: site.title, description: site.description };
  } catch {
    return { title: siteFallback.title, description: siteFallback.description };
  }
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

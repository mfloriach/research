import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { argument as argumentFallback } from "@/db/content";
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
    const { argument } = await getContentFromDb();
    return { title: argument.title, description: argument.description };
  } catch {
    return { title: argumentFallback.title, description: argumentFallback.description };
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

import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wellness — Your daily companion",
    template: "%s | Wellness",
  },
  description:
    "Personalized wellness ecosystem: fitness planning, hydration, gratitude journaling and mindfulness, plus a shop for custom wellness products.",
  openGraph: {
    type: "website",
    siteName: "Wellness",
    title: "Wellness — Your daily companion",
    description:
      "Personalized wellness ecosystem: fitness planning, hydration, gratitude journaling and mindfulness.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wellness — Your daily companion",
    description:
      "Personalized wellness ecosystem: fitness planning, hydration, gratitude journaling and mindfulness.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}

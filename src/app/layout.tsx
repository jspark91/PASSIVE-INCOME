import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StructuredData } from "@/components/StructuredData";
import {
  getSiteUrl,
  instagramProfileUrl,
  siteAlternateNames,
  siteDescription,
  siteName
} from "@/lib/site";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Seoul Tattoo Booking`,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "ETHNIC HOUSE",
    "ETHNIC HOUSE SILLIM",
    "ETHNIC_HOUSE_SILLIM",
    "에스닉하우스",
    "에스닉하우스 신림",
    "신림 에스닉하우스",
    "에스닉하우스 타투",
    "Seoul tattoo",
    "서울 타투",
    "신림 타투",
    "Sillim tattoo",
    "Korea tattoo booking",
    "English tattoo Seoul",
    "fine line tattoo Seoul",
    "lettering tattoo Seoul"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${siteName} SILLIM | 에스닉하우스 신림`,
    description: siteDescription,
    siteName
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} SILLIM | 에스닉하우스 신림`,
    description: siteDescription
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  other: {
    "instagram:profile": instagramProfileUrl,
    "business:alternate_name": siteAlternateNames.join(", ")
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <StructuredData />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

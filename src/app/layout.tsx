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
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

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
    "ETHNIC HOUSE SEOUL",
    "ETHNIC HOUSE SILLIM",
    "ETHNIC_HOUSE_SILLIM",
    "Seoul tattoo",
    "Sillim tattoo",
    "Korea tattoo booking",
    "English tattoo Seoul",
    "fine line tattoo Seoul",
    "lettering tattoo Seoul",
    "blackwork tattoo Seoul"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${siteName} SEOUL | Seoul Tattoo Booking`,
    description: siteDescription,
    siteName
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} SEOUL | Seoul Tattoo Booking`,
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
    "business:alternate_name": siteAlternateNames.join(", "),
    ...(googleSiteVerification ? { "google-site-verification": googleSiteVerification } : {})
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

import { getSiteUrl, instagramProfileUrl, siteAlternateNames, siteDescription, siteName } from "@/lib/site";

export function StructuredData() {
  const siteUrl = getSiteUrl();
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      alternateName: siteAlternateNames,
      url: siteUrl,
      description: siteDescription,
      inLanguage: ["en", "ko"],
      sameAs: [instagramProfileUrl]
    },
    {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
      "@id": `${siteUrl}/#business`,
      name: siteName,
      alternateName: siteAlternateNames,
      url: siteUrl,
      description: siteDescription,
      sameAs: [instagramProfileUrl],
      areaServed: [
        {
          "@type": "City",
          name: "Seoul"
        },
        {
          "@type": "Place",
          name: "Sillim"
        }
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sillim",
        addressRegion: "Seoul",
        addressCountry: "KR"
      }
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

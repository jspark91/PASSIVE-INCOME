import type { SeoPage } from "@/lib/seo-pages";
import { getSiteUrl, instagramProfileUrl, siteDescription, siteName } from "@/lib/site";

type SeoJsonLdProps = {
  page: SeoPage;
};

export function SeoJsonLd({ page }: SeoJsonLdProps) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${page.slug}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
      "@id": `${siteUrl}/#business`,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      sameAs: [instagramProfileUrl],
      areaServed: {
        "@type": "City",
        name: "Seoul"
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sillim",
        addressRegion: "Seoul",
        addressCountry: "KR"
      },
      makesOffer: {
        "@type": "Offer",
        name: page.h1,
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
          description: page.price
        },
        url: pageUrl
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.h1,
          item: pageUrl
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a
        }
      }))
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

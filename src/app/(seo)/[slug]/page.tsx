import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getArtists, getFlashDesigns } from "@/lib/data";
import { getSeoPageBySlug, seoPages } from "@/lib/seo-pages";

type SeoPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPageBySlug(slug);

  if (!page) {
    return {
      title: "ETHNIC HOUSE SEOUL"
    };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      images: ["/images/artists/yoonseul/yoonseul-03-moon-whale.jpg"]
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/images/artists/yoonseul/yoonseul-03-moon-whale.jpg"]
    }
  };
}

export default async function DynamicSeoLandingPage({ params }: SeoPageProps) {
  const { slug } = await params;
  const page = getSeoPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);

  return <SeoLandingPage page={page} artists={artists} designs={designs} />;
}

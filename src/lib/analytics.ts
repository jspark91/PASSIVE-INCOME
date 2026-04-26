export function getAnalyticsIds() {
  return {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID
  };
}


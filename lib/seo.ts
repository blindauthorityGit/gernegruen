import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://gernegruen.de"),
);

const defaultImage = "/images/og-gernegruen.svg";
const siteName = "GerneGrün";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultImage,
  keywords = [],
  noIndex = false,
}: PageSeo): Metadata {
  const url = new URL(path, siteUrl);
  const imageUrl = new URL(image, siteUrl);

  return {
    metadataBase: siteUrl,
    title,
    description,
    keywords: ["GerneGrün", "Lebensmittelgeschäft", "Dreieich", ...keywords],
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName,
      title,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${siteName} – ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: `${siteName} – ${title}` }],
    },
  };
}

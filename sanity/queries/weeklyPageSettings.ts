import {defineQuery} from "next-sanity";

export const WEEKLY_PAGE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_id == "weeklyPageSettings" && _type == "weeklyPageSettings"][0] {
    seoTitle, seoDescription, seoKeywords, heroTitle, heroDescription,
    "heroIllustrationSrc": heroIllustration.asset->url, heroIllustrationAlt,
    jumpLinkFresh, jumpLinkBakery, jumpLinkPrices, jumpLinkPromotions,
    produceHeading, produceDescription, produceEmptyMessage,
    bakeryHeading, bakeryDescription, priceListHeading, priceListDescription,
    preorderEyebrow, preorderHeading, preorderDescription, preorderButtonLabel,
    promotionsHeading, promotionsDescription, promotionsEmptyHeading, promotionsEmptyDescription,
    promotionSheets[]{_key, isEnabled, title, description, validFrom, validUntil, dateRange, "pdfUrl": pdf.asset->url}
  }
`);

export type WeeklyPageSettings = {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  heroTitle?: string;
  heroDescription?: string;
  heroIllustrationSrc?: string;
  heroIllustrationAlt?: string;
  jumpLinkFresh?: string;
  jumpLinkBakery?: string;
  jumpLinkPrices?: string;
  jumpLinkPromotions?: string;
  produceHeading?: string;
  produceDescription?: string;
  produceEmptyMessage?: string;
  bakeryHeading?: string;
  bakeryDescription?: string;
  priceListHeading?: string;
  priceListDescription?: string;
  preorderEyebrow?: string;
  preorderHeading?: string;
  preorderDescription?: string;
  preorderButtonLabel?: string;
  promotionsHeading?: string;
  promotionsDescription?: string;
  promotionsEmptyHeading?: string;
  promotionsEmptyDescription?: string;
  promotionSheets?: Array<{_key: string; isEnabled?: boolean; title: string; description?: string; validFrom: string; validUntil: string; dateRange: string; pdfUrl?: string}>;
} | null;

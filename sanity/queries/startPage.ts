import {defineQuery} from "next-sanity"

export const START_HERO_QUERY = defineQuery(/* groq */ `
  *[_id == "startPage"][0].hero {
    headlineLine1,
    headlineLine2,
    description,
    primaryCta {label, href},
    secondaryCta {label, href},
    "imageUrl": image.asset->url,
    imageAlt
  }
`)

export const START_PAGE_CONTENT_QUERY = defineQuery(/* groq */ `
  *[_id == "startPage"][0] {
    seoTitle,
    seoDescription,
    seoKeywords,
    "hero": hero {
      headlineLine1,
      headlineLine2,
      description,
      primaryCta {label, href},
      secondaryCta {label, href},
      "imageUrl": image.asset->url,
      imageAlt
    },
  }
`)

export const STORE_INTRO_QUERY = defineQuery(/* groq */ `
  *[_id == "storeIntroSettings" && _type == "storeIntroSettings"][0].content {
    headingLine1,
    headingLine2,
    description,
    imageAlt,
    "imageUrl": image.asset->url,
    parkingText,
    highlights[]{_key, title, description},
    categories[]{_key, title, icon},
    cta {label, href}
  }
`)


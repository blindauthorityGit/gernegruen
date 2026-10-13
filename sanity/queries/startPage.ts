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
    "hero": hero {
      headlineLine1,
      headlineLine2,
      description,
      primaryCta {label, href},
      secondaryCta {label, href},
      "imageUrl": image.asset->url,
      imageAlt
    },
    storeIntroSection {
      headingLine1,
      headingLine2,
      description,
      imageAlt,
      parkingText,
      highlights[]{_key, title, description},
      categories[]{_key, title, icon},
      cta {label, href}
    }
  }
`)

export const START_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "startPage"][0] {
    hero,
    currentContentSection {
      heading,
      intro,
      "cta": sectionCta,
      "items": selectedItems[]->[
        isActive != false &&
        (!defined(startDate) || startDate <= now()) &&
        (!defined(endDate) || endDate >= now())
      ] {
        "id": _id,
        title,
        description,
        "category": contentCategory->{
          title,
          shortLabel,
          styleVariant
        },
        image,
        imageAlt,
        "cta": {
          "label": ctaLabel,
          "href": ctaHref
        }
      }
    }
  }
`)

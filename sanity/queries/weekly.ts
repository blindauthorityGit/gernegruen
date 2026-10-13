import { defineQuery } from "next-sanity";

export const CURRENT_WEEKLY_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "weeklyOverview" && isEnabled == true && validFrom <= now() && validUntil > now()]
    | order(validFrom desc, _id asc)[0] {
      week,
      year,
      dateRange,
      produceGroups[] {
        _key,
        title,
        items[] { _key, name, note }
      },
      bakeryHighlights[] {
        title,
        name,
        description,
        price,
        "image": {
          "src": image.asset->url,
          "alt": imageAlt
        }
      },
      "bakeryCategories": bakeryCatalog->categories[] {
        _key,
        title,
        products[] { _key, name, price, note }
      },
      "promotionSheet": promotionSheet-> {
        title,
        description,
        "validLabel": dateRange,
        "pdfUrl": pdf.asset->url
      }
    }
`);

export const CURRENT_WEEKLY_PRODUCE_LIST_QUERY = defineQuery(/* groq */ `
  *[
    _type == "weeklyProduceList" &&
    week == $week &&
    year == $year &&
    isArchived != true
  ] | order(_updatedAt desc, _id asc)[0] {
    week,
    year,
    products[] {
      _key,
      name,
      unit,
      unitKind,
      price,
      brand,
      originalBrandMarker,
      origin,
      originRegion,
      certification,
      bioStatus,
      bioladenCertified,
      order,
      categoryOverride
    }
  }
`);

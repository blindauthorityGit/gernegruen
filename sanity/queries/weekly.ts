import { defineQuery } from "next-sanity";

export const CURRENT_BAKERY_CATALOG_QUERY = defineQuery(/* groq */ `
  *[_type == "bakeryCatalog" && _id == "bakeryCatalog-main"][0] {
    _id,
    breadCategories[] {
      _key,
      title,
      products[] { _key, name, price, note }
    },
    sweetCategories[] {
      _key,
      title,
      products[] { _key, name, price, note }
    },
  }
`);

export const CURRENT_PROMOTION_SHEETS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "promotionSheet" &&
    isEnabled != false &&
    validFrom <= string::split(now(), "T")[0] &&
    validUntil >= string::split(now(), "T")[0] &&
    defined(pdf.asset->url)
  ] | order(validFrom desc, _createdAt desc) {
    _id,
    title,
    description,
    "validLabel": dateRange,
    "pdfUrl": pdf.asset->url
  }
`);

export const CURRENT_WEEKLY_PRODUCE_LIST_QUERY = defineQuery(/* groq */ `
  *[
    _type == "weeklyProduceList" &&
    isArchived != true &&
    isEnabled != false
  ] | order(_updatedAt desc, _id asc)[0] {
    _id,
    _type,
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
      order,
      categoryOverride,
      "category": category->{_id, title, sortOrder, showInHomepageTeaser}
    }
  }
`);

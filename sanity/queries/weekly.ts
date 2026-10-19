import { defineQuery } from "next-sanity";

export const CURRENT_WEEKLY_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "weeklyOverview" && isEnabled == true && validFrom <= now() && validUntil > now()]
    | order(validFrom desc, _id asc)[0] {
      _id,
      _type,
      week,
      year,
      dateRange,
      produceGroups[] {
        _key,
        title,
        items[] { _key, name, note }
      },
      bakeryHighlights[] {
        _key,
        title,
        name,
        description,
        price,
        "image": {
          "src": image.asset->url,
          "alt": imageAlt
        }
      },
      "bakeryCatalogId": bakeryCatalog->_id,
      "bakeryCategories": bakeryCatalog->categories[] {
        _key,
        title,
        products[] { _key, name, price, note }
      },
      "promotionSheets": select(
        count(promotionSheets[_ref]) > 0 => (promotionSheets[]->)[
          isEnabled != false &&
          validFrom <= string::split(now(), "T")[0] &&
          validUntil >= string::split(now(), "T")[0]
        ]{
          _id, title, description, "validLabel": dateRange, "pdfUrl": pdf.asset->url
        },
        defined(promotionSheet) &&
        promotionSheet->isEnabled != false &&
        promotionSheet->validFrom <= string::split(now(), "T")[0] &&
        promotionSheet->validUntil >= string::split(now(), "T")[0] => [promotionSheet->{
          _id, title, description, "validLabel": dateRange, "pdfUrl": pdf.asset->url
        }],
        []
      ),
      "promotionSheet": promotionSheet-> {
        _id,
        title,
        description,
        "validLabel": dateRange,
        "pdfUrl": pdf.asset->url
      }
    }
`);

export const CURRENT_BAKERY_CATALOG_QUERY = defineQuery(/* groq */ `
  *[_type == "bakeryCatalog" && _id == "bakeryCatalog-main"][0] {
    _id,
    categories[] {
      _key,
      title,
      products[] { _key, name, price, note }
    }
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
    week == $week &&
    year == $year &&
    isArchived != true
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
      categoryOverride
    }
  }
`);
